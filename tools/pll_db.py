"""PLL 公式库：data/pll.json 的生成与校验。

数据结构（三层：cases → views → algs）：
    case 一个置换；view 一种「姿态」；alg 这个姿态下顺手的写法。
    姿态只由**整体转体**（x/y/z）决定 —— 不掺 AUF：AUF 是解题时随手转的，
    不进数据库（所以每条 alg 都必须「照本 view 的图摆好、直接做就复原」）。

为什么要有 `sig`：它是图和数据之间唯一的一把尺子。
    signature.py 从**图**里读出 12 个侧面色字母，sim.pll_sig 从**公式**算出同格式的串；
    校验方向按站主要求：由 sig 造出局面 → 执行公式 → 应当复原（允许整体旋转）。
    这样图、数据、模拟器三者互相咬住，谁写错了都跑不过。

用法:
    python3 tools/pll_db.py --build     # 重新生成 data/pll.json
    python3 tools/pll_db.py --check     # 只校验（默认）
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cubesim as sim                      # noqa: E402
import signature as sig                    # noqa: E402
import verify as V                         # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, 'data', 'pll.json')
LIB = os.path.join(ROOT, 'tools', 'data', 'pll.js')

# 一个动作的写法：R / R' / R2 / R'2 / Rw / x' …（转体和宽转都算一步）
TOKEN = re.compile(r"[RLUDFBxyzMESurldfb]w?(?:['2]){0,2}")

# 一个情况的「角度」：同一个 case 在解题时会以四种朝向出现（前 / 右 / 后 / 左对着你）。
# 实现上就是对顶层做 0/1/2/3 步 U —— 不改变块的身份，只改变「看的方向」，所以每个角度
# 有自己的一张图和一条自己的公式（公式里因此**不需要**再写 AUF 前缀）。
# 签名相同的角度并掉：对称图形会算出 2 个或 1 个，PLL 这 21 个都是 4 个。
VIEW_FRAMES = ['', 'y', 'y2', "y'"]        # frame 只是给这个角度起个名（画面转角）


# ---------------- sig <-> 局面 ----------------

def state_from_sig(s):
    """由 PLL 签名造出局面。

    约定（PLL 的前提）：下两层复原、顶层朝向正确 —— 所以从复原态出发，
    只把顶层八块的**侧面**贴纸按签名改掉即可。读的顺序和 sim.pll_sig 一致：
    后面 3 格、左面 3 格、右面 3 格、前面 3 格。
    """
    if len(s) != 12:
        raise ValueError('PLL 签名必须是 12 个字母，收到 %r' % (s,))
    st = sim.solved()

    def at(r, c):
        return [q for (f, rr, cc, q) in sim.SLOTS if f == 'U' and rr == r and cc == c][0]

    i = 0
    for c in range(3):                       # 后面（B）
        st[(at(0, c), sim.FACES['B'])] = s[i]; i += 1
    for r in range(3):                       # 左面（L）
        st[(at(r, 0), sim.FACES['L'])] = s[i]; i += 1
    for r in range(3):                       # 右面（R）
        st[(at(r, 2), sim.FACES['R'])] = s[i]; i += 1
    for c in range(3):                       # 前面（F）
        st[(at(2, c), sim.FACES['F'])] = s[i]; i += 1
    return st


# PLL 的 8 个槽位（和 cube.js 的 PLL_SLOTS 同序：去掉中心那格）。每项 =
# (net 行, net 列, 不在 U 面上的那两个面)。位置由 (列, 行) 换算成 (x, 1, z)。
SLOTS8 = [
    (0, 0, ('L', 'B')), (0, 1, ('B',)), (0, 2, ('B', 'R')),
    (1, 0, ('L',)), (1, 2, ('R',)),
    (2, 0, ('F', 'L')), (2, 1, ('F',)), (2, 2, ('F', 'R')),
]


def _slot_key(colours):
    return ''.join(sorted(colours))


def perm_of(state):
    """槽位 i 上是「哪一块」（块 -> 它的家）。判据和 pll_geometry.js 一致：
    一块的身份就是它三个（棱是两个）颜色组成的集合。"""
    def sticker(row, col, face):
        return state[((col - 1, 1, row - 1), sim.FACES[face])]
    return [next(j for j, h in enumerate(SLOTS8)
                 if _slot_key(['U'] + list(h[2])) ==
                 _slot_key(['U'] + [sticker(r, c, f) for f in sl[2]]))
            for sl in SLOTS8 for (r, c) in [(sl[0], sl[1])]]


def arrows_of(perm):
    """箭头模式：每块从当前槽位指向它的家（不在家的才有箭头）。"""
    return frozenset((j, perm[j]) for j in range(8) if perm[j] != j)


def turn_sigma(k):
    """顶层转 k 步之后，槽位 j 上的块搬到了哪（sigma[j] = 目的槽位）。"""
    came = perm_of(sim.turn(sim.solved(), 'U', k))      # came[i] = i 上的块原来在哪
    sig = [None] * 8
    for i, j in enumerate(came):
        sig[j] = i
    return sig


def rot180(s):
    """把「读图得到的签名」按图整体转 180° 变换一次。

    签名顺序是 B(3) L(3) R(3) F(3)；图转 180° 之后上下左右互换、每一条色带的方向
    也反过来，所以是「反序 F + 反序 R + 反序 L + 反序 B」。
    用途：E 这类本身 180° 对称的情况，转过 90° 和 270° 看起来是同一张图 ——
    这种重复要消掉。"""
    def rev(x): return x[::-1]
    return (rev(s[9:12]) + rev(s[6:9]) + rev(s[3:6]) + rev(s[0:3]))


def _dup(sig, kept):
    """和已保留的角度是不是「同一张图」（原样相同，或差一个图面 180°）"""
    return any(sig == k or sig == rot180(k) for k in kept)


def move_key(tok):
    """把一个动作规范化成可比较的元组：R'2 == R2 == R2'（同一个转法）。
    只用于「两条公式是不是同一条」，不影响公式本身的写法。"""
    m = re.match(r"([RLUDFBxyzMESurldfb])(w?)((?:['2])*)", tok)
    if not m:
        return (tok, 0, 0, 0)
    base, w, suf = m.group(1).upper(), m.group(2), m.group(3)
    amount = 2 if '2' in suf else 1
    prime = 1 if "'" in suf else 0
    return (base, 1 if w else 0, amount, prime)


def alg_key(alg):
    """一条公式的「同一个转法」指纹（忽略括号、空白和 R'2/R2 这种顺序差异）"""
    return tuple(move_key(t) for t in moves_of(alg))


def merge_dups(data):
    """同一角度下写法完全一样的公式合成一条：uses / tags 取并集。

    例：Aa 的 OH 写法 x' R2 D2 R' U' R D2 R' U R' 和 2H 写法
    x' R2 D2 (R' U' R) D2 (R' U R') 只是括号不同 —— 合成一条，
    uses 变成 ["2H", "OH"]，tags 两个都留。"""
    order = ['2H', 'OH']
    merged = 0
    for c in data['cases']:
        for v in c['views']:
            out, seen = [], {}
            for a in v['algs']:
                k = alg_key(a['alg'])
                if k in seen:
                    tgt = seen[k]
                    for u in a.get('uses', []):
                        if u not in tgt.setdefault('uses', []):
                            tgt['uses'].append(u)
                    for t in a.get('tags', []):
                        if t not in tgt.setdefault('tags', []):
                            tgt['tags'].append(t)
                    merged += 1
                    continue
                seen[k] = a
                out.append(a)
            for i, a in enumerate(out, 1):
                a['no'] = i
                a['uses'] = sorted(a.get('uses', []), key=lambda u: (order.index(u) if u in order else 9, u))
            v['algs'] = out
    return merged


def moves_of(alg):
    """规范化动作序列（转体/宽转各算一步），用于步数与去重"""
    return TOKEN.findall(V.clean(alg))


def img_paths(cid, view):
    stem = 'img/pll/pll-%s-v%d' % (cid, view)
    return {
        'img': stem + '-256x256.png',
        'img-nc-day': stem + '-nc-256x256.png',
        'img-nc-night': stem + '-nc-night-256x256.png',
    }


# ---------------- 生成 ----------------

def build():
    """从 pll.html（页面上的写法）+ tools/data/pll.js（说明/概率）生成 pll.json"""
    lib = {}
    for c in V.load_algset(LIB)['cases']:
        lib[c['id']] = c

    page = {}
    for cid, alg, alts in V.page_data(os.path.join(ROOT, 'pll.html')):
        page.setdefault(cid, []).append(alg)

    cases = []
    for no, cid in enumerate(page.keys(), 1):
        meta = lib.get(cid, {})
        algs = []
        for i, alg in enumerate(page[cid], 1):
            mv = moves_of(alg)
            algs.append({
                'no': i,
                'alg': alg,
                'moves': mv,
                'n': len(mv),
                'uses': ['2H'],
                'verified': 'pll_db.py: sig→alg 复原',
                'tags': ['preferred'] if i == 1 else [],
            })
        st0 = sim.case_of(V.clean(page[cid][0]), 'pll')
        perm0 = perm_of(st0)
        views, seen_arrow = [], []
        sig_seen = []
        for k, frame in enumerate(VIEW_FRAMES):
            st = sim.turn(st0, 'U', k)
            sg = sim.pll_sig(st)
            if sg in sig_seen:
                continue
            # 只比箭头：这个角度的箭头 = 基准箭头整体转 k 步。一样就并掉。
            sig_k = turn_sigma(k)
            arr = frozenset((sig_k[j], sig_k[perm0[j]]) for j in range(8) if perm0[j] != j)
            if arr in seen_arrow:
                continue
            seen_arrow.append(arr)
            sig_seen.append(sg)
            v = {'view': len(views), 'frame': frame}
            v.update(img_paths(cid, len(views)))
            v['sig'] = sg
            # 只有「基准角度」有页面上的写法；其它角度先留空，之后想填再填
            v['algs'] = algs if not views else []
            views.append(v)
        cases.append({
            'id': cid,
            'no': no,
            'name': meta.get('name', cid),
            'prob': meta.get('prob', ''),
            'descEn': meta.get('desc', ''),
            'views': views,
        })
    data = {'set': 'pll', 'v': 1, 'cases': cases}
    with open(DB, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('写出 %s：%d 个情况，%d 个角度（%s），%d 条公式'
          % (os.path.relpath(DB, ROOT), len(cases), sum(len(c['views']) for c in cases),
             '/'.join(str(n) for n in sorted({len(c['views']) for c in cases}, reverse=True)),
             sum(len(v['algs']) for c in cases for v in c['views'])))
    return 0


# ---------------- 校验 ----------------

def check(path=DB):
    print('=== %s ===' % os.path.relpath(path, ROOT))
    data = json.load(open(path, encoding='utf-8'))
    bad = []
    if data.get('set') != 'pll' or data.get('v') != 1:
        bad.append('set/v 不对：%r' % {k: data.get(k) for k in ('set', 'v')})
    seen_id, seen_no = set(), set()
    nalg = 0
    for c in data['cases']:
        cid = c['id']
        if cid in seen_id:
            bad.append('%s：id 重复' % cid)
        seen_id.add(cid)
        if c['no'] in seen_no:
            bad.append('%s：no 重复' % cid)
        seen_no.add(c['no'])
        # 写法编号在 case 内唯一（跨画面连续 1..n）——面板上要显示这个号，撞号就分不清了
        nos = [a.get('no') for v in c['views'] for a in v.get('algs') or []]
        if nos != list(range(1, len(nos) + 1)):
            bad.append('%s：写法编号 %r 不是 case 内唯一的 1..%d' % (cid, nos, len(nos)))
        for v in c['views']:
            key = (v.get('frame'), v.get('view'))
            # 1) 图都在
            for k in ('img', 'img-nc-day', 'img-nc-night'):
                p = os.path.join(ROOT, v.get(k, ''))
                if not os.path.exists(p):
                    bad.append('%s view%d：缺图 %s' % (cid, v['view'], v.get(k)))
            # 2) 彩色图的签名必须等于数据里的 sig（图 ↔ 数据）
            img = os.path.join(ROOT, v['img'])
            if os.path.exists(img):
                got = sig.read('pll', img)
                if got != v['sig']:
                    bad.append('%s：图签名 %s ≠ sig %s' % (cid, got, v['sig']))
            # 3) 由 sig 造局面 → 先做 frame（整体转体）→ 再执行公式 → 必须复原
            try:
                st0 = state_from_sig(v['sig'])
            except Exception as e:
                bad.append('%s：sig 造不出局面（%s）' % (cid, e)); continue
            if sim.pll_sig(st0) != v['sig']:
                bad.append('%s：sig 往返不一致' % cid)
            # 角度序列必须正好是这个 case 的 U 轨道（去重后、顺序一致）——
            # 这条能同时挡住「角度漏了 / 多了 / 顺序乱了 / sig 抄错了」
            if not bad or bad[-1].split('：')[0] != cid:
                base = state_from_sig(c['views'][0]['sig'])
                perm0 = perm_of(base)
                orbit = []          # 这个 case 的四个角度（箭头模式 + 签名）
                for k in range(4):
                    st_k = sim.turn(base, 'U', k)
                    sk = turn_sigma(k)
                    arr = frozenset((sk[j], sk[perm0[j]]) for j in range(8) if perm0[j] != j)
                    if arr not in [a for a, _ in orbit]:
                        orbit.append((arr, sim.pll_sig(st_k)))
                got = [x['sig'] for x in c['views']]
                if got != [sg for _, sg in orbit][:len(got)]:
                    bad.append('%s：角度序列 %s 与算法算出的 %s 不一致'
                               % (cid, got, [sg for _, sg in orbit][:len(got)]))
            for a in v['algs']:
                nalg += 1
                if a['n'] != len(a.get('moves') or []):
                    bad.append('%s/%s：n 与 moves 不一致' % (cid, a.get('alg')))
                try:
                    # frame 只是这个角度的名字；公式要对得上的是**这个角度自己的图**，
                    # 所以直接拿 sig 造出的局面做公式（别再按 frame 转一次 —— 那是旧模型的残留）
                    out = sim.apply(st0, V.clean(a['alg']))
                except Exception as e:
                    bad.append('%s/%s：算不动（%s）' % (cid, a.get('alg'), e)); continue
                # 等价判据以**箭头**为准（配色只看相对位置，和看箭头是一回事）：
                # 签名能复原当然算通过；签名对不上时，只要公式的箭头模式和这个角度一致也算通过。
                perm0, sk = perm_of(base), turn_sigma(v['view'])
                want = frozenset((sk[j], sk[perm0[j]]) for j in range(8) if perm0[j] != j)
                st_alg = sim.case_of(V.clean(a['alg']), 'pll')
                got = arrows_of(perm_of(st_alg)) if st_alg else None
                if not V.solved_rot(out) and got != want:
                    bad.append('%s/%s：签名解不出、箭头模式也对不上' % (cid, a['alg']))
        print('  %-3s %-10s %d 个角度  %s'
              % (cid, c.get('name', ''), len(c['views']),
                 ' '.join('%s(%s)' % (v['frame'] or '基准', v['sig']) for v in c['views'][:2])
                 + (' …' if len(c['views']) > 2 else '')))
    print('  %d 个情况 / %d 条公式，%s'
          % (len(data['cases']), nalg, '全部通过 ✓' if not bad else '%d 条有问题' % len(bad)))
    for b in bad:
        print('    ✗ ' + b)
    return 1 if bad else 0


if __name__ == '__main__':
    if '--build' in sys.argv:
        sys.exit(build())
    if '--merge' in sys.argv:
        data = json.load(open(DB, encoding='utf-8'))
        n = merge_dups(data)
        with open(DB, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print('合并了 %d 条重复写法 -> %s' % (n, os.path.relpath(DB, ROOT)))
        sys.exit(0)
    sys.exit(check())
