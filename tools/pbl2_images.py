"""按 data/pbl2.json 重新生成二阶 PBL 的图（编辑器两层网格 + PIL 上色）。

    state（两层各 4 个「家槽位」）
      → tools/pbl2_geometry.js（cube.js 的 buildPbl2 → 几何 JSON，含箭头）
      → tools/formula_images.py 的 paint_net（非正方形画布：256×197）
      → img/pbl2/<编号>_day|night-256x197.png
出完核一遍：尺寸 256×197、不是空图、箭头颜色对得上（day 深紫 / night 黄）。

用法:
    python3 tools/pbl2_images.py                 # 出全部（5 × 2）
    python3 tools/pbl2_images.py --only dd       # 只出某一个
    python3 tools/pbl2_images.py --db data/pbl2.json
"""
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import formula_images as F                  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEOM = os.path.join(ROOT, 'tools', 'pbl2_geometry.js')
DB = os.path.join(ROOT, 'data', 'pbl2.json')
SIZE = (256, 197)

# 箭头颜色（和 pbl2_geometry.js 的 PAINT 一致），出完抽一下
ARROW = {'day': (76, 66, 99), 'night': (255, 230, 0)}
TONES = (('img-day', 'day'), ('img-night', 'night'))


def geometry(state, tone):
    with tempfile.NamedTemporaryFile('w', suffix='.geom.json', delete=False) as f:
        out = f.name
    try:
        subprocess.check_call(['node', GEOM, '--state', state, '--tone', tone, '--out', out],
                              stdout=subprocess.DEVNULL)
        return json.load(open(out, encoding='utf-8'))
    finally:
        if os.path.exists(out):
            os.remove(out)


def check_img(path, tone):
    """尺寸对、不是空图、箭头颜色在（±2 容差，调色板量化会差一两级）"""
    from PIL import Image
    with Image.open(path) as im:
        if im.size != SIZE:
            return '%s 尺寸 %s ≠ %s' % (os.path.basename(path), im.size, SIZE)
        px = list(im.convert('RGBA').getdata())
    opaque = [p for p in px if p[3] > 60]
    if len(opaque) < 2000:
        return '%s 几乎是空图（不透明像素 %d）' % (os.path.basename(path), len(opaque))
    want = ARROW[tone]
    hit = sum(1 for p in opaque if all(abs(p[i] - want[i]) <= 12 for i in range(3)) and p[3] > 200)
    if hit < 100:
        return '%s 看不到箭头颜色 %s（命中 %d 像素）' % (os.path.basename(path), want, hit)
    return None


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

    data = json.load(open(dbpath or DB, encoding='utf-8'))
    bad, made = [], 0
    for c in data['cases']:
        if only and c['id'] != only:
            continue
        state = '%s,%s' % (''.join(str(x) for x in c['state']['u']),
                           ''.join(str(x) for x in c['state']['d']))
        for key, tone in TONES:                    # 固定视角：每个情况就两张
            path = os.path.join(ROOT, c[key])
            F.paint_net(geometry(state, tone), path, 256)
            made += 1
            err = check_img(path, tone)
            if err:
                bad.append(err)
    print('生成 %d 张图' % made)
    for b in bad:
        print('  ✗ ' + b)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
