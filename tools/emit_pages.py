"""把公式库（tools/data/*.json）发布成页面能直接用的 JS 文件。

页面是 file:// 打开的，不能 fetch JSON，所以库里的数据要落成一个 <script src> 能加载的
JS 文件（var PLL_DB = {...}）。页面的公式列表、计算器的「选公式」面板都从这里取，
库 = 唯一数据源，页面不再各存一份。

用法:
    python3 tools/emit_pages.py            # 发布 PLL（含 OH）-> plldata.js
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETS = [('data/pll.json', 'js/plldata.js', 'PLL_DB'),
        ('data/oll.json', 'js/olldata.js', 'OLL_DB'),
        ('data/oll2.json', 'js/oll2data.js', 'OLL2_DB'),
        ('data/pbl2.json', 'js/pbl2data.js', 'PBL2_DB'),
        ('data/f2l.json', 'js/f2ldata.js', 'F2L_DB')]

COMMENT = '''/* 公式表的共享数据，供计算器的「选公式」面板使用。
   七个键全部由 tools/emit_pages.py 从数据库（data/*.json）生成 ——
   不要手改：改公式请改库，然后重跑生成器。
   pll / oll 是「双手」列表（uses 里有 2H 的），ohpll / oholl 是「单手」列表（有 OH 的；
   单手那两栏每情况第一条就是标了首选的那条）。ohpll 的第三项是图，oll / oholl 的第三项是画面号。
   test/cubesim.js 有一条测试盯着这些键必须和库 / 页面一致。 */
'''


def emit(src, out, var):
    data = json.load(open(src, encoding='utf-8'))
    cases = data['cases']

    # 页面只需要「每个情况有哪些角度、每个角度有哪些写法」——顺手把要用的字段挑出来，
    # 页面不用再理解 uses/tags 之外的库内部结构。图字段按库里有什么给什么
    # （PLL 是 img / img-nc-day / img-nc-night；OLL / 二阶 OLL 是 img-day / img-night；
    #   二阶 PBL 另带 state（两层的换角置换），二阶 OLL / PBL 带 label 角标）。
    def alg_out(a):
        return {'no': a['no'], 'alg': a['alg'], 'n': a['n'],
                'uses': a.get('uses', []), 'tags': a.get('tags', [])}

    def view_out(v):
        o = {'view': v['view'], 'frame': v.get('frame', '')}
        for k in ('sig', 'state', 'img', 'img-day', 'img-night', 'img-nc-day', 'img-nc-night'):
            if k in v:
                o[k] = v[k]
        o['algs'] = [alg_out(a) for a in v['algs']]
        return o

    def case_out(c):
        o = {'id': c['id'], 'no': c['no'], 'name': c.get('name', ''),
             'prob': c.get('prob', ''), 'descEn': c.get('descEn', '')}
        if 'views' in c:                       # PLL / OLL / 二阶 OLL：按画面
            o['views'] = [view_out(v) for v in c['views']]
        else:                                  # 二阶 PBL：固定视角，没有 views
            for k in ('state', 'img', 'img-day', 'img-night'):
                if k in c:
                    o[k] = c[k]
            o['algs'] = [alg_out(a) for a in c.get('algs', [])]
        for k in ('group', 'label', 'kind'):
            if k in c:
                o[k] = c[k]
        return o

    def f2l_out(c):
        # F2L 不做转体：一情况一图 + 写法，没有 views
        return {'id': c['id'], 'no': c['no'], 'section': c.get('section', ''),
                'img': c['img'], 'algs': [alg_out(a) for a in c['algs']]}

    payload = {
        'set': data['set'], 'v': data['v'],
        'generated': os.path.relpath(src, ROOT),
        'cases': [f2l_out(c) for c in cases] if 'sections' in data
                 else [case_out(c) for c in cases],
    }
    if 'sections' in data:
        payload['sections'] = data['sections']
    if 'groups' in data:
        payload['groups'] = data['groups']
    text = ('/* 由 tools/emit_pages.py 从 %s 生成 —— 不要手改：\n'
            '   改公式请改数据库，然后重跑生成器。 */\n'
            'var %s = %s;\n' % (payload['generated'], var,
                               json.dumps(payload, ensure_ascii=False, indent=2)))
    path = os.path.join(ROOT, out)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    # 画面：有 views 的（PLL / OLL / 二阶 OLL）按 views 数；二阶 PBL 是固定视角
    n_view = sum(len(c['views']) for c in payload['cases'] if 'views' in c)
    n_alg = sum(len(v['algs']) for c in payload['cases'] for v in (c.get('views') or [c]))
    print('%s <- %s：%d 情况%s / %d 条公式'
          % (out, payload['generated'], len(payload['cases']),
             (' / %d 角度' % n_view) if n_view else '（固定视角）', n_alg))
    return payload


def emit_alglist():
    """alglist.js：七个键（pll / ohpll / oll / oholl / oll2 / pbl2 / f2l）全部从数据库来。"""
    import json as _json
    import re as _re
    pdb = _json.load(open(os.path.join(ROOT, 'data/pll.json'), encoding='utf-8'))
    odb = _json.load(open(os.path.join(ROOT, 'data/oll.json'), encoding='utf-8'))
    o2db = _json.load(open(os.path.join(ROOT, 'data/oll2.json'), encoding='utf-8'))
    p2db = _json.load(open(os.path.join(ROOT, 'data/pbl2.json'), encoding='utf-8'))
    fdb = _json.load(open(os.path.join(ROOT, 'data/f2l.json'), encoding='utf-8'))
    data = {}
    # 两个二阶库都是「一个情况一条写法」，按页面顺序铺开
    data['oll2'] = [[c['id'], a['alg']] for c in o2db['cases'] for a in c['views'][0]['algs']]
    data['pbl2'] = [[c['id'], a['alg']] for c in p2db['cases'] for a in c['algs']]
    # oll 这一栏按页面上的分组顺序（十字 → 单点 → 一字 → 拐角）铺开 ——
    # 和页面字面量原来的顺序一致（practice 的洗牌顺序不会因此变；它按题号去重、只取第一行）。
    # **写法可能挂在别的画面上**（开头带 y/y' 的写法本来就属于那个画面），
    # 所以逐画面铺开，并把画面号放进第三项（计算器的缩略图跟着它走）。
    order = {g['key']: i for i, g in enumerate(odb['groups'])}
    ocases = sorted(odb['cases'], key=lambda c: order.get(c.get('group'), 99))
    # 双手页（oll.html）只显示 2H 的写法，所以这一栏也只收 2H 的
    data['oll'] = [[c['id'], a['alg'], v['view']]
                   for c in ocases for v in c['views'] for a in v['algs']
                   if '2H' in a.get('uses', [])]
    # oholl 这一栏 = 单手能用的（oh-oll.html 那一页）：被合并成 2H+OH 的那几条也算
    # （确实单手也能做）。每情况标了 oholl-preferred 的排最前。第三项是**画面号**
    # （和 oll 一样，计算器的缩略图跟着这一行所属的画面走）。
    data['oholl'] = []
    for c in ocases:
        oh = [(a, v) for v in c['views'] for a in v['algs'] if 'OH' in a.get('uses', [])]
        if not oh:                              # 一个情况一条单手写法都没有时回退双手
            oh = [(a, c['views'][0]) for a in c['views'][0]['algs'] if '2H' in a.get('uses', [])]
        oh.sort(key=lambda t: 0 if 'oholl-preferred' in (t[0].get('tags') or []) else 1)
        for a, v in oh:
            data['oholl'].append([c['id'], a['alg'], v['view']])
    # pll 这一栏是「双手」列表（和页面一致）；两种手性都行的公式（Aa/Ab/T）也在这里
    data['pll'] = [[c['id'], a['alg']] for c in pdb['cases'] for a in c['views'][0]['algs']
                   if '2H' in a.get('uses', [])]
    # ohpll 这一栏是「单手能用」的：包括被合并成 2H+OH 的那几条（确实单手也能做）
    # [编号, 公式, 图]。单手这一栏 = 单手能用的写法：
    #   有单手专属写法就用它；没有（Ga–Gd / Ra 这类「同非 OH 的 PLL」）就回退到双手那条。
    data['ohpll'] = []
    for c in pdb['cases']:
        base = c['views'][0]
        oh = [(a, v) for v in c['views'] for a in v['algs'] if 'OH' in a.get('uses', [])]
        if not oh:
            oh = [(a, base) for a in base['algs'] if '2H' in a.get('uses', [])]
        # 标了 ohpll-preferred 的排前面：那一行/那一页默认显示的就是它
        oh.sort(key=lambda t: 0 if 'ohpll-preferred' in (t[0].get('tags') or []) else 1)
        for a, v in oh:
            data['ohpll'].append([c['id'], a['alg'], v['img']])
    # f2l 这一栏：三阶公式页那 39 个情况（读序），一情况多条写法就铺成多条
    # （顺带修好了旧版从页面抽时的漏抽：07 / 08 / 09 三条以前不在表里）
    data['f2l'] = [[c['id'], a['alg']] for c in fdb['cases'] for a in c['algs']]
    text = COMMENT + 'var ALG_LIST = ' + _json.dumps(data, ensure_ascii=False) + ';\n'
    with open(os.path.join(ROOT, 'js', 'alglist.js'), 'w', encoding='utf-8') as f:
        f.write(text)
    print('alglist.js（全部来自库）：pll %d、ohpll %d、oll %d、oholl %d、oll2 %d、pbl2 %d、f2l %d'
          % (len(data['pll']), len(data['ohpll']), len(data['oll']), len(data['oholl']),
             len(data['oll2']), len(data['pbl2']), len(data['f2l'])))


def main():
    for src, out, var in SETS:
        emit(os.path.join(ROOT, src), out, var)
    emit_alglist()
    return 0


if __name__ == '__main__':
    sys.exit(main())
