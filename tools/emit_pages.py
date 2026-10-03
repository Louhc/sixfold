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
        ('data/pbl2.json', 'js/pbl2data.js', 'PBL2_DB')]

COMMENT = '''/* 公式表的共享数据，供计算器的「选公式」面板使用。
   pll / ohpll / oll 三个键由 tools/emit_pages.py 从数据库（data/pll.json / data/oll.json）生成 ——
   不要手改：改公式请改库，然后重跑生成器。
   其余集合（f2l / oll2 / pbl2）暂时仍从对应页面抽出。
   ohpll 的键是情况编号（Aa..Z），值是那只手能用的写法（uses 里有 OH 的）。
   test/cubesim.js 有一条测试盯着 pll / oll / f2l 必须和库 / 页面一致。 */
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

    payload = {
        'set': data['set'], 'v': data['v'],
        'generated': os.path.relpath(src, ROOT),
        'cases': [case_out(c) for c in cases],
    }
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
    """alglist.js：pll / ohpll / oll / oll2 / pbl2 从数据库来，其余集合仍从页面抽（还没搬完）。"""
    import json as _json
    import re as _re
    pdb = _json.load(open(os.path.join(ROOT, 'data/pll.json'), encoding='utf-8'))
    odb = _json.load(open(os.path.join(ROOT, 'data/oll.json'), encoding='utf-8'))
    o2db = _json.load(open(os.path.join(ROOT, 'data/oll2.json'), encoding='utf-8'))
    p2db = _json.load(open(os.path.join(ROOT, 'data/pbl2.json'), encoding='utf-8'))
    # 其余集合还没搬完：沿用现文件里的（页面抽出来的那几份），原样保留
    src = open(os.path.join(ROOT, 'js', 'alglist.js'), encoding='utf-8').read()
    old = _json.loads(_re.search(r'var ALG_LIST = (\{.*\});', src, _re.S).group(1))
    data = {}
    # 两个二阶库都是「一个情况一条写法」，按页面顺序铺开
    data['oll2'] = [[c['id'], a['alg']] for c in o2db['cases'] for a in c['views'][0]['algs']]
    data['pbl2'] = [[c['id'], a['alg']] for c in p2db['cases'] for a in c['algs']]
    # oll 这一栏按页面上的分组顺序（十字 → 单点 → 一字 → 拐角）铺开 ——
    # 和页面字面量原来的顺序一致（practice 的洗牌顺序不会因此变）
    order = {g['key']: i for i, g in enumerate(odb['groups'])}
    ocases = sorted(odb['cases'], key=lambda c: order.get(c.get('group'), 99))
    data['oll'] = [[c['id'], a['alg']] for c in ocases for a in c['views'][0]['algs']]
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
    if 'f2l' in old:
        data['f2l'] = old['f2l']
    text = COMMENT + 'var ALG_LIST = ' + _json.dumps(data, ensure_ascii=False) + ';\n'
    with open(os.path.join(ROOT, 'js', 'alglist.js'), 'w', encoding='utf-8') as f:
        f.write(text)
    print('alglist.js：pll %d、ohpll %d、oll %d、oll2 %d、pbl2 %d（库），其余 %d 条（页面）'
          % (len(data['pll']), len(data['ohpll']), len(data['oll']),
             len(data['oll2']), len(data['pbl2']),
             sum(len(v) for k, v in data.items()
                 if k not in ('pll', 'ohpll', 'oll', 'oll2', 'pbl2'))))


def main():
    for src, out, var in SETS:
        emit(os.path.join(ROOT, src), out, var)
    emit_alglist()
    return 0


if __name__ == '__main__':
    sys.exit(main())
