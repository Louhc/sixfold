#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""F2L 公式库（data/f2l.json）

**F2L 不做 views / 转体**（用户拍板）：一个情况就一张图，图是固定视角的
`img/f2l/f2l-<编号>-256x258.png`（39 个编号：01a…21b）。库的形状是：

    sections  分节（页面上的三个标题），每节若干行；每行左右两格 [a, b]
              （左 = 红色为 F 面，右 = 绿色为 F 面；只有一个情况时 b 为 null）
    cases     一个情况一条：id / no（全库读序编号 1..39）/ section / img / algs
              （algs 是写法，编号在 case 内连续 —— 现在只有 07 有两条）

`--build` 是**一次性 bootstrap**：从 f2l.html 里的 SECTIONS 字面量重建（页面改成读库之后
就跑不了了）。之后改公式请直接改 data/f2l.json，再重跑 tools/emit_pages.py。

用法：
    python3 tools/f2l_db.py --build     # 从 f2l.html 重建库
    python3 tools/f2l_db.py --check     # 全量校验（结构 + 图存在且 256×258）
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pll_db as P                       # noqa: E402  （借它的 moves_of 切动作）

ROOT = os.path.dirname(HERE)
PAGE = os.path.join(ROOT, 'f2l.html')
DB = os.path.join(ROOT, 'data', 'f2l.json')
IMG = 'img/f2l/f2l-%s-256x258.png'
IMG_SIZE = (256, 258)
TOKEN = re.compile(r"[RLUDFBxyzMESurldfb]w?(?:['2]){0,2}")


def read_page():
    """把 f2l.html 里的 `var SECTIONS = [...]` 字面量取出来（用 node 求值，别自己写 JS 解析）"""
    src = open(PAGE, encoding='utf-8').read()
    m = re.search(r'var SECTIONS = (\[[\s\S]*?\n\]);', src)
    if not m:
        raise SystemExit('f2l.html 里找不到 SECTIONS 字面量（页面已经改成读库了？）')
    js = 'var SECTIONS = %s;\nconsole.log(JSON.stringify(SECTIONS));\n' % m.group(1)
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True)
    if out.returncode:
        raise SystemExit('node 求值失败：\n' + out.stderr)
    return json.loads(out.stdout)


def moves_of(alg):
    """动作序列（和 pll_db 同一套切法）—— F2L 的公式含 y / 宽转，这里只做「切开」不做合法性判断"""
    return P.moves_of(alg)


def build():
    sections, cases = [], []
    n = 0
    for sec in read_page():
        rows = []
        for r in sec['rows']:
            rows.append([r['a'], r['b']])
            for side in ('a', 'b'):                     # 读序：先左后右
                cid = r[side]
                if not cid:
                    continue
                n += 1
                text = r.get(side + 'f') or ''
                algs = []
                for i, line in enumerate([x for x in text.split('\n') if x.strip()], 1):
                    mv = moves_of(line)
                    algs.append({'no': i, 'alg': line, 'moves': mv, 'n': len(mv)})
                cases.append({'id': cid, 'no': n, 'section': sec['title'],
                              'img': IMG % cid, 'algs': algs})
        sections.append({'title': sec['title'], 'rows': rows})
    data = {'set': 'f2l', 'v': 1, 'sections': sections, 'cases': cases}
    with open(DB, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('写出 %s：%d 节 / %d 个情况 / %d 条写法'
          % (os.path.relpath(DB, ROOT), len(sections), len(cases),
             sum(len(c['algs']) for c in cases)))


def check(path=DB):
    print('=== %s ===' % os.path.relpath(path, ROOT))
    data = json.load(open(path, encoding='utf-8'))
    bad = []
    if data.get('set') != 'f2l' or data.get('v') != 1:
        bad.append('set/v 不对：%r' % {k: data.get(k) for k in ('set', 'v')})
    if 'views' in data:
        bad.append('F2L 不做转体：库的顶层不该有 views')
    cases = data.get('cases', [])
    by = {}
    for c in cases:
        cid = c['id']
        if cid in by:
            bad.append('%s：id 重复' % cid)
        by[cid] = c
        if 'views' in c:
            bad.append('%s：F2L 不做转体，情况里不该有 views' % cid)
        algs = c.get('algs') or []
        if not algs:
            bad.append('%s：没有写法' % cid)
        for i, a in enumerate(algs, 1):
            if a.get('no') != i:
                bad.append('%s/%s：写法编号不是 %d（case 内连续）' % (cid, a.get('alg'), i))
            if a.get('n') != len(a.get('moves') or []):
                bad.append('%s/%s：n 与 moves 不一致' % (cid, a.get('alg')))
            # 只切动作、不判合法性（F2L 的公式含 y / 宽转，这里不做局面校验）
            toks = TOKEN.findall((a.get('alg') or '').replace(' ', ''))
            if not toks or len(''.join(toks)) != len(re.sub(r"[\s()（）]+", '', a.get('alg') or '')):
                bad.append('%s/%s：有切不出来的字符' % (cid, a.get('alg')))
            if not a.get('alg'):
                bad.append('%s：空写法' % cid)
        img = os.path.join(ROOT, c.get('img', ''))
        if not os.path.exists(img):
            bad.append('%s：缺图 %s' % (cid, c.get('img')))
        else:
            try:
                from PIL import Image
                with Image.open(img) as im:
                    if im.size != IMG_SIZE:
                        bad.append('%s：图尺寸 %s ≠ %s' % (cid, im.size, IMG_SIZE))
            except ImportError:
                pass
    # 编号 1..n 连续
    nos = [c['no'] for c in cases]
    if nos != list(range(1, len(nos) + 1)):
        bad.append('情况编号 %r 不是 1..%d' % (nos[:8], len(nos)))
    # 每一行两格：id 必须是已知情况（或 null），且每个情况恰好出现一次
    seen = []
    for sec in data.get('sections', []):
        if not sec.get('title'):
            bad.append('有一节没有 title')
        for row in sec.get('rows', []):
            if len(row) != 2:
                bad.append('%s：行不是两格 %r' % (sec.get('title'), row))
                continue
            for cid in row:
                if cid is None:
                    continue
                if cid not in by:
                    bad.append('%s：行里引用了不存在的情况 %s' % (sec.get('title'), cid))
                seen.append(cid)
    if sorted(seen) != sorted(by):
        miss = sorted(set(by) - set(seen))
        extra = sorted(set(seen) - set(by))
        bad.append('分节的行没有覆盖全部情况（漏 %s / 多 %s）' % (miss[:5], extra[:5]))
    if len(seen) != len(set(seen)):
        dup = sorted({x for x in seen if seen.count(x) > 1})
        bad.append('有情况在行里出现多次：%s' % dup)
    n_alg = sum(len(c.get('algs') or []) for c in cases)
    print('  %d 节 / %d 个情况 / %d 条写法（不做转体，一情况一图）'
          % (len(data.get('sections', [])), len(cases), n_alg))
    print('  %s' % ('全部通过 ✓' if not bad else '%d 条有问题' % len(bad)))
    for b in bad:
        print('    ✗ ' + b)
    return 1 if bad else 0


if __name__ == '__main__':
    if '--build' in sys.argv:
        build()
    elif '--check' in sys.argv:
        sys.exit(check())
    else:
        print(__doc__)
