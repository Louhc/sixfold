"""按数据库里的 sig 重新生成公式页的图（走编辑器的几何 + PIL 上色）。

链路：
    局面（tools/cubesim.py，和页面同一个模型）
      → 着色/规则交给 tools/pll_geometry.js（它 require 的正是页面用的 cube.js）
      → 几何 JSON（格子 / 侧面色带 / 箭头）
      → 这里用 PIL 超采样画成 256×256 透明底 PNG

为什么这么绕：环境里没有能用的 SVG 栅格化器（ImageMagick 内置那个画出来是一团糊，
见 tutorial_paint.py 的说明），所以统一走「node 出几何 → PIL 画」。
几何的坐标系和 tools/signature.py 取样时假定的完全一致（PAD=0.4342），
所以画出来的图能被 signature.py 读回同一个签名 —— 这就是自检。

用法:
    python3 tools/formula_images.py                 # 出数据库里全部 PLL 图（每个角度 × 彩色/-nc-/-nc-night-）
    python3 tools/formula_images.py --only Aa       # 只出某一个情况（调试用）
    python3 tools/formula_images.py --db data/pll.json
"""
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cubesim as sim                      # noqa: E402
import signature as sig                    # noqa: E402
import pll_db                              # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEOM = os.path.join(ROOT, 'tools', 'pll_geometry.js')
SS = 4                                     # 超采样倍数（PIL 的多边形没有抗锯齿）


def rgb(c):
    """'#RRGGBB' / '#RGB' / (r,g,b,a) -> PIL 认的元组（几何里存的是十六进制串）"""
    if isinstance(c, (tuple, list)):
        return tuple(c)
    h = str(c).lstrip('#')
    if len(h) == 3:
        h = ''.join(ch * 2 for ch in h)
    try:
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError:            # 几何里偶尔混进非颜色值（比如 undefined 被序列化成字符串）
        return (26, 26, 26)


# ---------------- 画图 ----------------

def paint_net(geom, out, size=256, stroke=None, quantize=True, height=None, colors=64):
    """把 *_geometry.js 出来的几何画成 PNG。

    几何坐标是一套「逻辑单位」：棋盘 + 留白，总宽高 = size.w / size.h。
    输出宽度是 size（默认 256），高度按几何的宽高比算；height 可以强制指定
    （二阶 PBL 那批就是 256×197 的非正方形画布）。
    调色板 quantization：RGBA 只能用 FASTOCTREE；默认收成 64 色（这些图本来就是
    几块纯色 + 抗锯齿过渡，64 色比 256 色小约两成，签名/颜色读数不变）。
    OLL 系列没有箭头，cfg 里也没有 arrow/head —— 描边宽由几何的 style.stroke 给。
    """
    from PIL import Image, ImageDraw
    cfg = geom['cfg']
    total = geom['size']['w']
    total_h = geom['size'].get('h', total)
    k = size * SS / total
    W = int(round(size * SS))
    out_h = int(round(height if height else size * total_h / total))
    H = int(round(out_h * SS))
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)

    def pt(p):
        return (p[0] * k, p[1] * k)

    def seg(p1, p2, width, color):      # 画一段带圆头的线（色带用）
        a, b = pt(p1), pt(p2)
        dr.line([a, b], fill=color, width=max(1, int(round(width * k))))
        r = max(1, int(round(width * k / 2)))          # 圆头（PIL 的线只有方头）
        for c in (a, b):
            dr.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=color)

    # 单元格描边：PLL 和编辑器的 toPllSvg 完全一致（arrow * 0.9），不是随手定的；
    # OLL 的几何自带 stroke（= OLL_CFG.line），它的 cfg 里没有 arrow/head。
    style = geom.get('style') or {}
    stroke_w = style.get('stroke') or cfg['arrow'] * 0.9
    # 无色版的线条颜色：白天跟着几何里的深色，夜晚（深色卡片上）换成白 ——
    # 深色描边在深色底上几乎看不见，和箭头换黄是同一个道理。
    # 注意别再用 line 当参数名：下面有个同名的局部函数会把它遮蔽掉（踩过一次）
    cell_stroke = stroke or style.get('line') or '#1A1A1A'
    for c in geom['cells']:
        pts = [pt(p) for p in c['pts']]
        if c.get('fill') not in (None, 'none'):
            dr.polygon(pts, fill=rgb(c['fill']))
        dr.line(pts + [pts[0]], fill=rgb(cell_stroke),
                width=max(1, int(round(stroke_w * k))), joint='curve')
    for b in geom.get('bars') or []:
        col = rgb(b['color'])
        alpha = b.get('alpha')
        if alpha is not None and alpha < 1:
            col = col + (int(round(255 * alpha)),)
        seg(b['p1'], b['p2'], b.get('w', cfg['bar']), col)
    for a in geom.get('arrows') or []:
        col = rgb(geom['style']['arrow'])
        p1, p2 = a['p1'], a['p2']
        hl = cfg['cell'] * cfg['head']
        # 线缩进去一点，别从箭头尖上冒出来（和 toPllSvg 一致）
        inset = hl * 0.8
        dx, dy = p2[0] - p1[0], p2[1] - p1[1]
        L = (dx * dx + dy * dy) ** 0.5 or 1
        ux, uy = dx / L, dy / L
        s0 = [p1[0] + ux * cfg['cell'] * (cfg.get('tailIn') or 0),
              p1[1] + uy * cfg['cell'] * (cfg.get('tailIn') or 0)]
        e0 = [p2[0] - ux * cfg['cell'] * (cfg.get('headIn') or 0),
              p2[1] - uy * cfg['cell'] * (cfg.get('headIn') or 0)]
        # 线在箭头那头缩进去 hl*0.8（和 toPllSvg 一致），免得从箭头尖上冒出来
        seg([s0[0] + ux * inset, s0[1] + uy * inset], [e0[0] - ux * inset, e0[1] - uy * inset],
            cfg['arrow'], col)

        def head(p, q):
            ddx, ddy = q[0] - p[0], q[1] - p[1]
            LL = (ddx * ddx + ddy * ddy) ** 0.5 or 1
            vx, vy = ddx / LL, ddy / LL
            bx, by = q[0] - vx * hl, q[1] - vy * hl
            nx, ny = -vy, vx
            h = hl * cfg['headW']
            return [pt(q), pt([bx + nx * h, by + ny * h]), pt([bx - nx * h, by - ny * h])]

        dr.polygon(head(s0, e0), fill=col)
        if a.get('both'):
            dr.polygon(head(e0, s0), fill=col)

    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im = im.resize((int(round(size)), out_h), Image.LANCZOS)
    # 现有那批图是 256 色调色板 PNG：量化一下，体积小、也没有 16 位色阶带来的杂边
    if quantize:
        im = im.convert('RGBA').quantize(colors=colors, method=Image.FASTOCTREE)
    im.save(out, optimize=True)
    return out


# ---------------- 局面 -> 几何 ----------------

def geometry(state, turn=0, nc=False, arrow='violet'):
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
        json.dump({'%d,%d,%d|%d,%d,%d' % (p[0], p[1], p[2], n[0], n[1], n[2]): v
                   for (p, n), v in state.items()}, f)
        stfile = f.name
    out = stfile + '.geom.json'
    try:
        cmd = ['node', GEOM, '--state', stfile, '--out', out, '--arrow', arrow]
        if turn:
            cmd += ['--turn', str(turn)]
        if nc:
            cmd.append('--nc')
        subprocess.check_call(cmd, stdout=subprocess.DEVNULL)
        return json.load(open(out, encoding='utf-8'))
    finally:
        for f in (stfile, out):
            if os.path.exists(f):
                os.remove(f)


# ---------------- PLL 这一套 ----------------

def db_views(path=None):
    """读数据库里的 (情况编号, view)，图完全由 view.sig 决定 —— 不碰页面。"""
    data = json.load(open(path or pll_db.DB, encoding='utf-8'))
    out = []
    for c in data['cases']:
        for v in c['views']:
            out.append((c['id'], v))
    return out


def main(argv):
    dbpath = None
    if '--db' in argv:
        i = argv.index('--db')
        dbpath = argv[i + 1]
        del argv[i:i + 2]
    only = None
    if '--only' in argv:
        i = argv.index('--only')
        only = argv[i + 1]
        del argv[i:i + 2]

    bad, made = [], 0
    base_sig = {}
    for cid, v in db_views(dbpath):
        if v['view'] == 0:
            base_sig[cid] = v['sig']
    for cid, v in db_views(dbpath):
        if only and cid != only:
            continue
        # 图完全由**这个角度自己的 sig** 决定（和校验器同一份逆映射），
        # 渲染完再用 signature.py 读回来对签名 —— 图 = sig 的自检。
        st = pll_db.state_from_sig(v['sig'])
        if sim.pll_sig(st) != v['sig']:
            bad.append('%s view%d：sig 往返不一致' % (cid, v['view'])); continue
        base = pll_db.state_from_sig(base_sig[cid])
        turn = None
        for k in range(4):
            if sim.pll_sig(sim.turn(base, 'U', k)) == v['sig']:
                turn = k
                break
        if turn is None:
            bad.append('%s view%d：sig 不在基准的 U 轨道上' % (cid, v['view'])); continue
        # 彩色那版用深紫箭头；无色版白天也是深紫，夜晚换黄（深紫在深色卡片上基本看不见）
        # 彩色版深紫箭头；无色版白天也是深紫；夜晚换黄箭头 + 白色描边
        for key, nc, arrow, line in (('img', False, 'violet', None),
                                     ('img-nc-day', True, 'violet', None),
                                     ('img-nc-night', True, 'yellow', '#FFFFFF')):
            path = os.path.join(ROOT, v[key])
            paint_net(geometry(st, turn=turn, nc=nc, arrow=arrow), path, 256, stroke=line)
            made += 1
            # 彩色那版必须能被 signature.py 读回同一个签名 —— 图 = sig 的自检
            if not nc and sig.read('pll', path) != v['sig']:
                bad.append('%s：生成的图签名 %s ≠ sig %s'
                           % (v[key], sig.read('pll', path), v['sig']))
    print('生成 %d 张图' % made)
    for b in bad:
        print('  ✗ ' + b)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
