"""OLL 公式库：data/oll.json 的生成与校验。

结构（和 PLL 同形，三层 cases → views → algs）：
    case = 一个 OLL 情况（顶面图案）；view = 一个画面；alg = 这个画面下的写法。
    OLL 的图是**顶层俯视图**，一个情况只有一个基准画面，所以每个 case 只有 view 0；
    「白天紫顶 / 夜晚黄顶」是同一个画面的两套配色，落在 img-day / img-night 两个字段上。

sig 是图和数据之间唯一的尺子：
    signature.py 从**图**里读出 (顶面 9 格, 侧边 12 划线)，cubesim.sig_str 从**公式**算出同格式的串。
    校验方向：公式所解的局面（case_of 已经处理过公式开头的整体转体）的 4 个 AUF 里
    必须有图的那个签名，且主式必须正好对上（差一步 AUF 都不行）。

用法:
    python3 tools/oll_db.py --build     # 从 oll.html 字面量 + img/oll/ 图重建 data/oll.json
    python3 tools/oll_db.py --check     # 只校验（默认）
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cubesim as sim                      # noqa: E402
import signature as sig                    # noqa: E402
import verify as V                         # noqa: E402
import pll_db as P                         # noqa: E402  （复用 moves_of）

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, 'data', 'oll.json')
LIB = os.path.join(ROOT, 'tools', 'data', 'oll.js')

# 页面上的四个分组（key 给数据用，title 就是页面上那行标题）
GROUPS = [
    ('cross', '顶面「十字」'),
    ('dot', '顶面「单点」'),
    ('line', '顶面「一字」'),
    ('corner', '顶面「拐角」'),
]


def page_sections(page):
    """读页面字面量里的分节（保留分组顺序与标题）。

    只在 `--build` 时用：页面改成由库生成之后这里就读不到了 ——
    和 pll_db.py --build 一样，这是一次性的 bootstrap。
    """
    h = open(page, encoding='utf-8').read()
    m = re.search(r'var SECTIONS = (\[.*?\n\]);', h, re.S)
    if not m:
        return []
    return json.loads(m.group(1))


def img_paths(cid, view):
    """图名：OLL 编号补零成两位（'1' -> oll-01-…），再带角度 -v<角度>"""
    f = ('0' + cid) if cid.isdigit() and len(cid) < 2 else cid
    stem = 'img/oll/oll-%s-v%d' % (f, view)
    return {'img-day': stem + '-day-256x256.png',
            'img-night': stem + '-night-256x256.png'}


# 画面：同一个情况按顶层 U^k 转出来的样子（frame 只是给这个角度起个名）
FRAMES = ['', 'y', 'y2', "y'"]


def views_of(cid, base, algs):
    """把一个情况展开成 U^k 的**去重**画面（签名一样就并掉，对称情况会少于 4 个）。

    只有基准画面（第一个）挂写法 —— 库里的写法都是「照基准图摆好直接用」的。
    """
    seen, out = [], []
    for k in range(4):
        sg = list(sim.sig_str(sim.turn(base, 'U', k)))
        if sg in seen:
            continue
        seen.append(sg)
        v = {'view': len(out), 'frame': FRAMES[k], 'sig': sg}
        v.update(img_paths(cid, len(out)))
        v['algs'] = list(algs) if not out else []
        out.append(v)
    return out


# ---------------- 生成 ----------------

def build():
    """把每个情况展开成 U^k 去重后的画面，并重写图路径。

    页面已经没有 SECTIONS 字面量了，所以公式从**现有库**里取（每个情况的全部写法）——
    这是一次性的结构升级；以后再改公式直接改库。
    """
    data = json.load(open(DB, encoding='utf-8'))
    for c in data['cases']:
        algs = [a for v in c['views'] for a in v['algs']]
        if not algs:
            raise SystemExit('%s：库里没有写法，展开不了画面' % c['id'])
        base = sim.case_of(V.clean(algs[0]['alg']), 'oll')
        if base is None:
            raise SystemExit('%s：%s 不是合法 OLL 公式' % (c['id'], algs[0]['alg']))
        c['views'] = views_of(c['id'], base, algs)
    with open(DB, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('写出 %s：%d 个情况 / %d 个画面（去重后）/ %d 条公式'
          % (os.path.relpath(DB, ROOT), len(data['cases']),
             sum(len(c['views']) for c in data['cases']),
             sum(len(v['algs']) for c in data['cases'] for v in c['views'])))
    return 0


# ---------------- 校验 ----------------

def check(path=DB):
    print('=== %s ===' % os.path.relpath(path, ROOT))
    data = json.load(open(path, encoding='utf-8'))
    bad = []
    if data.get('set') != 'oll' or data.get('v') != 1:
        bad.append('set/v 不对：%r' % {k: data.get(k) for k in ('set', 'v')})
    gkeys = [g['key'] for g in data.get('groups', [])]
    gtitles = {g['key']: g['title'] for g in data.get('groups', [])}
    if len(set(gkeys)) != len(gkeys) or not gkeys:
        bad.append('groups 的 key 不唯一 / 为空')
    seen_id = set()
    ngroups = {k: 0 for k in gkeys}
    nalg = 0
    nview = 0
    for c in data['cases']:
        cid = c['id']
        if cid in seen_id:
            bad.append('%s：id 重复' % cid)
        seen_id.add(cid)
        if c.get('group') not in gkeys:
            bad.append('%s：group %r 不在 groups 里' % (cid, c.get('group')))
        else:
            ngroups[c['group']] += 1
        if not (cid.isdigit() and 1 <= int(cid) <= 57):
            bad.append('%s：编号不是 1..57' % cid)
        views = c['views']
        if not views:
            bad.append('%s：一个画面都没有' % cid)
            continue
        # 1) 每个画面：两版图都在、读回来 == 自己那条 sig、路径带对了角度
        for v in views:
            nview += 1
            if v.get('view') != views.index(v):
                bad.append('%s：view 序号不是 0..n-1' % cid)
            f = ('0' + cid) if cid.isdigit() and len(cid) < 2 else cid
            want_stem = 'img/oll/oll-%s-v%d' % (f, v['view'])
            if not str(v.get('img-day', '')).startswith(want_stem):
                bad.append('%s view%d：图路径 %s 和角度对不上' % (cid, v['view'], v.get('img-day')))
            want = list(v.get('sig') or [])
            for k in ('img-day', 'img-night'):
                p = os.path.join(ROOT, v.get(k, ''))
                if not os.path.exists(p):
                    bad.append('%s view%d：缺图 %s' % (cid, v['view'], v.get(k)))
                    continue
                got = sig.read('oll', p)
                if got != tuple(want):        # read 回来是元组，库里存的是列表
                    bad.append('%s view%d：%s 签名 %s ≠ sig %s' % (cid, v['view'], k, got, want))
        # 2) 画面序列 == 基准局面按 U^k 去重的结果（漏了 / 多了 / 顺序乱了都拦）
        base_alg = views[0]['algs'][0]['alg'] if views[0]['algs'] else None
        if base_alg is None:
            bad.append('%s：基准画面没有写法' % cid)
            continue
        base = sim.case_of(V.clean(base_alg), 'oll')
        if base is None:
            bad.append('%s：%s 不是合法 OLL 公式' % (cid, base_alg))
            continue
        seen, orbit = [], []
        for k in range(4):
            sg = list(sim.sig_str(sim.turn(base, 'U', k)))
            if sg in seen:
                continue
            seen.append(sg)
            orbit.append(sg)
        if [list(v['sig']) for v in views] != orbit:
            bad.append('%s：画面序列 %s 与按 U 去重算出的 %s 不一致'
                       % (cid, [''.join(v['sig'][0]) for v in views],
                          [''.join(s2[0]) for s2 in orbit]))
        # 3) 写法：只挂在基准画面上；每条都是合法 OLL，且签名正好是本画面的
        want0 = list(views[0]['sig'])
        for v in views[1:]:
            if v.get('algs'):
                bad.append('%s view%d：非基准画面不该挂写法' % (cid, v['view']))
        algs = views[0]['algs']
        nos = [a.get('no') for v in views for a in v.get('algs') or []]
        if nos != list(range(1, len(nos) + 1)):
            bad.append('%s：写法编号 %r 不是 case 内唯一的 1..%d' % (cid, nos, len(nos)))
        for i, a in enumerate(algs, 1):
            nalg += 1
            if a.get('no') != i:
                bad.append('%s/%s：no 不是 %d' % (cid, a.get('alg'), i))
            if a.get('n') != len(a.get('moves') or []):
                bad.append('%s/%s：n 与 moves 不一致' % (cid, a.get('alg')))
            st = sim.case_of(V.clean(a['alg']), 'oll')
            if st is None:
                bad.append('%s/%s：不是合法的 OLL 公式' % (cid, a['alg']))
                continue
            k = [list(sim.sig_str(sim.turn(st, 'U', j))) for j in range(4)]
            if want0 not in k:
                bad.append('%s/%s：签名不在公式的 4 个 AUF 里' % (cid, a['alg']))
            elif k.index(want0) != 0:
                bad.append('%s/%s：差 %d 步 AUF（照图摆好还不能直接用）'
                           % (cid, a['alg'], k.index(want0)))
        print('  %-3s %-10s %-12s %d 个画面  %s'
              % (cid, c.get('name', ''), gtitles.get(c.get('group'), ''), len(views),
                 ' '.join('v%d(%s)' % (v['view'], ''.join(v['sig'][0])) for v in views[:3])
                 + (' …' if len(views) > 3 else '')))
    missing = sorted(set(str(n) for n in range(1, 58)) - seen_id)
    if missing:
        bad.append('缺情况：%s' % ', '.join(missing))
    print('  分组：%s'
          % ' / '.join('%s %d' % (gtitles.get(k, k), ngroups[k]) for k in gkeys))
    print('  %d 个情况 / %d 个画面 / %d 条公式，%s'
          % (len(data['cases']), nview, nalg,
             '全部通过 ✓' if not bad else '%d 条有问题' % len(bad)))
    for b in bad:
        print('    ✗ ' + b)
    return 1 if bad else 0


def main(argv):
    if '--build' in argv:
        return build()
    return check()


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
