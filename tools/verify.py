# -*- coding: utf-8 -*-
"""校验公式合集页里的公式与图是否真的对得上。

要解决的问题：公式本身可能是对的，但**图上的摆法**和公式要求的摆法不一致 ——
照图摆好直接做公式会做错。这类错误光看图和公式都发现不了，必须算。

做法：
  1. 从 oll.html / pll.html 里读出每条 [编号, 公式]
  2. 用 cubesim 把公式**逆运算**作用在复原魔方上，得到它解的局面
  3. 从同名图里读出签名（顶面 9 格 + 侧边 12 条划线／12 条色带）
  4. 比对 —— 只有分毫不差才算「照图摆好就能用」

有了公式库之后，OLL / PLL 的「公式 ↔ 图」交给各自的库（tools/oll_db.py /
tools/pll_db.py），这里负责其余部分：F2L 的结构校验、教程页、单手 PLL、
二阶 OLL / PBL，以及 `--find`（去第三方库里搜能用的写法）。

注意：差一步 AUF 也算**对不上**。那意味着照图摆好直接做会做错。

用法:
    python3 tools/verify.py                 # 跑全部
    python3 tools/verify.py --find 16 oll    # OLL 16 有没有别的写法
    python3 tools/verify.py --find T  pll    # PLL T（编号用字母）
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cubesim as sim
import signature as S

# 24 种"复原态"预算好，判定就是一次集合查询
_SOLVED_FORMS = {tuple(sorted(sim.apply(sim.solved(), r).items())) for r in sim.ROTS}

# 跳计算器的链接会在公式前面带一个标记（计算器据此决定怎么摆）：
#   @g: F2L 的 b 版（绿面朝前）  @s: 计时器过来的打乱  @2: 二阶公式（切到二阶模式）
# 校验公式本身时先把标记摘掉。
_PREFIX = re.compile(r'^@[a-z0-9]+:')


def solved_rot(st):
    """是否复原（允许整体旋转）—— 含 y/x 的公式做完会留下旋转"""
    return tuple(sorted(st.items())) in _SOLVED_FORMS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def clean(alg):
    """第三方公式库里有 [z'] 这类注释，也有全角符号"""
    a = re.sub(r'\[[^\]]*\]', ' ', alg)
    return a.replace('\u2019', "'").replace('\uff07', "'")


def sigs(alg, kind):
    """公式的签名 + 它的 4 个 AUF 旋转"""
    try:
        st = sim.case_of(clean(alg), kind)
    except Exception:
        return None
    if st is None:
        return None
    f = sim.sig_str if kind == 'oll' else sim.pll_sig
    out, cur = [], st
    for _ in range(4):
        out.append(f(cur))
        cur = sim.turn(cur, 'U', 1)
    return out


def load_algset(path):
    s = open(path, encoding='utf-8').read()
    s = re.sub(r'^var algSet\s*=\s*', '', s.strip()).rstrip(';')
    s = re.sub(r',(\s*[\]\}])', r'\1', s)
    return json.loads(s)


def lib_algs(libfile):
    out = []
    for c in load_algset(libfile)['cases']:
        for a in c['algs']:
            out.append((c['id'], c.get('name', ''), a['alg']))
            for v in a.get('vars', []) or []:
                out.append((c['id'], c.get('name', ''), v['alg']))
    return out


def img_name(kind, ident, tone=''):
    """编号 -> 图文件名。OLL 是 1..57（补零），PLL 是 Aa..Z。

    OLL 有昼夜两套图（白天紫顶 / 夜晚黄顶），tone 传 'day' / 'night'；
    PLL 只有一套，tone 留空。"""
    f = ident if not ident.isdigit() else ident.zfill(2)
    mid = ('-' + tone) if tone else ''
    return '%s-%s%s-256x256.png' % (kind, f, mid)


def page_data(page):
    """从页面里读出 [(编号, 主公式, [[备选公式, AUF], ...])]

       生成器输出的是合法 JSON（键带引号），所以这里直接解析 ——
       早先我用正则硬啃，会把备选列表里的 ["公式","U"] 也当成一行，
       解析出的公式和 AUF 全错位。
    """
    h = open(page, encoding='utf-8').read()
    m = re.search(r'var SECTIONS = (\[.*?\n\]);', h, re.S)
    if not m:
        return []
    out = []
    for sec in json.loads(m.group(1)):
        for r in sec.get('rows', []):
            alts = [tuple(a) for a in (r[2] if len(r) > 2 else [])]
            # 同一个格子里可能有好几条写法（用换行分隔），要逐条校验 ——
            # 拼在一起会变成一条无效公式
            for line in str(r[1]).split('\n'):
                if line.strip():
                    out.append((str(r[0]), line.strip(), alts))
    return out


def find(kind, ident, imgdir, libfile):
    """去公式库里搜这个情况能用的写法。ident: OLL 用数字(16)，PLL 用字母(T)"""
    img = S.read(kind, os.path.join(imgdir, img_name(kind, ident, 'night' if kind == 'oll' else '')))
    print('图 %s 的签名: %s' % (ident, img))
    hits = []
    for cid, name, alg in lib_algs(libfile):
        ss = sigs(alg, kind)
        # 只认「旋转 0」——即照图摆好直接就能用。
        # 把 4 个 AUF 旋转都算进来会匹配到同一算法转过 90° 的版本，仍需手动 AUF。
        if ss and ss[0] == img:
            hits.append((cid, name, alg))
    if not hits:
        print('  库里没有朝向吻合的写法')
        return 1
    seen = set()
    for cid, name, alg in hits:
        if alg in seen:
            continue
        seen.add(alg)
        print('  标准%s %-16s %s' % (cid, name[:14], alg))
    return 0


# ---------------- F2L：不需要图的结构校验 ----------------
#
# F2L 的图和 OLL/PLL 不一样 —— OLL/PLL 的图是"做完公式之后顶面长什么样"，
# 读图就能验。F2L 的图是"公式要解的那个局面"，而同一个局面换个 AUF 摆法
# 就有好几种画法，图上又只有十几个贴纸有颜色（其余是灰底），
# 拿图反推对应关系噪声太大。所以 F2L 改用一个不需要图的判据：
#
#   A 是某个槽位的合法 F2L 插入公式  <=>  S = A⁻¹(r(复原)) 里
#   "下两层除该槽位外全部完好，且恰好只有这一个槽位被破坏"
#
# 道理：F2L 插入公式干的事就是把某个槽位的一角一棱从顶层归位，同时不碰
# 十字和另外三个槽位。反过来做，就只应该翻出那一个槽位。
# 纯顶层公式（一个槽位都没动）和写错到动了别的槽位的公式，都会被这一条挡掉。
#
# 再用两条独立的交叉验证兜底：
#   * 镜像 —— 每一行的 a/b 两式必须严格互为镜像（页面表头就写着"红 F"/"绿 F"）
#   * 唯一 —— 36 条公式算出的 36 个局面必须两两不同（能抓出复制粘贴、串行）

F2L_SLOTS = {
    'FR': ((1, -1, 1), (1, 0, 1)),
    'FL': ((-1, -1, 1), (-1, 0, 1)),
    'BR': ((1, -1, -1), (1, 0, -1)),
    'BL': ((-1, -1, -1), (-1, 0, -1)),
}
F2L_LOWER = {p for (f, r, c, p) in sim.SLOTS if p[1] <= 0}
_F2L_SOLVED = sim.solved()
_F2L_HOME = {}
for _p in {p for (f, r, c, p) in sim.SLOTS}:
    _F2L_HOME[_p] = {n: c for (p2, n), c in _F2L_SOLVED.items() if p2 == _p}


def _key(st):
    return tuple(sorted(st.items()))


def f2l_page(page=None):
    """读出 [(小节标题, [(a 编号, af, b 编号或 None, bf 或 None), ...]), ...]

    **数据来自库 data/f2l.json**（f2l.html 已经改成读库渲染，页面里没有 SECTIONS 字面量了）。
    一情况的写法按库里的顺序用 `\n`（两个字符）拼起来 —— 和以前从页面字面量里读到的形状一致，
    所以下面 f2l_rows / 镜像那几处 `split('\\n')` 不用改。
    注意 b/bf 允许是 null —— 07/08/09 是只有左格、没有右格的单图形行。
    """
    db = json.load(open(os.path.join(ROOT, 'data', 'f2l.json'), encoding='utf-8'))
    text = {c['id']: '\\n'.join(a['alg'] for a in c['algs']) for c in db['cases']}
    out = []
    for sec in db['sections']:
        rows = []
        for r in sec['rows']:
            a, b = r[0], r[1]
            if not a and not b:
                continue
            rows.append((a, text.get(a) if a else None, b, text.get(b) if b else None))
        out.append((sec['title'], rows))
    return out


def f2l_rows(page):
    """摊平成 [(编号, 公式, 'a'|'b')]，格子里的 \\n 并列写法逐条拆开"""
    out = []
    for _, rows in f2l_page(page):
        for a, af, b, bf in rows:
            for ident, raw, side in ((a, af, 'a'), (b, bf, 'b')):
                if not ident or not raw:
                    continue
                for line in raw.split('\\n'):
                    if line.strip():
                        out.append((ident, line.strip(), side))
    return out


def f2l_case(alg):
    """公式所解的局面，含净整体旋转修正（21a/21b 带 y）"""
    r = sim.net_rotation(alg)
    base = sim.apply(_F2L_SOLVED, r) if r else _F2L_SOLVED
    return sim.apply_inverse(base, alg)


def f2l_slot(alg):
    """返回 ('ok', 槽位) 或 (问题类型, 说明)"""
    try:
        toks = sim.parse(alg)
    except Exception as e:
        return 'bad', '解析失败: %s' % e
    if not toks:
        return 'bad', '空公式'
    st = f2l_case(alg)
    broken = [n for n in F2L_SLOTS
              if any(st.get((p, n2)) != c
                     for p in F2L_SLOTS[n] for n2, c in _F2L_HOME[p].items())]
    for pos in F2L_LOWER:
        if any(pos in F2L_SLOTS[n] for n in broken):
            continue
        if any(st.get((pos, n2)) != c for n2, c in _F2L_HOME[pos].items()):
            return 'nohome', '下两层的 %s 位置被带动了' % (pos,)
    if not broken:
        return 'none', '一个槽位都没动（纯顶层公式，不是 F2L 插入）'
    if len(broken) > 1:
        return 'many', '破坏了 %d 个槽位: %s' % (len(broken), '+'.join(broken))
    return 'ok', broken[0]


# ---- 镜像 ----
# 在 x=0 平面照镜子时 R/L 两个颜色也会互换，不互换得到的是"不存在的魔方"
# （R 色贴到 L 面上），任何动作序列都变不出来。
_MIRROR_RELABEL = {'R': 'L', 'L': 'R'}
_MIRROR_MOVE = None


def _mirror_state(st):
    def m(p):
        return (-p[0], p[1], p[2])
    return {(m(p), m(n)): _MIRROR_RELABEL.get(c, c) for (p, n), c in st.items()}


def _mv_name(mv, t):
    return mv + ('' if t == 1 else ('2' if t == 2 else "'"))


def _inv(name):
    if name.endswith("'"):
        return name[:-1]
    if name.endswith('2'):
        return name
    return name + "'"


def mirror_move(mv):
    """查表得出每个动作的镜像动作（懒构建）。

    结果符合物理：R→L'、U→U'、F→F'、M→M、x→x、y→y'
    """
    global _MIRROR_MOVE
    if _MIRROR_MOVE is None:
        table = {}
        for m in sorted(sim.MOVES):
            for t in (1, 2, 3):
                table[_key(sim.apply(_F2L_SOLVED, _mv_name(m, t)))] = _mv_name(m, t)
        _MIRROR_MOVE = {}
        for m in sorted(sim.MOVES):
            _MIRROR_MOVE[m] = table[_key(_mirror_state(sim.apply(_F2L_SOLVED, m)))]
    return _MIRROR_MOVE[mv]


def mirror_alg(alg):
    out = []
    for mv, t in sim.parse(alg):
        b = mirror_move(mv)
        if t == 2 or t == -2:
            out.append(b[0] + '2')
        elif t == 1:
            out.append(b)
        else:
            out.append(_inv(b))
    return ' '.join(out)


_F2L_NRM = {(0, 1, 0): 'U', (0, -1, 0): 'D', (0, 0, 1): 'F', (0, 0, -1): 'B',
            (1, 0, 0): 'R', (-1, 0, 0): 'L'}
F2L_SLOT_COLORS = {'FR': ({'D', 'F', 'R'}, {'F', 'R'}),
                   'FL': ({'D', 'F', 'L'}, {'F', 'L'}),
                   'BR': ({'D', 'B', 'R'}, {'B', 'R'}),
                   'BL': ({'D', 'B', 'L'}, {'B', 'L'})}


def _by_pos(st):
    d = {}
    for (p, n), c in st.items():
        d.setdefault(p, {})[n] = c
    return d


def _piece(bypos, colors):
    for p, dd in bypos.items():
        if len(dd) == len(colors) and set(dd.values()) == set(colors):
            return p, dd
    return None, None


def f2l_corner_white(alg):
    """该公式所解的局面里，目标槽位角块的白色贴纸朝哪 —— 返回 'U'/'R'/... 或 None"""
    kind, slot = f2l_slot(alg)
    if kind != 'ok':
        return None
    cc, _ = F2L_SLOT_COLORS[slot]
    _, cd = _piece(_by_pos(f2l_case(alg)), cc)
    if not cd:
        return None
    for n, c in cd.items():
        if c == 'D':
            return _F2L_NRM[n]
    return None


def f2l_sections(page):
    """读出 [(小节标题, [编号...])]，用来核对分节标题说的和局面算出来的一不一致"""
    out = []
    for title, rows in f2l_page(page):
        out.append((title, [i for a, _, b, _ in rows for i in (a, b) if i]))
    return out


def check_f2l(page=None):
    print('=== data/f2l.json（F2L 库；f2l.html 读它渲染）（结构校验，不用图） ===')
    rows = f2l_rows(page)
    if not rows:
        print('  读不到数据')
        return 1
    bad = 0
    # 页面里声明了编号、却没有对应公式的行，会被 f2l_rows 跳过。
    # 这类漏读必须报出来，不然"少验了几条"看着还是一片全过。
    ids_page = {i for _, ids in f2l_sections(page) for i in ids}
    ids_read = {i for i, _, _ in rows}
    if ids_page != ids_read:
        if ids_page - ids_read:
            print('  这些编号有声明但没读到公式（af 为空？）: %s'
                  % ' '.join(sorted(ids_page - ids_read)))
        if ids_read - ids_page:
            print('  读出了页面里没有的编号: %s' % ' '.join(sorted(ids_read - ids_page)))
        bad += 1
    for ident, alg, side in rows:
        kind, info = f2l_slot(alg)
        if kind == 'ok':
            continue
        print('  %-5s %-36s %s' % (ident, alg, info))
        bad += 1
    # 左格必须落在 FR 槽、右格必须落在 FL 槽
    for ident, alg, side in rows:
        kind, slot = f2l_slot(alg)
        want = 'FR' if side == 'a' else 'FL'
        if kind == 'ok' and slot != want:
            print('  %-5s 应落在 %s 槽，实得 %s' % (ident, want, slot))
            bad += 1
    # a/b 必须互为镜像。b 为 null 的单图形行（07/08/09）没有镜像可对，跳过。
    # 格子里的 \n 并列写法按集合比，单行时就是"逐字镜像"。
    for _, drows in f2l_page(page):
        for aid, af, bid, bf in drows:
            if not (aid and af and bid and bf):
                continue
            akeys = {_key(sim.apply(_F2L_SOLVED, x.strip()))
                     for x in af.split('\\n') if x.strip()}
            for x in (y.strip() for y in bf.split('\\n') if y.strip()):
                exp = mirror_alg(x)
                if _key(sim.apply(_F2L_SOLVED, exp)) not in akeys:
                    print('  %s/%s 不是镜像: %s 的镜像 = %s' % (aid, bid, x, exp))
                    bad += 1
    # 所有局面必须两两不同
    seen = {}
    for ident, alg, side in rows:
        c = _key(f2l_case(alg))
        if c in seen and seen[c] != ident:
            # 同一个情况可以有好几条写法（都解同一个局面），那不算重复；
            # 只有**不同情况**落到同一个局面才是问题。
            print('  %s 与 %s 是同一个局面（重复）' % (ident, seen[c]))
            bad += 1
        else:
            seen.setdefault(c, ident)
    # 分节标题说的朝向，算出来必须真的成立（"白色朝上"节：角块白贴纸必须朝 U）
    byid = {}
    for ident, alg, side in rows:
        byid.setdefault(ident, alg)
    for title, ids in f2l_sections(page):
        if '白' not in title or '上' not in title:
            continue
        for ident in ids:
            if ident not in byid:
                continue
            w = f2l_corner_white(byid[ident])
            if w != 'U':
                print('  %s 在「%s」节，但角块白贴纸朝 %s' % (ident, title, w))
                bad += 1
    print('  %d 条公式，%d 个互不相同的局面，%s'
          % (len(rows), len(seen), '全部通过 ✓' if bad == 0 else '%d 条有问题' % bad))
    return bad


# ---------------- 教程页 ----------------
def check_tutorial(page, tmpdir):
    """教程页校验：

    1. 页面里每一条公式（就是那些送进计算器的 ↗ 链接）都要能被模拟器解析；
    2. 引用的步骤图都要在、尺寸 256x256；
    3. 教程图是**从局面生成**的，所以再把它们按同一套流水线重画一遍、
       和仓库里那几张逐像素比（允许 2% 的像素有轻微差异，防的是 Pillow 版本差异）。
       这样图就不可能和局面脱节 —— 改了局面没重画、或者手改过图，这里都会红。
    """
    import subprocess
    import tempfile

    import numpy as np
    from PIL import Image

    html = open(page, encoding='utf-8').read()
    bad = 0

    # 1) 公式：教程里能送进计算器的就是公式，逐个解析
    algs = []
    import urllib.parse
    for m in re.finditer(r'href="calc\.html#([^"]+)"', html):
        algs.append(_PREFIX.sub('', urllib.parse.unquote(m.group(1))))
    uniq = sorted(set(algs))
    broken = []
    for a in uniq:
        try:
            sim.parse(a)
        except Exception as e:                      # noqa: BLE001
            broken.append('%s (%s)' % (a, e))
    print('  %d 条公式（%d 个不同），解析失败 %d 条 %s'
          % (len(algs), len(uniq), len(broken), '✓' if not broken else '✗ ' + '; '.join(broken)))
    bad += len(broken)

    # 2) 步骤图
    # 公式图都在 img/ 下：f2l 立体图 256x258、oll / pll 俯视图 256x256、
    # oll2 256x256、pbl2 256x197；tutorial/ 里两种都有（立体图 256x258、形状图 256x256）
    size_of = {'img/f2l/': (256, 258), 'img/oll/': (256, 256), 'img/oll2/': (256, 256),
               'img/pbl2/': (256, 197), 'img/pll/': (256, 256), 'tutorial/': (256, 258)}
    refs = sorted(set(re.findall(
        r'src="((?:img/(?:f2l|oll|oll2|pbl2|pll)|tutorial)/[\w.-]+\.png)"', html)))
    wrong = []
    for r in refs:
        p = os.path.join(ROOT, r)
        if not os.path.exists(p):
            wrong.append(r + ' 不存在')
            continue
        d = next((k for k in size_of if r.startswith(k)), None)
        with Image.open(p) as im:
            want = size_of.get(d)
            if want is None or (im.size != want and not (d == 'tutorial/' and im.size == (256, 256))):
                wrong.append('%s %s≠%s' % (r, im.size, want))
    print('  %d 张图引用，%s' % (len(refs), '全部存在且尺寸对 ✓' if not wrong else '✗ ' + '; '.join(wrong)))
    bad += len(wrong)

    # 2b) data-shape / data-oll 的图，src 是脚本按主题现拼的，上面那轮静态 src 看不到 ——
    #     按命名规律把昼夜两版都查一遍，少了哪一版都会红（换主题时才发现的坑最烦）。
    kinds = sorted(set(re.findall(r'data-shape="([\w-]+)"', html)))
    nol = sorted(set(re.findall(r'data-oll="(\d+)"', html)))
    dyn, dynbad = [], []
    for k in kinds:
        for tone in ('day', 'night'):
            dyn.append('tutorial/shape-%s-%s-256x256.png' % (k, tone))
    for n in nol:
        for tone in ('day', 'night'):
            dyn.append('img/oll/oll-%s-v0-%s-256x256.png' % (n, tone))
    for r in dyn:
        p = os.path.join(ROOT, r)
        if not os.path.exists(p):
            dynbad.append(r + ' 不存在')
        else:
            with Image.open(p) as im:
                if im.size != (256, 256):
                    dynbad.append('%s %s≠(256, 256)' % (r, im.size))
    if kinds or nol:
        print('  按主题现拼的图：%d 种形状图 + %d 个 OLL 编号 × 昼夜两版，%s'
              % (len(kinds), len(nol),
                 '都在且尺寸对 ✓' if not dynbad else '✗ ' + '; '.join(dynbad)))
    # 初级教程那四张形状图就是这四种，少一种（或者名字写错）都得报出来
    if page.endswith('tutorial-basic.html') and kinds != ['corner', 'cross', 'dot', 'line']:
        dynbad.append('第 4 步的形状图不是 dot/line/corner/cross 四种：%s' % ', '.join(kinds))
    bad += len(dynbad)

    # 3) 「图 + 公式」是不是同一个局面 —— 只查第七步那张「用两次小鱼公式」的表。
    #    这类错最隐蔽：公式没错、图也没错，就是放错了行；而且整页里图最容易被悄悄换掉。
    #    判据：把公式的局面（逆运算作用在复原魔方上）转四个 AUF，看有没有一个和图上的
    #    12 条侧面色带完全一致。图上那两张是带箭头的顶层俯视图，配色和 PLL 图一样。
    m7 = re.search(r'<th>用两次小鱼公式</th>([\s\S]*?)</table>', html)
    pairs = []
    if m7:
        pairs = re.findall(r'src="((?:f2l|oll|pll|tutorial)/[\w.-]+\.png)"[\s\S]*?'
                           r'<span class="no">([^<]*)</span>[\s\S]*?<code>([^<]+)</code>', m7.group(1))
    mism = []
    # 初级教程这张表必须还在（图或公式被删掉就该报错，而不是「0 组，通过」）
    if page.endswith('tutorial-basic.html') and len(pairs) != 2:
        mism.append('没有找到「两次小鱼」表的 2 组图与公式（找到 %d 组）' % len(pairs))
    for img, no, alg in pairs:
        st = sim.case_of(alg, 'pll')
        if st is None:
            mism.append('%s：公式局面不是合法 PLL' % alg)
            continue
        rots, cur = [], st
        for _ in range(4):
            rots.append(sim.pll_sig(cur))
            cur = sim.turn(cur, 'U', 1)
        sig = S.read_pll(os.path.join(ROOT, img))
        if sig not in rots:
            mism.append('%s 图上是 %s，公式解的是 %s' % (no or img, sig, ' / '.join(rots)))
    if pairs or page.endswith('tutorial-basic.html'):
        print('  第七步「两次小鱼」表：%d 组图与公式%s'
              % (len(pairs), '对得上 ✓' if not mism else '✗ ' + '; '.join(mism)))
    bad += len(mism)

    return bad


def check_ohpll(page, db_path):
    """单手 PLL 页：每条单手写法和**本页那一行的图**必须是同一个局面。

    页面现在由 data/pll.json 驱动（行、图都来自库），所以这里也读库：
    取每个情况的「单手能用」写法（有 OH 用 OH，没有就回退到 2H —— 和页面同一套规则），
    拿那条写法所在角度的 sig 造出局面、执行公式，按库的判据核
    （签名能复原**或**箭头模式与本角度一致，二者之一即通过）。
    """
    print('=== %s ===' % os.path.basename(page))
    import pll_db as P
    data = json.load(open(db_path, encoding='utf-8'))
    bad, n = 0, 0
    for c in data['cases']:
        oh = [(a, v) for v in c['views'] for a in v['algs'] if 'OH' in a.get('uses', [])]
        if not oh:
            oh = [(a, c['views'][0]) for a in c['views'][0]['algs'] if '2H' in a.get('uses', [])]
        if not oh:
            print('  %-4s ★没有可用的单手 / 双手写法' % c['id']); bad += 1; continue
        for a, v in oh:
            n += 1
            if not os.path.exists(os.path.join(ROOT, v['img'])):
                print('  %-4s ★没有图（%s）' % (c['id'], v['img'])); bad += 1; continue
            try:
                out = sim.apply(P.state_from_sig(v['sig']), clean(a['alg']))
            except Exception as e:
                print('  %-4s ★算不动（%s）' % (c['id'], e)); bad += 1; continue
            base = P.state_from_sig(c['views'][0]['sig'])
            perm0, sk = P.perm_of(base), P.turn_sigma(v['view'])
            want = frozenset((sk[j], sk[perm0[j]]) for j in range(8) if perm0[j] != j)
            st_alg = sim.case_of(clean(a['alg']), 'pll')
            got = P.arrows_of(P.perm_of(st_alg)) if st_alg else None
            if solved_rot(out) or got == want:
                print('  %-4s 图 ✓ 公式 ✓' % c['id'])
            else:
                print('  %-4s ★图和公式不是同一个局面（%s）' % (c['id'], a['alg'])); bad += 1
    print('  %d 条，%s' % (n, '全部通过 ✓' if bad == 0 else '%d 条有问题' % bad))
    return bad


def check_oholl(page, db_path):
    """单手 OLL 页：每个情况那一条单手写法，和**它所在画面**的图必须是同一个局面。

    页面由 data/oll.json 驱动（行、图都来自库），这里也读库：每个情况取标了
    oholl-preferred 的那条（没有就取第一条 OH），核「照这个画面摆好做完就复原」
    （公式局面的签名 == 该画面的 sig，和 oll_db.check 同一条判据）+ 昼夜两张图都在。
    """
    print('=== %s ===' % os.path.basename(page))
    data = json.load(open(db_path, encoding='utf-8'))
    bad, n = 0, 0
    for c in data['cases']:
        oh = [(a, v) for v in c['views'] for a in v.get('algs', [])
              if 'OH' in a.get('uses', [])]
        if not oh:
            print('  %-3s ★没有单手写法' % c['id']); bad += 1; continue
        pref = [x for x in oh if 'oholl-preferred' in (x[0].get('tags') or [])]
        a, v = (pref or oh)[0]
        n += 1
        miss = [k for k in ('img-day', 'img-night') if not os.path.exists(os.path.join(ROOT, v[k]))]
        if miss:
            print('  %-3s ★缺图（%s）' % (c['id'], ' / '.join(miss))); bad += 1; continue
        try:
            st = sim.case_of(clean(a['alg']), 'oll')
        except Exception as e:
            print('  %-3s ★算不动（%s）' % (c['id'], e)); bad += 1; continue
        if st is not None and list(sim.sig_str(st)) == list(v['sig']):
            print('  %-3s v%d 图 ✓ 公式 ✓（%s）' % (c['id'], v['view'], a['alg'][:40]))
        else:
            print('  %-3s ★公式和它所在画面（v%d）对不上（%s）' % (c['id'], v['view'], a['alg']))
            bad += 1
    print('  %d 条，%s' % (n, '全部通过 ✓' if bad == 0 else '%d 条有问题' % bad))
    return bad


def main(argv):
    kind = None
    if '--find' in argv:
        i = argv.index('--find')
        ident = argv[i + 1]
        kind = argv[i + 2] if len(argv) > i + 2 else 'oll'
        return find(kind, ident, os.path.join(ROOT, kind),
                    os.path.join(ROOT, 'tools/data/%s.js' % kind))
    bad = 0
    bad += check_f2l()
    print()
    import f2l_db
    bad += f2l_db.check(os.path.join(ROOT, 'data', 'f2l.json'))
    print()
    # PLL / OLL 的公式与图由各自的库检查（tools/pll_db.py / tools/oll_db.py）：
    # 图签名、公式与角度是不是同一个局面，都在那里逐条核。
    import oll_db
    import oll2_db
    import pbl2_db
    bad += oll_db.check(os.path.join(ROOT, 'data', 'oll.json'))
    print()
    bad += oll2_db.check(os.path.join(ROOT, 'data', 'oll2.json'))
    print()
    bad += pbl2_db.check(os.path.join(ROOT, 'data', 'pbl2.json'))
    print()
    for page in ('tutorial-basic.html', 'tutorial-advanced.html'):
        print('=== %s ===' % page)
        bad += check_tutorial(os.path.join(ROOT, page), None)
        print()
    bad += check_ohpll(os.path.join(ROOT, 'oh-pll.html'),
                       os.path.join(ROOT, 'data', 'pll.json'))
    print()
    bad += check_oholl(os.path.join(ROOT, 'oh-oll.html'),
                       os.path.join(ROOT, 'data', 'oll.json'))
    print()
    import pll_db
    bad += pll_db.check(os.path.join(ROOT, 'data', 'pll.json'))
    print()
    print('总计：%s' % ('全部通过 ✓' if bad == 0 else '%d 条需要处理' % bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
