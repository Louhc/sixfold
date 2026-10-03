#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 jperm 的公式清单并进 data/pll.json / data/oll.json（一次性导入，不是常规管线的一部分）

四套来源（都已经抓成 JSON 放在 tools/data/ 下）：
  * `oh` —— https://jperm.net/algs/oh/pll 的数据文件 `/lib/ohpll.js`
    → `tools/data/jperm-oh-pll.json`（21 情况 / 46 条）→ `data/pll.json`，导入后标 `OH`
  * `2h` —— https://jperm.net/algs/pll 的数据文件 `/lib/pll.js`
    → `tools/data/jperm-pll.json`（21 / 55）→ `data/pll.json`，导入后标 `2H`
  * `oll` —— https://jperm.net/algs/oll 的数据文件 `/lib/oll.js`
    → `tools/data/jperm-oll.json`（57 / 98）→ `data/oll.json`，导入后标 `2H`
  * `oholl` —— https://jperm.net/algs/oh/oll 的数据文件 `/lib/oholl.js`
    → `tools/data/jperm-oh-oll.json`（57 / 91）→ `data/oll.json`，导入后标 `OH`，
      每个情况的第一条打 `oholl-preferred`（单手 OLL 页默认显示的那条）

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
  6. **开头带 y / y' / y2 的一律化到画面里去**：开头带 y 是有语义的，但那正说明它属于另一个画面 ——
     去掉 y、按去掉后的写法归到那个画面；去掉之后哪个画面都对不上的直接丢掉（见 AGENTS §4.4）。
  7. OLL 的写法挂在**它自己所属的那个画面**上（判据：公式局面的签名 == 该画面的 sig，AUF 0）。
  8. 最后按「画面顺序 → 画面内顺序」给每个 case 重新连续编号。

用法：
    python3 tools/import_jperm.py                    # 四套都只看计划，不落盘
    python3 tools/import_jperm.py --set 2h           # 只看双手 PLL 那套
    python3 tools/import_jperm.py --set oholl        # 只看单手 OLL 那套
    python3 tools/import_jperm.py --set oh,2h,oll,oholl --apply   # 落盘（之后跑 emit_pages.py）
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pll_db as P, cubesim as sim, verify as V        # noqa: E402

ROOT = os.path.dirname(HERE)          # 仓库根（SETS 里的 db 是相对它写的）
DB = os.path.join(HERE, '..', 'data', 'pll.json')
SUF = ['', ' U', " U'", ' U2']
ORDER = ['2H', 'OH']
# 每套来源：源数据文件 / 导入后给的标签 / 目标是哪本库 / 库里长什么样（pll 有画面层，oll 只有基准画面）
SETS = {
    'oh':  {'src': 'jperm-oh-pll.json', 'tag': 'OH', 'db': 'data/pll.json', 'kind': 'pll',
            'label': 'jperm OH PLL'},
    '2h':  {'src': 'jperm-pll.json',    'tag': '2H', 'db': 'data/pll.json', 'kind': 'pll',
            'label': 'jperm PLL'},
    'oll': {'src': 'jperm-oll.json',    'tag': '2H', 'db': 'data/oll.json', 'kind': 'oll',
            'label': 'jperm OLL'},
    'oholl': {'src': 'jperm-oh-oll.json', 'tag': 'OH', 'db': 'data/oll.json', 'kind': 'oll',
              'label': 'jperm OH OLL', 'preferred': 'oholl-preferred'},
}
M_MOVE = re.compile(r"^M[2']?$")          # M / M' / M2
Y_LEAD = re.compile(r"^\s*y(?:2|'|'2)?\s*")   # 写法**开头**的整体转体 y / y' / y2
TYPO3 = re.compile(r"([RLUDFBxyzMESurldfb])3")   # `R3` 这种写法本意就是 R'（转三次）


def variants(alg):
    """原始写法 + 已知笔误的等价写法（`X3` → `X'`）；jperm 的 Ub 那条就写了 `R3`"""
    fixed = TYPO3.sub(r"\1'", alg)
    return [alg] if fixed == alg else [alg, fixed]


def strip_m_oh(data):
    """带 M 层的写法一律只算双手（单手做 M 不现实）—— 去掉 OH、补上 2H。
    顺手摘掉「单手首选」标签（ohpll-preferred / oholl-preferred），
    后面 mark_preferred() 会把它补给这个情况另一条单手写法。
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
                drop = {'ohpll-preferred', 'oholl-preferred'}
                if drop & set(a.get('tags') or []):
                    a['tags'] = [t for t in a['tags'] if t not in drop]
                changed.append((c['id'], a['alg']))
    return changed


def mark_preferred(data, pref, label):
    """给每个情况补上「单手首选」标签（这个情况还没有的话，挑第一条来自 `label` 的单手写法）。
    返回标了哪些情况。"""
    marked = []
    for c in data['cases']:
        views = c.get('views') or [c]
        all_algs = [a for v in views for a in (v.get('algs') or [])]
        if any(pref in (a.get('tags') or []) for a in all_algs):
            continue
        pick = None
        for a in all_algs:
            if 'OH' in a.get('uses', []) and label in (a.get('verified') or ''):
                pick = a
                break
        if pick is None:
            continue
        pick['tags'] = sorted(set(pick.get('tags') or []) | {pref})
        marked.append(c['id'])
    return marked


def strip_lead_y(data, kind):
    """把写法**开头**的 y / y' / y2 化到画面里去。

    开头带 y 的写法是有语义的（去掉之后 case 就变了），但那正好说明**它本来就属于别的画面** ——
    画面已经表达了这次转体，公式里再写一遍是多余的（用户拍板：公式不该以 y/y'/y2 开头）。
    所以：去掉它、按去掉后的写法归到正确的画面；同一画面里因此变成同一条的合并。
    返回改了哪些：(情况, 去掉 y 之后的写法, 搬到哪个画面)。"""
    changed, dropped = [], []
    for c in data['cases']:
        views = c.get('views') or [c]
        bynum = {v.get('view', 0): v for v in views}
        moved = []
        for v in views:
            keep = []
            for a in v.get('algs') or []:
                if not Y_LEAD.match(a['alg']):
                    keep.append(a)
                    continue
                cand = Y_LEAD.sub('', a['alg']).strip()
                a['alg'] = cand
                a['moves'] = P.moves_of(cand)
                a['n'] = len(a['moves'])
                a['verified'] = (a.get('verified', '') +
                                 '｜去掉开头的 y（它属于哪个画面由画面表达）').strip('｜')
                if kind == 'oll':
                    m = oll_view(c, cand)
                else:
                    sig, arr = valid_views(c, cand)
                    m = (sig or arr)[0] if (sig or arr) else None
                if m is None:
                    # 去掉 y 之后哪个画面都对不上 —— 说明这条 y 版是「只能这么写」的：
                    # 用户要求公式不带开头 y，那就别留这条（留着也过不了 check）
                    dropped.append((c['id'], a['alg'], cand))
                    continue
                changed.append((c['id'], cand, m))
                if m == v.get('view', 0):
                    keep.append(a)                  # 去掉 y 之后还是原来那个画面
                else:
                    moved.append((m, a))
            v['algs'] = keep
        for m, a in moved:
            bynum[m].setdefault('algs', []).append(a)
        for v in views:                             # 同一画面里变成同一条的合并
            out, seen = [], {}
            for a in v.get('algs') or []:
                k = P.alg_key(a['alg'])
                if k in seen:
                    tgt = seen[k]
                    tgt['uses'] = sorted(set(tgt.get('uses', [])) | set(a.get('uses', [])),
                                         key=lambda u: ORDER.index(u) if u in ORDER else 9)
                    tgt['tags'] = sorted(set(tgt.get('tags', [])) | set(a.get('tags', [])))
                    tgt['verified'] = tgt.get('verified') or a.get('verified')
                    continue
                seen[k] = a
                out.append(a)
            v['algs'] = out
    return changed, dropped


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


def oll_view(case, alg):
    """这条 OLL 写法属于**哪个画面**（找不到返回 None）。

    判据和 oll_db.check 一致：公式局面的签名正好等于某个画面的 sig（AUF 0）。
    开头带 y / y' 的写法天然属于别的画面（`y' F R U R' U' F' f R U R' U' f'` → v1），
    所以**不去 v0 硬塞一个 U**，直接归到它自己那个画面（用户拍板）。"""
    try:
        st = sim.case_of(V.clean(alg), 'oll')
    except Exception:
        st = None
    if st is None:
        return None
    try:
        k0 = list(sim.sig_str(st))
    except Exception:
        return None
    for v in case['views']:
        if list(v['sig']) == k0:
            return v['view']
    return None


def candidates(alg, kind, case):
    """按优先级列出要试的写法 + 备注。

    - 先原样、再补**末尾** AUF（jperm 有些条目省了末尾那一步）；
    - OLL 还要试**开头** AUF：我们的画面和 jperm 的画面有时差一个 U
      （比如 OLL 26 的 `R U2 R' U' R U' R'`，加个开头的 `U` 才「照图摆好直接用」）；
    - PLL 的前缀 AUF 只有 Na/Nb 例外（自带首个 U/U'，见 AGENTS §4.4）。"""
    typos = [m.group(0) for m in TYPO3.finditer(alg)]
    # 开头带 y 的：**只在去掉 y 之后的形式上找**（存进库的公式不该以 y 开头，见 AGENTS §4.4）——
    # 去掉之后对不上任何画面的，这条就不留（不把 y 版塞回去）
    yhead = bool(Y_LEAD.match(alg))
    base = Y_LEAD.sub('', alg).strip() if yhead else alg
    out = []
    for vi, var in enumerate(variants(base)):
        head = (['去掉开头的 y（它属于哪个画面由画面表达）'] if yhead else []) + \
               (['原数据 %s → %s' % (t, t[:-1] + "'") for t in typos] if vi else [])
        for suf in SUF:
            note = list(head)
            if suf:
                note.append('补末尾 %s' % suf.strip())
            out.append((var + suf, '、'.join(note)))
    pre = ['U ', "U' ", 'U2 '] if kind == 'oll' else \
          (["U' ", 'U ', 'U2 '] if case['id'] in ('Na', 'Nb') else [])
    for p in pre:
        out.append((p + alg, '补开头 %s' % p.strip()))
    return out


def find(case, alg, kind='pll'):
    """返回 ('dup', 已有那条, '') / ('new', (画面号, 实际入库的公式), 备注) / (None, None, 原因)"""
    for cand, note in candidates(alg, kind, case):
        key = P.alg_key(cand)
        for v in case['views']:
            for a in v['algs']:
                if P.alg_key(a['alg']) == key:
                    return ('dup', a, '')
        if kind == 'oll':
            m = oll_view(case, cand)
            if m is not None:
                if m != 0 and not note:
                    note = '归到 v%d%s' % (m, '；开头带 y' if re.match(r"^\s*y", cand) else '')
                return ('new', (m, cand), note)
            continue
        sig, arr = valid_views(case, cand)
        if sig or arr:
            return ('new', ((sig or arr)[0], cand), note)
    if Y_LEAD.match(alg):
        return (None, None, '开头带 y：去掉之后对不上任何画面（这条不留，见 AGENTS §4.4）')
    return (None, None, '对不上任何画面（源数据可能有笔误）')


def run_set(data, by, which, apply):
    """跑一套来源，返回 (新增条数, 统计, 没进来的)"""
    cfg = SETS[which]
    path, tag, kind = os.path.join(HERE, 'data', cfg['src']), cfg['tag'], cfg['kind']
    src = json.load(open(path, encoding='utf-8'))['cases']
    print('\n=== %s：%s（导入后标 %s；形状 %s） ==='
          % (which, cfg['src'], tag, '按画面' if kind == 'pll' else '只有基准画面'))
    stat = {'dup': 0, 'dup+tag': 0, 'dup+M': 0, 'new': 0, 'auf': 0, 'skip': 0}
    added, skipped = 0, []
    for e in src:
        cid = str(e['name'])                 # jperm 的 OLL 情况名是数字（1..57），库里是字符串
        case = by.get(cid)
        if not case:
            print('!! 库里没有这个情况：%s' % cid)
            continue
        for raw in e['alg']:
            res, hit, note = find(case, raw, kind)
            if res == 'dup':
                has_tag = tag in hit['uses']
                is_m = any(M_MOVE.match(t) for t in P.moves_of(hit['alg']))
                if has_tag:
                    stat['dup'] += 1
                elif tag == 'OH' and is_m:
                    # 带 M 的一律只算双手（最后那步 strip_m_oh 会摘掉 OH）—— 这里就别再加了
                    stat['dup+M'] += 1
                    print('%-8s %-3s %s' % ('dup+M', cid, raw))
                    continue
                else:
                    stat['dup+tag'] += 1
                    if apply:
                        hit['uses'] = sorted(set(hit['uses']) | {tag},
                                             key=lambda u: ORDER.index(u) if u in ORDER else 9)
                        hit['verified'] = (hit.get('verified', '') + '｜来源 ' + cfg['label']).strip('｜')
                print('%-8s %-3s %s' % ('dup' if has_tag else 'dup+' + tag, cid, raw))
                continue
            if res == 'new':
                view, cand = hit
                stat['new'] += 1
                if '补末尾' in note or '补开头' in note:
                    stat['auf'] += 1
                print('%-8s %-3s %-44s → v%d%s'
                      % ('new', cid, cand[:44], view, '（%s）' % note if note else ''))
                if apply:
                    mv = P.moves_of(cand)
                    case['views'][view]['algs'].append({
                        'no': 0, 'alg': cand, 'moves': mv, 'n': len(mv),
                        'uses': [tag], 'tags': [],
                        'verified': (cfg['label'] + ('（%s）' % note if note else ''))})
                    added += 1
                continue
            stat['skip'] += 1
            skipped.append((cid, raw, note))
            print('%-8s %-3s %-44s  %s' % ('skip', cid, raw[:44], note))
    print('统计（%s）：%s' % (which, stat))
    if skipped:
        print('没进来的：%s' % skipped)
    return added, stat, skipped


def main(apply=False, which=None):
    which = which or list(SETS)
    # 按目标库分组（pll 一套、oll 一套），各自加载 / 跑 / 重新编号 / 写回
    dbs = []
    for w in which:
        if SETS[w]['db'] not in dbs:
            dbs.append(SETS[w]['db'])
    total, auf = 0, 0
    todo = []
    for db in dbs:
        data = json.load(open(os.path.join(ROOT, db), encoding='utf-8'))
        by = {c['id']: c for c in data['cases']}
        todo.append((db, data))
        for w in [x for x in which if SETS[x]['db'] == db]:
            a, stat, _ = run_set(data, by, w, apply)
            total += a
            auf += stat['auf']
        kind = SETS[[x for x in which if SETS[x]['db'] == db][0]]['kind']
        y_changed, y_dropped = strip_lead_y(data, kind)   # 开头带 y/y'/y2 的：化到画面里去
        for cid, alg, m in y_changed:
            print('去掉开头的 y → %-3s %-40s 搬到 v%d' % (cid, alg[:40], m))
        for cid, alg, cand in y_dropped:
            print('去掉开头的 y 之后哪都放不下 → 丢掉：%-3s %s（去掉 y 是 %s）' % (cid, alg, cand))
        if not apply and y_changed:
            print('（上面这些会在 --apply 时落盘）')
        # 带 M 的写法只算双手（两本库都适用；顺手摘掉单手首选标签）
        m_changed = strip_m_oh(data)
        if m_changed:
            for cid, alg in m_changed:
                print('带 M → 只算双手（去掉 OH）：%-3s %s' % (cid, alg))
            if not apply:
                print('（上面这些会在 --apply 时改成 2H；本次没落盘）')
            else:
                print('带 M 层改成 2H 的：%d 条' % len(m_changed))
        # 每个情况补一条「单手首选」（来源自带 preferred 的那几套）
        for w in [x for x in which if SETS[x]['db'] == db]:
            pref, label = SETS[w].get('preferred'), SETS[w]['label']
            if not pref:
                continue
            marked = mark_preferred(data, pref, label)
            print('%s：给 %d 个情况标了 %s 首选' % (w, len(marked), pref))
            if not apply:
                print('（上面这些标签会在 --apply 时落盘）')
    if not apply:
        print('\n（这只是计划，加 --apply 才落盘）')
        return
    for db, data in todo:
        for c in data['cases']:                 # case 内重新连续编号
            n = 0
            for v in c.get('views') or [c]:
                for a in v.get('algs') or []:
                    n += 1
                    a['no'] = n
        with open(os.path.join(ROOT, db), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print('写入 %s' % db)
    print('共新增 %d 条（其中 %d 条补了 AUF）；跑一下 emit_pages.py' % (total, auf))


if __name__ == '__main__':
    pick = None
    if '--set' in sys.argv:
        pick = [x for x in sys.argv[sys.argv.index('--set') + 1].split(',') if x]
        assert pick[0] in SETS, '未知的 --set：%s（可选 %s）' % (pick[0], ' / '.join(SETS))
    main(apply='--apply' in sys.argv, which=pick)
