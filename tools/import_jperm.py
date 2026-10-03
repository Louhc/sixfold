#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 jperm 的 PLL 清单并进 data/pll.json（一次性导入，不是常规管线的一部分）

两套来源（都已经抓成 JSON 放在 tools/data/ 下，各 21 个情况）：
  * `oh` —— https://jperm.net/algs/oh/pll 的数据文件 `/lib/ohpll.js`
    → `tools/data/jperm-oh-pll.json`（46 条），导入后标 `OH`
  * `2h` —— https://jperm.net/algs/pll 的数据文件 `/lib/pll.js`
    → `tools/data/jperm-pll.json`（55 条），导入后标 `2H`

规则（两套一样，只有「该给哪个标签」不同）：
  1. **查重**：先按 pll_db.alg_key 的指纹（忽略括号空白、R'2≡R2）跟库里已有的写法比；
     命中就只给那条补上对应的标签（比如库里是 2H、jperm 把它列在 OH 清单里 → 变成 2H+OH），
     **不新增重复条目**。
  2. jperm 有些条目**省了末尾的 AUF**（比如他们的 Jb 就比我们库里那条少一个 `U'`），
     直接进库过不了「照图摆好直接能用」的校验；按顺序试 无 / U / U' / U2 后缀，
     取第一个能通过的（补 AUF 之后常常还能和库里已有的写法对上，正好合并）。
  3. 校验判据和 pll_db.check 一致：把这个画面的局面做完公式要么复原、
     要么箭头模式和这个画面逐项一致。
  4. 新进的写法 uses=[标签]、tags=[]（不抢已有的 preferred / ohpll-preferred 首选）。
  5. **带 M 层的一律只算双手**：单手做 M 不现实（用户拍板），所以凡是用了 M/M'/M2 的写法，
     去掉 `OH`、补上 `["2H"]`（原来就有 2H 的保持不变），顺手摘掉 `ohpll-preferred`。
  6. 最后按「画面顺序 → 画面内顺序」给每个 case 重新连续编号。

用法：
    python3 tools/import_jperm.py               # 两套都只看计划，不落盘
    python3 tools/import_jperm.py --set 2h      # 只看双手那套
    python3 tools/import_jperm.py --apply       # 落盘（之后记得跑 emit_pages.py）
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pll_db as P, cubesim as sim, verify as V        # noqa: E402

DB = os.path.join(HERE, '..', 'data', 'pll.json')
SUF = ['', ' U', " U'", ' U2']
ORDER = ['2H', 'OH']
SETS = {
    'oh': (os.path.join(HERE, 'data', 'jperm-oh-pll.json'), 'OH'),
    '2h': (os.path.join(HERE, 'data', 'jperm-pll.json'), '2H'),
}
M_MOVE = re.compile(r"^M[2']?$")          # M / M' / M2
TYPO3 = re.compile(r"([RLUDFBxyzMESurldfb])3")   # `R3` 这种写法本意就是 R'（转三次）


def variants(alg):
    """原始写法 + 已知笔误的等价写法（`X3` → `X'`）；jperm 的 Ub 那条就写了 `R3`"""
    fixed = TYPO3.sub(r"\1'", alg)
    return [alg] if fixed == alg else [alg, fixed]


def strip_m_oh(data):
    """带 M 层的写法一律只算双手（单手做 M 不现实）—— 去掉 OH、补上 2H。
    返回改了哪些；库里原本就带 M 且只有 2H 的不动。"""
    changed = []
    for c in data['cases']:
        for v in c.get('views') or [c]:
            for a in v.get('algs') or []:
                if 'OH' not in a['uses']:
                    continue
                if not any(M_MOVE.match(t) for t in P.moves_of(a['alg'])):
                    continue
                # 注意括号：Python 里 `-` 比 `|` 先算，写成 a|b-c 会变成 a|(b-c)（踩过）
                a['uses'] = sorted((set(a['uses']) | {'2H'}) - {'OH'},
                                   key=lambda u: ORDER.index(u) if u in ORDER else 9)
                if 'ohpll-preferred' in (a.get('tags') or []):
                    a['tags'] = [t for t in a['tags'] if t != 'ohpll-preferred']
                changed.append((c['id'], a['alg']))
    return changed


def valid_views(case, alg):
    """这条公式能放进这个 case 的哪些画面（按 pll_db.check 的判据）。
    看不懂的写法（比如源数据里的笔误）一律当作「不能放」，不往外抛。"""
    sig, arr = [], []
    base = P.state_from_sig(case['views'][0]['sig'])
    perm0 = P.perm_of(base)
    try:
        st_alg = sim.case_of(V.clean(alg), 'pll')
    except Exception:
        st_alg = None
    got = P.arrows_of(P.perm_of(st_alg)) if st_alg else None
    for v in case['views']:
        st = P.state_from_sig(v['sig'])
        try:
            res = sim.apply(st, V.clean(alg))
        except Exception:
            res = None
        if res is not None and V.solved_rot(res):
            sig.append(v['view'])
        sk = P.turn_sigma(v['view'])
        want = frozenset((sk[j], sk[perm0[j]]) for j in range(8) if perm0[j] != j)
        if got is not None and got == want:
            arr.append(v['view'])
    return sig, arr


def find(case, alg):
    """返回 ('dup', 已有那条, '') / ('new', (画面号, 实际入库的公式), 备注) / (None, None, 原因)"""
    typos = [m.group(0) for m in TYPO3.finditer(alg)]
    for vi, var in enumerate(variants(alg)):
        note = []
        if vi:                                  # 这一版是笔误修正（X3 → X'）
            note += ['原数据 %s → %s' % (t, t[:-1] + "'") for t in typos]
        for suf in SUF:
            cand = var + suf
            key = P.alg_key(cand)
            for v in case['views']:
                for a in v['algs']:
                    if P.alg_key(a['alg']) == key:
                        return ('dup', a, '')
            sig, arr = valid_views(case, cand)
            if sig or arr:
                if suf:
                    note.append('补末尾 %s' % suf.strip())
                return ('new', ((sig or arr)[0], cand), '、'.join(note))
    # 前缀 AUF：库里约定「公式不带 AUF」，**只有 Na/Nb 例外**（自带的首个 U/U'，见 AGENTS §4.4）
    if case['id'] in ('Na', 'Nb'):
        for pre in ["U' ", 'U ', 'U2 ']:
            cand = pre + alg
            key = P.alg_key(cand)
            for v in case['views']:
                for a in v['algs']:
                    if P.alg_key(a['alg']) == key:
                        return ('dup', a, '')
            sig, arr = valid_views(case, cand)
            if sig or arr:
                return ('new', ((sig or arr)[0], cand), '补开头 %s' % pre.strip())
    return (None, None, '对不上任何画面（源数据可能有笔误）')


def run_set(data, by, which, apply):
    """跑一套来源，返回 (新增条数, 统计, 没进来的)"""
    path, tag = SETS[which]
    src = json.load(open(path, encoding='utf-8'))['cases']
    print('\n=== %s：%s（导入后标 %s） ===' % (which, os.path.basename(path), tag))
    stat = {'dup': 0, 'dup+tag': 0, 'dup+M': 0, 'new': 0, 'auf': 0, 'skip': 0}
    added, skipped = 0, []
    for e in src:
        case = by.get(e['name'])
        if not case:
            print('!! 库里没有这个情况：%s' % e['name'])
            continue
        for raw in e['alg']:
            kind, hit, note = find(case, raw)
            if kind == 'dup':
                has_tag = tag in hit['uses']
                is_m = any(M_MOVE.match(t) for t in P.moves_of(hit['alg']))
                if has_tag:
                    stat['dup'] += 1
                elif tag == 'OH' and is_m:
                    # 带 M 的一律只算双手（最后那步 strip_m_oh 会摘掉 OH）—— 这里就别再加了
                    stat['dup+M'] += 1
                    print('%-8s %-3s %s' % ('dup+M', e['name'], raw))
                    continue
                else:
                    stat['dup+tag'] += 1
                    if apply:
                        hit['uses'] = sorted(set(hit['uses']) | {tag},
                                             key=lambda u: ORDER.index(u) if u in ORDER else 9)
                        hit['verified'] = (hit.get('verified', '') + '｜来源 jperm PLL').strip('｜')
                print('%-8s %-3s %s' % ('dup' if has_tag else 'dup+' + tag, e['name'], raw))
                continue
            if kind == 'new':
                view, cand = hit
                stat['new'] += 1
                if '补末尾' in note:
                    stat['auf'] += 1
                print('%-8s %-3s %-44s → v%d%s'
                      % ('new', e['name'], cand[:44], view, '（%s）' % note if note else ''))
                if apply:
                    mv = P.moves_of(cand)
                    case['views'][view]['algs'].append({
                        'no': 0, 'alg': cand, 'moves': mv, 'n': len(mv),
                        'uses': [tag], 'tags': [],
                        'verified': ('jperm PLL' + ('（%s）' % note if note else ''))})
                    added += 1
                continue
            stat['skip'] += 1
            skipped.append((e['name'], raw, note))
            print('%-8s %-3s %-44s  %s' % ('skip', e['name'], raw[:44], note))
    print('统计（%s）：%s' % (which, stat))
    if skipped:
        print('没进来的：%s' % skipped)
    return added, stat, skipped


def main(apply=False, which=None):
    which = which or ['oh', '2h']
    data = json.load(open(DB, encoding='utf-8'))
    by = {c['id']: c for c in data['cases']}
    total, auf = 0, 0
    for w in which:
        a, stat, _ = run_set(data, by, w, apply)
        total += a
        auf += stat['auf']
    # 带 M 的一律只算双手（试算：apply=False 时也先算出来）
    m_changed = strip_m_oh(data)
    if m_changed:
        for cid, alg in m_changed:
            print('带 M → 只算双手（去掉 OH）：%-3s %s' % (cid, alg))
    if not apply:
        if m_changed:
            print('（上面这些会在 --apply 时改成 2H；本次没落盘）')
        print('\n（这只是计划，加 --apply 才落盘）')
        return
    if m_changed:
        print('带 M 层改成 2H 的：%d 条' % len(m_changed))
    for c in data['cases']:                     # case 内重新连续编号
        n = 0
        for v in c.get('views') or [c]:
            for a in v.get('algs') or []:
                n += 1
                a['no'] = n
    with open(DB, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('写入 data/pll.json：新增 %d 条（其中 %d 条补了 AUF）；跑一下 emit_pages.py' % (total, auf))


if __name__ == '__main__':
    pick = None
    if '--set' in sys.argv:
        pick = [sys.argv[sys.argv.index('--set') + 1]]
        assert pick[0] in SETS, '未知的 --set：%s（可选 %s）' % (pick[0], ' / '.join(SETS))
    main(apply='--apply' in sys.argv, which=pick)
