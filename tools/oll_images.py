"""按 data/oll.json 重新生成 OLL 的图（走编辑器的 OLL 俯视图 + PIL 上色）。

链路和 PLL 那套完全一样：
    库里的 sig（顶面 9 位 + 侧边 12 位）
      → tools/oll_geometry.js（反推朝向 → cube.js 的 buildOll → 几何 JSON）
      → tools/formula_images.py 的 paint_net（PIL 4× 超采样 → LANCZOS → 256 色调色板）
      → oll/oll-<编号>-day|night-256x256.png
出完再用 signature.py 从 PNG 读回签名 == 库里的 sig（图 = sig 的自检）。

两版配色：day = 紫顶（OLL_SCHEMES.violet）、night = 黄顶（HEX.yellow），
都用 dark 那套浅色描边 —— 图是透明底，两套底色上都要看得清。

用法:
    python3 tools/oll_images.py                 # 出全部（57 × 2）
    python3 tools/oll_images.py --only 21       # 只出某一个情况
    python3 tools/oll_images.py --db data/oll.json
"""
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import signature as sig                    # noqa: E402
import formula_images as F                 # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEOM = os.path.join(ROOT, 'tools', 'oll_geometry.js')
DB = os.path.join(ROOT, 'data', 'oll.json')

# 两版图：白天紫顶、夜晚黄顶（描边都用 dark 那套浅色 —— 和现有图一致）
TONES = (('img-day', 'violet'), ('img-night', 'yellow'))


def geometry(top, bars, scheme):
    with tempfile.NamedTemporaryFile('w', suffix='.geom.json', delete=False) as f:
        out = f.name
    try:
        subprocess.check_call(['node', GEOM, '--sig', '%s,%s' % (top, bars),
                               '--out', out, '--theme', 'dark', '--scheme', scheme],
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
            top, bars = v['sig']
            for key, scheme in TONES:
                path = os.path.join(ROOT, v[key])
                F.paint_net(geometry(top, bars, scheme), path, 256)
                made += 1
                got = sig.read('oll', path)
                if got != (top, bars):
                    bad.append('%s：生成的图签名 %s ≠ sig %s' % (v[key], got, (top, bars)))
    print('生成 %d 张图' % made)
    for b in bad:
        print('  ✗ ' + b)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
