"""按 data/oll2.json 重新生成二阶 OLL 的图（编辑器 2×2 俯视图 + PIL 上色）。

    sig（四个角的朝向 u/b/f/l/r）
      → tools/oll2_geometry.js（cube.js 的 buildOll2 → 几何 JSON）
      → tools/formula_images.py 的 paint_net
      → img/oll2/<编号>_day|night-256x256.png
出完用 tools/oll2_db.py 的读图函数读回来对 sig 自检。

两版配色（和现有图一致）：day = 浅色主题（深色描边）+ 紫顶；
night = 深色主题（浅色描边）+ 黄顶。

用法:
    python3 tools/oll2_images.py                 # 出全部（7 × 2）
    python3 tools/oll2_images.py --only sune     # 只出某一个
    python3 tools/oll2_images.py --db data/oll2.json
"""
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import oll2_db as DB2                       # noqa: E402
import formula_images as F                  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEOM = os.path.join(ROOT, 'tools', 'oll2_geometry.js')
DB = os.path.join(ROOT, 'data', 'oll2.json')

# (输出字段, 主题, 配色方案)
TONES = (('img-day', 'light', 'violet'), ('img-night', 'dark', 'yellow'))


def geometry(sig, theme, scheme):
    with tempfile.NamedTemporaryFile('w', suffix='.geom.json', delete=False) as f:
        out = f.name
    try:
        subprocess.check_call(['node', GEOM, '--sig', sig, '--out', out,
                               '--theme', theme, '--scheme', scheme],
                              stdout=subprocess.DEVNULL)
        return json.load(open(out, encoding='utf-8'))
    finally:
        if os.path.exists(out):
            os.remove(out)


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
        for v in c['views']:                       # 每个去重后的画面都出两张
            sig = ''.join(v['sig'])
            for key, theme, scheme in TONES:
                path = os.path.join(ROOT, v[key])
                F.paint_net(geometry(sig, theme, scheme), path, 256)
                made += 1
                got = DB2.img_sig(path)
                if got != v['sig']:
                    bad.append('%s：生成的图读回来 %s ≠ sig %s' % (v[key], got, v['sig']))
    print('生成 %d 张图' % made)
    for b in bad:
        print('  ✗ ' + b)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
