"""二阶 PBL 公式库：data/pbl2.json 的生成与校验。

结构：`cases → algs`（**没有 `views` 这一层** —— PBL 是固定视角，不做旋转图：
两层都有图案，转起来就是另一张图，容易看花）。每个 case 直接带 `state` / 图 / 写法。
PBL 的图是「两层 2×2 网格 + 换角箭头」，没有配色，所以库里存的不是颜色签名，
而是**每层 4 个角的置换**（`state`）：

    state.u / state.d 各 4 个数：槽位 i 上的角块「家」在哪个槽位（不在家才有箭头）。
    槽位序和 cube.js 的 PBL2_SLOTS 一样：左上 ULB / 右上 UBR / 左下 UFL / 右下 UFR。

图：`img/pbl2/<情况>_day|night-256x197.png`。

编号是短编号：a = 相邻两角换（Adj）、d = 对角两角换（Diag）；
两个字母是「上层 / 下层」，只写一个表示另一层已经排好。

判据：公式算出来的置换 == 库里的 state；两层的换法组合和编号对得上；
角块没被翻（顶层 U 贴纸朝上、底层朝下）；昼夜两版图都在且是 256×197。

用法:
    python3 tools/pbl2_db.py --build    # 从现有库的公式重建（可反复跑）
    python3 tools/pbl2_db.py --check    # 只校验（默认）
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cubesim as sim                      # noqa: E402
import pll_db as P                         # noqa: E402  （复用 moves_of）

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, 'data', 'pbl2.json')
PAGE = os.path.join(ROOT, 'pbl2.html')
SIZE = (256, 197)

# cube.js PBL2_SLOTS 的槽位序：ULB(0) UBR(1) UFL(2) UFR(3)
SLOT_XZ = [(-1, -1), (1, -1), (-1, 1), (1, 1)]
LETTER = {'a': 'adjacent', 'd': 'diagonal'}


# ---------------- 读公式 ----------------

def _stickers(st, p):
    return ''.join(sorted(st[(p, n)] for n in [sim.FACES[f] for f in 'UDFBRL'] if (p, n) in st))


def _home():
    solved = sim.solved()
    out = {}
    for y in (1, -1):
        for (x, z) in SLOT_XZ:
            out[_stickers(solved, (x, y, z))] = (x, z)
    return out


def perms_of(st):
    """一个局面 -> (state, twisted)；state 是两层各 4 个「家槽位」。"""
    home = _home()
    out, twisted = {}, []
    for y in (1, -1):
        key = 'u' if y == 1 else 'd'
        want = sim.FACES['U'] if y == 1 else sim.FACES['D']
        perm = []
        for (x, z) in SLOT_XZ:
            p = (x, y, z)
            perm.append(SLOT_XZ.index(home[_stickers(st, p)]))
            if st.get((p, want)) != ('U' if y == 1 else 'D'):
                twisted.append('%s%s' % (key, (x, z)))
        out[key] = perm
    return out, twisted


def state_of(alg):
    """公式解的局面 -> (state, twisted)。"""
    return perms_of(sim.apply(sim.solved(), alg))


def kind_of(state):
    """两层的换法：solved / adjacent / diagonal"""
    got = {}
    for key in ('u', 'd'):
        perm = state[key]
        moved = [i for i in range(4) if perm[i] != i]
        if not moved:
            got[key] = 'solved'
        elif len(moved) == 2:
            a, b = moved
            shared = sum(1 for i in (0, 1) if SLOT_XZ[a][i] == SLOT_XZ[b][i])
            got[key] = 'adjacent' if shared == 1 else 'diagonal'
        else:
            got[key] = '%d 个角动了' % len(moved)
    return got


def label_kinds(label):
    """编号 -> 期望的两层换法（排序后）；只写一个字母 = 另一层已经排好"""
    label = label.strip().lower()
    expect = [LETTER[c] for c in label if c in LETTER]
    if not expect or len(expect) > 2 or len(label) != len(expect):
        return None
    if len(expect) == 1:
        expect.append('solved')
    return sorted(expect)


# ---------------- 页面（历史 bootstrap） ----------------

def page_cases(page=PAGE):
    """从静态表里读 [(编号, 角标, alt, 公式)] —— 页面改成库驱动前用过。"""
    h = open(page, encoding='utf-8').read()
    out = []
    for m in re.finditer(r'<td class="pic">([\s\S]*?)</td>\s*<td class="f">([\s\S]*?)</td>', h):
        pic, f = m.group(1), m.group(2)
        mi = re.search(r'data-pbl2="([\w-]+)"', pic)
        ml = re.search(r'<span class="no">([^<]+)</span>', pic)
        ma = re.search(r'alt="([^"]*)"', pic)
        mc = re.search(r'<code>([^<]+)</code>', f)
        if not (mi and ml and mc):
            continue
        out.append((mi.group(1), ml.group(1), ma.group(1) if ma else '', mc.group(1)))
    return out


def img_paths(cid):
    return {'img-day': 'img/pbl2/%s_day-256x197.png' % cid,
            'img-night': 'img/pbl2/%s_night-256x197.png' % cid}


# ---------------- 生成 ----------------

def build():
    """从现有库的公式重建（每个情况一个基准画面，可反复跑）。"""
    data = json.load(open(DB, encoding='utf-8'))
    for c in data['cases']:
        algs = [a for v in c['views'] for a in v['algs']]
        if not algs:
            raise SystemExit('%s：库里没有写法' % c['id'])
        state, twisted = state_of(algs[0]['alg'])
        if twisted:
            raise SystemExit('%s：公式把角块翻了（%s）' % (c['id'], '、'.join(twisted)))
        c.pop('views', None)
        c['state'] = state
        c.update(img_paths(c['id']))
        c['algs'] = algs
    with open(DB, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('写出 %s：%d 个情况 / %d 条公式（固定视角，没有 views）'
          % (os.path.relpath(DB, ROOT), len(data['cases']),
             sum(len(c['algs']) for c in data['cases'])))
    return 0


# ---------------- 校验 ----------------

def _bad_state(state):
    for key in ('u', 'd'):
        perm = state.get(key)
        if not isinstance(perm, list) or sorted(perm) != [0, 1, 2, 3]:
            return '%s 不是 0..3 的置换：%r' % (key, perm)
    return None


def check(path=DB):
    print('=== %s ===' % os.path.relpath(path, ROOT))
    data = json.load(open(path, encoding='utf-8'))
    bad = []
    if data.get('set') != 'pbl2' or data.get('v') != 1:
        bad.append('set/v 不对：%r' % {k: data.get(k) for k in ('set', 'v')})
    seen = set()
    for c in data['cases']:
        cid = c['id']
        if cid in seen:
            bad.append('%s：id 重复' % cid)
        seen.add(cid)
        if 'views' in c:
            bad.append('%s：PBL 是固定视角，不该有 views' % cid)
        expect = label_kinds(c.get('label', ''))
        if expect is None:
            bad.append('%s：编号认不出来（只认 a / d，最多两个字母）：%r' % (cid, c.get('label')))
        elif c.get('kind') != expect:
            bad.append('%s：库里的 kind %r ≠ 编号算出的 %r' % (cid, c.get('kind'), expect))
        # 1) 两版图都在、尺寸 256x197，而且路径是「固定视角」那套（不带 -v）
        for k in ('img-day', 'img-night'):
            rel = c.get(k, '')
            if '-v' in str(rel):
                bad.append('%s：%s 带了角度（%s）—— PBL 是固定视角' % (cid, k, rel))
            p = os.path.join(ROOT, rel)
            if not os.path.exists(p):
                bad.append('%s：缺图 %s' % (cid, rel))
                continue
            from PIL import Image
            with Image.open(p) as im:
                if im.size != SIZE:
                    bad.append('%s：%s 尺寸 %s ≠ %s' % (cid, k, im.size, SIZE))
        # 2) state 必须是两层各一个 0..3 的置换
        err = _bad_state(c.get('state') or {})
        if err:
            bad.append('%s：state.%s' % (cid, err))
        # 3) 公式算出来的置换 == state，换法 == 编号，角块没被翻
        algs = c.get('algs') or []
        if not algs:
            bad.append('%s：没有写法' % cid)
        for i, a in enumerate(algs, 1):
            if a.get('no') != i:
                bad.append('%s/%s：no 不是 %d' % (cid, a.get('alg'), i))
            if a.get('n') != len(a.get('moves') or []):
                bad.append('%s/%s：n 与 moves 不一致' % (cid, a.get('alg')))
            try:
                got, twisted = state_of(a['alg'])
            except Exception as e:                     # noqa: BLE001
                bad.append('%s/%s：算不动（%s）' % (cid, a['alg'], e))
                continue
            if twisted:
                bad.append('%s/%s：角块被翻了（%s）' % (cid, a['alg'], '、'.join(twisted)))
            state = c.get('state') or {}
            if state and got != state:
                bad.append('%s/%s：公式的置换 %r ≠ state %r' % (cid, a['alg'], got, state))
            kk = sorted(kind_of(got).values())
            if expect is not None and kk != expect:
                bad.append('%s/%s：换法 %r ≠ 编号期望 %r' % (cid, a['alg'], kk, expect))
        print('  %-3s %-30s 上 %s 下 %s  %s'
              % (cid, (algs[0]['alg'] if algs else ''),
                 ''.join(str(x) for x in (c.get('state') or {}).get('u', [])),
                 ''.join(str(x) for x in (c.get('state') or {}).get('d', [])), c.get('name', '')))
    if len(data['cases']) != 5 or len(seen) != 5:
        bad.append('应有 5 个情况，实际 %d 个' % len(data['cases']))
    print('  %d 个情况 / %d 条公式（固定视角，没有 views），%s'
          % (len(data['cases']), sum(len(c['algs']) for c in data['cases']),
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
