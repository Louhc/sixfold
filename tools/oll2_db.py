"""二阶 OLL 公式库：data/oll2.json 的生成与校验。

结构（和 PLL / OLL 同形）：`cases → views → algs`。每个 case 按顶层 `U^k`
转出来的画面**按签名去重**（四个角的朝向串，对称的情况少于 4 个）。
写法**挂在自己所属的那个画面**上（像 PLL）：某条写法是「照 v2 那张图摆好直接用」，
就挂在 v2 下；基准画面 `view 0` 至少要有一条（那才是这一行默认显示、默认图的写法）。

「签名」是 2×2 俯视图读出来的 **4 个字母**（u / b / f / l / r），顺序 = 左上 / 右上 / 左下 / 右下
（左后 / 右后 / 左前 / 右前）。图字段是 `img-day` / `img-night`，文件名
`img/oll2/<情况>-v<角度>-day|night-256x256.png`。

判据：图读出来的朝向 == 库里的 sig；画面序列 == 基准局面按 `U^k` 去重算出来的；
公式「倒着做一遍」的朝向 == 基准画面（AUF 0，照图摆好直接就能用）；
每个角只能落在它自己那几个面上（朝上 或 它的两个侧面）。

用法:
    python3 tools/oll2_db.py --build    # 按 U^k 展开 / 去重画面（公式从现有库取，可反复跑）
    python3 tools/oll2_db.py --check    # 只校验（默认）
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cubesim as sim                      # noqa: E402
import verify as V                         # noqa: E402
import pll_db as P                         # noqa: E402  （复用 moves_of）

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, 'data', 'oll2.json')
PAGE = os.path.join(ROOT, 'oll2.html')

# 俯视图四格：左上 / 右上 / 左下 / 右下（左后 / 右后 / 左前 / 右前）
TILES = [(0, 0), (0, 1), (1, 0), (1, 1)]
# 每个角「允许」的朝向：朝上，或者它自己那两张侧面（读错位置的话这条会先炸）
ALLOW = [('u', 'b', 'l'), ('u', 'b', 'r'), ('u', 'f', 'l'), ('u', 'f', 'r')]
# 视角顺时针转 90°：块跟着转，朝后的贴纸变成朝右
CW = {'u': 'u', 'b': 'r', 'r': 'f', 'f': 'l', 'l': 'b'}
# 画面：同一个情况按顶层 U^k 转出来的样子（frame 只是给这个角度起个名）
FRAMES = ['', 'y', 'y2', "y'"]


# ---------------- 读图 / 读公式 ----------------

def img_sig(path):
    """2×2 俯视图 -> 四个角 U 贴纸的朝向（左上/右上/左下/右下）。

    每格里「有彩色的那一块」就是那个角的 U 贴纸（白天紫、夜晚黄，只看有没有彩色）：
      · 整块填满   = 这个角已经朝上（u）
      · 靠某一边的一小条 = 贴在那一侧：上 b / 下 f / 左 l / 右 r
    """
    from PIL import Image

    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()

    def opaque(x, y):
        return px[x, y][3] > 60

    def colorful(x, y):
        r, g, b, a = px[x, y]
        return a > 60 and max(r, g, b) - min(r, g, b) > 60

    xs = [x for x in range(w) if any(opaque(x, y) for y in range(0, h, 2))]
    ys = [y for y in range(h) if any(opaque(x, y) for x in range(0, w, 2))]
    if not xs or not ys:
        return None
    x0, x1, y0, y1 = xs[0], xs[-1], ys[0], ys[-1]
    mx, my = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    boxes = [(x0, y0, mx, my), (mx, y0, x1, my), (x0, my, mx, y1), (mx, my, x1, y1)]
    out = []
    for (bx0, by0, bx1, by1) in boxes:
        n = sx = sy = 0
        for y in range(int(by0), int(by1) + 1):
            for x in range(int(bx0), int(bx1) + 1):
                if colorful(x, y):
                    n += 1
                    sx += x
                    sy += y
        if not n:
            return None
        cx = (sx / n - bx0) / max(1.0, bx1 - bx0)
        cy = (sy / n - by0) / max(1.0, by1 - by0)
        if n > 3000:                       # 整块填满 = 朝上
            out.append('u')
        elif cy < 0.25:
            out.append('b')
        elif cy > 0.75:
            out.append('f')
        elif cx < 0.25:
            out.append('l')
        elif cx > 0.75:
            out.append('r')
        else:
            out.append('?')
    return out


def sig_of_state(st):
    """一个（顶层）局面里，四个角各自的 U 贴纸朝哪边 -> 4 个字母。"""
    out = []
    for (r, c) in TILES:
        x = -1 if c == 0 else 1
        z = -1 if r == 0 else 1
        p = (x, 1, z)
        face = None
        for f in 'UDFBRL':
            if st.get((p, sim.FACES[f])) == 'U':
                face = f
                break
        if face is None:
            return None
        out.append({'U': 'u', 'B': 'b', 'F': 'f', 'L': 'l', 'R': 'r'}[face])
    return out


def model_sig(alg):
    """公式「倒着做一遍」得到它要解的局面，读四个角的朝向。"""
    return sig_of_state(sim.apply_inverse(sim.solved(), V.clean(alg)))


def rot_cw(sig):
    return [CW[d] for d in [sig[2], sig[0], sig[3], sig[1]]]


# ---------------- 页面（历史 bootstrap；现在 build 走现有库） ----------------

def page_cases(page=PAGE):
    """从静态表里读 [(编号, 角标, alt, 公式)] —— 页面改成库驱动前用过。"""
    h = open(page, encoding='utf-8').read()
    out = []
    for m in re.finditer(r'<td class="pic">([\s\S]*?)</td>\s*<td class="f">([\s\S]*?)</td>', h):
        pic, f = m.group(1), m.group(2)
        mi = re.search(r'data-oll2="([\w-]+)"', pic)
        ml = re.search(r'<span class="no">([^<]+)</span>', pic)
        ma = re.search(r'alt="([^"]*)"', pic)
        mc = re.search(r'<code>([^<]+)</code>', f)
        if not (mi and ml and mc):
            continue
        out.append((mi.group(1), ml.group(1), ma.group(1) if ma else '', mc.group(1)))
    return out


def img_paths(cid, view):
    stem = 'img/oll2/%s-v%d' % (cid, view)
    return {'img-day': stem + '-day-256x256.png',
            'img-night': stem + '-night-256x256.png'}


def views_of(cid, base):
    """把一个情况展开成 U^k 的**去重**画面（朝向串一样就并掉，全对称的只有 1 个）。

    这里只出画面（`algs` 先留着空）——写法由 build()/check() 按自己的朝向放进去。
    """
    seen, out = [], []
    for k in range(4):
        sg = sig_of_state(sim.turn(base, 'U', k))
        if sg is None or sg in seen:
            continue
        seen.append(sg)
        v = {'view': len(out), 'frame': FRAMES[k], 'sig': sg, 'algs': []}
        v.update(img_paths(cid, len(out)))
        out.append(v)
    return out


# ---------------- 生成 ----------------

def build():
    """按 U^k 展开 / 去重画面，并重写图路径（公式从现有库取，可反复跑）。"""
    data = json.load(open(DB, encoding='utf-8'))
    for c in data['cases']:
        algs = [a for v in c['views'] for a in v['algs']]
        if not algs:
            raise SystemExit('%s：库里没有写法，展开不了画面' % c['id'])
        # view 0 那条（第一条）定义这个情况的基准局面
        base = sim.apply_inverse(sim.solved(), V.clean(c['views'][0]['algs'][0]['alg']))
        views = views_of(c['id'], base)
        # 每条写法按自己的朝向放进对应画面（v2 的写法就挂 v2）
        for a in algs:
            sg = model_sig(a['alg'])
            idx = next((i for i, v in enumerate(views) if list(v['sig']) == sg), None)
            if idx is None:
                raise SystemExit('%s：%s 的朝向 %s 不在这个情况的画面里'
                                 % (c['id'], a['alg'], ''.join(sg or [])))
            views[idx]['algs'].append(a)
        # 写法编号在 **case 内唯一**（跨画面连续）：v0 的先是 1..k，接着 v1/v2/v3 的往下排
        n = 0
        for v in views:
            for a in v['algs']:
                n += 1
                a['no'] = n
        c['views'] = views
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
    if data.get('set') != 'oll2' or data.get('v') != 1:
        bad.append('set/v 不对：%r' % {k: data.get(k) for k in ('set', 'v')})
    seen_id = set()
    nalg = nview = 0
    for c in data['cases']:
        cid = c['id']
        if cid in seen_id:
            bad.append('%s：id 重复' % cid)
        seen_id.add(cid)
        views = c['views']
        if not views:
            bad.append('%s：一个画面都没有' % cid)
            continue
        # 1) 每个画面：两版图都在、读回来 == 自己那条 sig、路径角度对得上
        for i, v in enumerate(views):
            nview += 1
            if v.get('view') != i:
                bad.append('%s：view 序号不是 0..n-1' % cid)
            stem = 'img/oll2/%s-v%d' % (cid, i)
            if not str(v.get('img-day', '')).startswith(stem):
                bad.append('%s view%d：图路径 %s 和角度对不上' % (cid, i, v.get('img-day')))
            want = list(v.get('sig') or [])
            for k in ('img-day', 'img-night'):
                p = os.path.join(ROOT, v.get(k, ''))
                if not os.path.exists(p):
                    bad.append('%s view%d：缺图 %s' % (cid, i, v.get(k)))
                    continue
                got = img_sig(p)
                if got != want:
                    bad.append('%s view%d：%s 读出来 %s ≠ sig %s' % (cid, i, k, got, want))
                elif [j for j in range(4) if got[j] not in ALLOW[j]]:
                    bad.append('%s view%d：贴纸落在不该在的面上 %s'
                               % (cid, i, [j for j in range(4) if got[j] not in ALLOW[j]]))
        # 2) 画面序列 == 基准局面按 U^k 去重的结果（基准局面由 view 0 的第一条写法定义）
        if not views[0]['algs']:
            bad.append('%s：基准画面 view 0 没有写法（那一行就没有默认公式了）' % cid)
            continue
        base = sim.apply_inverse(sim.solved(), V.clean(views[0]['algs'][0]['alg']))
        seen, orbit = [], []
        for k in range(4):
            sg = sig_of_state(sim.turn(base, 'U', k))
            if sg is None or sg in seen:
                continue
            seen.append(sg)
            orbit.append(sg)
        if [list(v['sig']) for v in views] != orbit:
            bad.append('%s：画面序列 %s 与按 U 去重算出的 %s 不一致'
                       % (cid, [''.join(v['sig']) for v in views], [''.join(s) for s in orbit]))
        # 3) 写法按画面核：每条写法的朝向必须正好是它挂的那个画面的 sig（AUF 0）
        ncase = 0
        for v in views:
            want = list(v['sig'])
            for a in v.get('algs') or []:
                ncase += 1
                nalg += 1
                if a.get('no') != ncase:
                    bad.append('%s view%d/%s：no 不是 %d（编号在 case 内唯一、跨画面连续）'
                               % (cid, v['view'], a.get('alg'), ncase))
                if a.get('n') != len(a.get('moves') or []):
                    bad.append('%s/%s：n 与 moves 不一致' % (cid, a.get('alg')))
                model = model_sig(a['alg'])
                if model is None:
                    bad.append('%s/%s：公式算不出四个角都朝上的局面' % (cid, a['alg']))
                elif model != want:
                    bad.append('%s view%d/%s：公式的朝向 %s ≠ 这个画面的 %s'
                               % (cid, v['view'], a['alg'], ''.join(model), ''.join(want)))
                elif [j for j in range(4) if model[j] not in ALLOW[j]]:
                    bad.append('%s/%s：贴纸落在不该在的面上'
                               % (cid, a['alg'], [j for j in range(4) if model[j] not in ALLOW[j]]))
        print('  %-9s %-28s %d 个画面  %s'
              % (cid, (views[0]['algs'][0]['alg'] if views[0]['algs'] else ''), len(views),
                 ' '.join('v%d(%s%s)' % (v['view'], ''.join(v['sig']),
                                         (' ×%d' % len(v['algs'])) if len(v['algs']) > 1 else '')
                          for v in views)))
    if len(data['cases']) != 7 or len(seen_id) != 7:
        bad.append('应有 7 个情况，实际 %d 个' % len(data['cases']))
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
