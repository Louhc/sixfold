/* 链接检查：五个页面互相跳转，任何一个文件名写错都会静默失效 ——
   页面照常打开，只是点进去 404。所以这里把每个内部链接都对着磁盘查一遍。
 *
 * 用法: node test/links.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? pass++ : fail++; console.log((c ? '  \u2713 ' : '  \u2717 ') + n + (c ? '' : '  -> ' + x)); };

// 从磁盘自动发现，而不是写死清单 —— 加页面不用改测试，
// 但"某页没接进导航"仍然会被下面的交叉核对抓住。
const PAGES = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();

console.log('[1] 磁盘上的页面都在（' + PAGES.length + ' 个）');
PAGES.forEach(p => ok(p + ' 存在', fs.existsSync(path.join(ROOT, p))));

console.log('\n[2] 页面里的每个内部链接都指向真实文件');
{
  const bad = [];
  let n = 0;
  PAGES.forEach(p => {
    const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const re = /(?:href|src)="([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) {
      const url = m[1];
      if (/^(https?:|mailto:|data:|#|javascript:)/.test(url)) continue;   // 外部/锚点
      // 页面里有 JS 拼路径的写法（src="' + IMG(n) + '"），不是真实链接
      if (/['+()\s]/.test(url)) continue;
      n++;
      const file = url.split('#')[0].split('?')[0];
      if (!file) continue;
      if (!fs.existsSync(path.join(ROOT, file))) bad.push(p + ' -> ' + url);
    }
  });
  ok('检查了 ' + n + ' 条内部链接', bad.length === 0, bad.join(' | '));
}

console.log('\n[3] 导航条覆盖全部页面');
{
  const nav = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  // 只从 PAGES 那张表里取（表里除了入口页，还有「同一个入口管的其它页」）
  const table = nav.slice(nav.indexOf('var PAGES = ['), nav.indexOf('];', nav.indexOf('var PAGES = [')));
  // 第四项那种「一项管好几页」的写法会把第一页再写一遍，所以按不重复的算
  const listed = [...new Set([...table.matchAll(/'([\w-]+\.html)'/g)].map(m => m[1]))];
  ok('nav.js 列了 ' + listed.length + ' 个页面', listed.length === PAGES.length, listed.join(','));
  ok('nav.js 与磁盘上的页面完全一致',
    PAGES.every(p => listed.includes(p)) && listed.every(p => PAGES.includes(p)),
    'nav: ' + listed.join(',') + ' / 磁盘: ' + PAGES.join(','));
}

console.log('\n[4] 五个页面都接入了导航');
PAGES.forEach(p => {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  ok(p + ' 引入了 nav.css 与 nav.js',
    html.includes('href="css/nav.css"') && html.includes('src="js/nav.js"'));
});

console.log('\n[4b] 首页的 GitHub 纸带');
{
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/class="ghribbon"><a href="([^"]+)"/);
  ok('首页有 GitHub 纸带', !!m, '没找到 .ghribbon');
  ok('指向本仓库、新窗口打开',
    !!m && /^https:\/\/github\.com\/Louhc\/sixfold\/?$/.test(m[1]) &&
    /class="ghribbon"[\s\S]{0,300}?target="_blank"/.test(html) &&
    /class="ghribbon"[\s\S]{0,300}?rel="noopener"/.test(html),
    m && m[1]);
  // 位置：贴在导航条【下面】，不能压住导航栏；也不该再让导航让内边距
  ok('贴在导航条下方（不覆盖导航栏）',
    /\.ghribbon\{[^}]*top:var\(--nav-h, 63px\)[^}]*right:0[^}]*overflow:hidden/.test(html) &&
    !/\.topnav\{padding-right/.test(html));
  ok('45° 斜贴', /\.ghribbon a\{[^}]*transform:rotate\(45deg\)/.test(html));
  ok('内容是 octocat 图标 + 英文',
    /class="ghribbon"[\s\S]{0,400}?<svg viewBox="0 0 16 16"/.test(html) &&
    /class="ghribbon"[\s\S]{0,1200}?>Fork me on GitHub<\/a>/.test(html) &&
    !/[\u4e00-\u9fa5]/.test((html.match(/class="ghribbon"[\s\S]{0,1200}?<\/a>/) || [''])[0]));
  ok('GitHub 经典黑白配色',
    /\.ghribbon a\{[^}]*background:#24292f[^}]*color:#fff/.test(html) &&
    /html\[data-theme="dark"\] \.ghribbon a\{background:#f0f6fc;color:#24292f\}/.test(html));
  ok('悬浮时加阴影，且阴影有过渡',
    /\.ghribbon a\{[^}]*box-shadow:[^;}]+[^}]*transition:background \.12s, box-shadow/.test(html) &&
    /\.ghribbon a:hover\{[^}]*box-shadow:/.test(html));
  // 夜里的底色是深的，黑色阴影压上去看不见 —— 得换成白色光晕
  ok('夜里悬浮靠光晕（黑阴影在深色底上等于没有）',
    /html\[data-theme="dark"\] \.ghribbon a:hover\{[^}]*box-shadow:[^}]*#ffffff/.test(html));
}

console.log('\n[5] 导航样式表存在且定义了当前页高亮');
{
  const css = fs.readFileSync(path.join(ROOT, 'css', 'nav.css'), 'utf8');
  ok('nav.css 有 .topnav 与选中态', /\.topnav\{/.test(css) && /\.topnav a\.on\{/.test(css));
  ok('nav.css 给编辑器的全高布局让了高度',
    /body > \.app\{height:calc\(100% - var\(--nav-h\)\)\}/.test(css), '缺少 .app 高度补偿');
  // 导航条高度和字号（和面板里的字号配一配）；用到兜底值的地方必须和它对得上
  const navH = (css.match(/:root\{\s*--nav-h:\s*(\d+)px/) || [])[1];
  ok('导航条高度是 63px（原来 42px 的 1.5 倍）', navH === '63', navH);
  ok('导航文字 14px（原 13px + 1）',
    /\.topnav\{[\s\S]*?font:14px\/1 system-ui/.test(css));
  const fallbacks = [];
  PAGES.forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    [...h.matchAll(/var\(--nav-h,\s*(\d+)px\)/g)].forEach(m => fallbacks.push(p + ':' + m[1]));
  });
  ok('用到 --nav-h 兜底值的地方（' + fallbacks.length + ' 处）和它本身对得上',
    fallbacks.length > 0 && fallbacks.every(x => x.split(':')[1] === navH),
    fallbacks.join(' '));
}

console.log('\n[6] 回到顶部按钮');
{
  const js = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'css', 'nav.css'), 'utf8');
  ok('nav.css 定义了 .totop', /\.totop\{/.test(css));
  ok('按钮是纯图标（无可见文字）', /textContent = '\\u2191'/.test(js),
    '按钮文字不是 ↑');
  ok('滚动事件驱动显隐', /\.totop\.on/.test(css) && /classList\.toggle\('on'/.test(js));
  // 第三项是 1 表示要「回到顶部」；后面还可能跟「同一个入口管的其它页」
  const withBtn = [...js.matchAll(/\['([^']+)',\s*'[^']*',\s*1[,\]]/g)].map(m => m[1]);
  ok('长页才需要它：教程、三阶公式（管三页）和单手公式（' +
     withBtn.slice().sort().join(',') + '）',
    withBtn.slice().sort().join(',') === 'f2l.html,oh-oll.html,tutorial-basic.html',
    withBtn.join(','));
}

console.log('\n[7] 三个公式页都有分节计数与编号角标');
{
  // 只做静态检查：确认样式和渲染代码都还在。
  // 真渲染另由 test/interaction.js 那套 DOM 桩覆盖（那是给编辑器用的）。
  ['f2l.html', 'oll.html', 'pll.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + ' 样式里有 .cnt 与 .no',
      /section > h2 \.cnt\{/.test(h) && /td\.pic \.no\{/.test(h));
    ok(p + ' 渲染时会输出计数与编号',
      /class="cnt"/.test(h) && /class="no"/.test(h));
  });
}

console.log('\n[8] F2L 角标：显示去掉前导 0，文件名不动');
{
  // 角标是给人看的、文件名是给磁盘的，两者不能一起改 ——
  // 所以这里同时盯住「角标没有 0 开头」和「文件名仍带 0」。
  const h = fs.readFileSync(path.join(ROOT, 'f2l.html'), 'utf8');
  ok('角标做了去前导 0', /name\.replace\(\/\^0\+\//.test(h));
  ok('文件名仍用原名（未被去 0 波及）', /IMG\(name\)/.test(h));
  const imgs = fs.readdirSync(path.join(ROOT, 'img/f2l'))
    .filter(f => f.endsWith('.png'));
  ok('磁盘上仍是 01a 这种命名（' + imgs.length + ' 张）',
    imgs.includes('f2l-01a-256x258.png') && imgs.includes('f2l-21b-256x258.png'),
    imgs.slice(0, 3).join(','));
}

console.log('\n[8b] F2L 库（data/f2l.json）：分节 + 一情况一图，**不做转体**');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/f2l.json'), 'utf8'));
  const h = fs.readFileSync(path.join(ROOT, 'f2l.html'), 'utf8');
  ok('F2L 库的形状：set/v 对、有 sections 和 cases',
    db.set === 'f2l' && db.v === 1 && Array.isArray(db.sections) && Array.isArray(db.cases),
    Object.keys(db).join(','));
  ok('F2L 不做转体：库里（含每个情况）都不该有 views / frame',
    !('views' in db) && db.cases.every(c => !('views' in c) && !('frame' in c)));
  ok('39 个情况：编号 1..39 连续、id 不重复、每个情况至少一条写法',
    db.cases.length === 39 &&
    db.cases.map(c => c.no).join(',') === db.cases.map((_, i) => i + 1).join(',') &&
    new Set(db.cases.map(c => c.id)).size === 39 &&
    db.cases.every(c => c.algs.length >= 1) &&
    db.cases.every(c => c.algs.map(a => a.no).join(',') === c.algs.map((_, i) => i + 1).join(',')),
    db.cases.length + ' 情况 / ' +
      db.cases.reduce((n, c) => n + c.algs.length, 0) + ' 条写法');
  ok('40 条写法；07 有两条（页面里那一格是换行分开的两条）',
    db.cases.reduce((n, c) => n + c.algs.length, 0) === 40 &&
    db.cases.filter(c => c.id === '07')[0].algs.length === 2,
    JSON.stringify(db.cases.filter(c => c.id === '07')[0].algs.map(a => a.alg)));
  const covered = db.sections.flatMap(s => s.rows.flat()).filter(Boolean);
  const singles = db.sections.flatMap(s => s.rows).filter(r => r[1] === null).map(r => r[0]);
  ok('分节的行正好覆盖全部 39 个情况（每行左右两格；07/08/09 是单图形行）',
    covered.length === 39 && new Set(covered).size === 39 &&
    covered.slice().sort().join(',') === db.cases.map(c => c.id).sort().join(',') &&
    singles.join(',') === '07,08,09',
    covered.length + ' 格 / 单图形行 ' + singles.join(','));
  const missImg = db.cases.filter(c => !fs.existsSync(path.join(ROOT, c.img)));
  ok('每个情况的图都在（img/f2l/f2l-<编号>-256x258.png）', missImg.length === 0,
    missImg.slice(0, 2).map(c => c.img).join(','));
  // 页面这一侧：读库渲染，没有 SECTIONS 字面量了
  ok('f2l.html 引了 js/f2ldata.js、SECTIONS 由库生成（页面里没有字面量）',
    /<script src="js\/f2ldata\.js"><\/script>/.test(h) &&
    /typeof F2L_DB !== 'undefined' && F2L_DB\.cases/.test(h) &&
    !/var SECTIONS = \[\s*\n\s*\{/.test(h) &&
    /var SECTIONS = \(F2L\.sections \|\| \[\]\)/.test(h));
  ok('生成物 js/f2ldata.js 里也是 39 情况 / 40 条（固定视角）',
    /var F2L_DB = \{/.test(fs.readFileSync(path.join(ROOT, 'js', 'f2ldata.js'), 'utf8')) &&
    !/"views"/.test(fs.readFileSync(path.join(ROOT, 'js', 'f2ldata.js'), 'utf8')));
}

console.log('\n[8b2] jperm 的 OLL 清单也并进来了（data/oll.json）');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(c => c.id === id)[0];
  const algs = id => cs(id).views[0].algs;
  const total = db.cases.reduce((n, c) => n + c.views.reduce((m, v) => m + v.algs.length, 0), 0);
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a =>
    ({ v: v.view, alg: a.alg, verified: a.verified || '' })));
  ok('OLL 库 169 条写法 / 57 个情况（jperm 两批 + 用户逐条清过；重复的已合并）',
    total === 169 && db.cases.length === 57, total + ' 条 / ' + db.cases.length + ' 情况');
  ok('原样对得上的条目进来了（1 号那条）',
    algs('1').some(a => a.alg === "R U2 R' R' F R F' U2 R' F R F'"),
    JSON.stringify(algs('1').map(a => a.alg)));
  ok('开头带 y 的写法：去掉 y、归到它自己那个画面（26 号：`(R U2 R\') U\' R U\' R\'` → v1），不硬塞 AUF',
    all('26').some(a => a.v === 1 && a.alg === "(R U2 R') U' R U' R'" && /归到 v1/.test(a.verified)) &&
    !all('26').some(a => /^\s*y/.test(a.alg)),
    JSON.stringify(all('26').map(a => [a.v, a.alg, a.verified])));
  ok('确实有写法挂在非基准画面上（57 条落在 v1 / v2 / v3）',
    db.cases.reduce((n, c) => n + c.views.slice(1).reduce((m, v) => m + v.algs.length, 0), 0) === 57,
    String(db.cases.reduce((n, c) => n + c.views.slice(1).reduce((m, v) => m + v.algs.length, 0), 0)));
  ok('每条写法都有 verified 来源说明',
    db.cases.every(c => c.views.every(v => v.algs.every(a => a.verified))));
  ok('分组没被导入搅乱（还是页面那四个分组）',
    db.groups.map(g => g.key).join(',') === 'cross,dot,line,corner');
}

console.log('\n[8b8] OLL 8：去掉 3 号，加上 15 号 1 号公式的逆（同时算 2H + OH）');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const NEW = "(r' U' r) (U' R' U R) (r' U r)";
  const r8 = all('8');
  ok('8 号：原来那条 L 版没了；1/2 号是同一条（已合并），现在是 4 条（v0 两条 + v2 两条）',
    r8.length === 4 && !r8.some(a => a.alg === "l' U' L U' L' U2 l") &&
    r8.map(a => a.no).join(',') === '1,2,3,4' &&
    r8.filter(a => a.view === 2).length === 2,
    JSON.stringify(r8.map(a => [a.no, a.view, a.alg])));
  ok('新加的那条在 v0、uses = 2H+OH、没有抢首选标签',
    r8.some(a => a.view === 0 && a.alg === NEW && a.uses.join('+') === '2H+OH' &&
                 (a.tags || []).length === 0),
    JSON.stringify(r8.filter(a => a.alg === NEW).map(a => [a.view, a.uses, a.tags])));
  ok('8 号的两个首选现在都在合并后的那条上（v0 #1：(r\' U\' R) (U\' R\' U2 r)）',
    all('8').filter(a => (a.tags || []).indexOf('preferred') >= 0).length === 1 &&
    all('8').filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0).length === 1 &&
    all('8').filter(a => (a.tags || []).indexOf('preferred') >= 0)[0].alg === "(r' U' R) (U' R' U2 r)" &&
    all('8').filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0)[0].uses.join('+') === '2H+OH');
  // 逆关系：把 15 号 1 号的动作倒过来、逐步取反，必须正好等于新加的这条
  const m15 = cs('15').views[0].algs[0].moves;
  const inv = m15.slice().reverse().map(m => m.endsWith('2') ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'"));
  const got = r8.filter(a => a.alg === NEW)[0].moves;
  ok('确实是 15 号 1 号的逆（倒序 + 逐步取反，动作逐个对得上）',
    inv.join(' ') === got.join(' '), inv.join(' ') + '  vs  ' + got.join(' '));
}

console.log('\n[8b9] OLL 8：把去掉的那条加回来，改成 z 开头（L→U、U→R，宽转 l→u）');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const c = db.cases.filter(x => x.id === '8')[0];
  const all = c.views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const OLD = "l' U' L U' L' U2 l";
  const NEW = "z u' R' U R' U' R2 u";
  const M = { 'L': 'U', "L'": "U'", 'U': 'R', "U'": "R'", 'U2': 'R2', 'l': 'u', "l'": "u'" };
  const toks = OLD.split(/\s+/);
  ok('新加的那条在 v2（原来那条所在的画面）、uses = 2H+OH、没有抢首选',
    all.some(a => a.view === 2 && a.alg === NEW && a.uses.join('+') === '2H+OH' &&
                 (a.tags || []).length === 0),
    JSON.stringify(all.map(a => [a.no, a.view, a.uses, a.alg])));
  ok('映射对得上：老那条逐动作套 L→U / U→R（宽转 l→u）再加 z 前缀，就是新这条',
    'z ' + toks.map(t => M[t]).join(' ') === NEW &&
    toks.map(t => M[t]).join(' ') === "u' R' U R' U' R2 u", toks.map(t => M[t]).join(' '));
  ok('老那条（l 开头的那版）没有以原样回来', !all.some(a => a.alg === OLD));
}

console.log('\n[8b10] OLL 5 / 7：都把首选换成 z 开头的版本');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  // 和页面/库里同一套：L→U、U→R（撇号照搬），宽转 l→u，前面加 z
  const T = { 'L': 'U', "L'": "U'", 'U': 'R', "U'": "R'", 'U2': 'R2', 'l': 'u', "l'": "u'" };
  const map2 = (txt, m) => 'z ' + txt.split(/\s+/).map(t => m[t]).join(' ');
  const OLD5 = "l' U2 L U L' U l", NEW5 = "z u' R2 U R U' R u";
  ok('5 号：2 号换成了 z 版（老那条不在了），而且它就是单手首选',
    !all('5').some(a => a.alg === OLD5) &&
    all('5').some(a => a.view === 0 && a.alg === NEW5 && a.uses.join('+') === '2H+OH') &&
    ohPref('5').length === 1 && ohPref('5')[0].alg === NEW5,
    JSON.stringify(all('5').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  ok('5 号：映射对得上（L→U / U→R，宽转 l→u，撇号照搬）', map2(OLD5, T) === NEW5, map2(OLD5, T));
  // 7 号：8 号 2 号（r' U' R U' R' U2 r）的镜像的 z 变换 —— 镜像会翻方向，所以映射是带翻的版本
  const T7 = { 'L': "U'", "L'": 'U', 'U': "R'", "U'": 'R', 'U2': 'R2', 'l': "u'", "l'": 'u' };
  const OLD8_2 = "r' U' R U' R' U2 r", MIRROR = "l' U' L U' L' U2 l", NEW7 = "z u R U' R U R2 u'";
  ok('7 号：加上了「8 号 2 号的镜像」的 z 变换，它是单手首选，而且**只**算单手（uses = OH）',
    all('7').some(a => a.view === 0 && a.alg === NEW7 && a.uses.join('+') === 'OH') &&
    ohPref('7').length === 1 && ohPref('7')[0].alg === NEW7,
    JSON.stringify(all('7').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  // 镜像那一步就是 R↔L；再套「带翻的 L→U' / U→R'、宽转 l→u'」，两条路都该得到新那条
  const T7R = { 'R': "U'", "R'": 'U', 'U': "R'", "U'": 'R', 'U2': 'R2', 'r': "u'", "r'": 'u' };
  ok('7 号：映射对得上（镜像 + 带翻的 L→U\' / U→R\'、宽转 l→u\'）',
    map2(MIRROR, T7) === NEW7 && map2(OLD8_2, T7R) === NEW7,
    map2(MIRROR, T7) + '  /  ' + map2(OLD8_2, T7R));
  ok('7 号原来那条单手首选（r U R\' U R U2 r\'，v2）还在，只是不再是首选',
    all('7').some(a => a.view === 2 && a.alg === "r U R' U R U2 r'" && (a.tags || []).length === 0));
}

console.log('\n[8b11] OLL 39：加上「40 号 1 号的镜像」的 z 变换，当单手首选（只算单手）');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  const NEW = "z U F' U' R' U R F R' U'";
  const A40 = "(R' F) (R U R' U') F' (U R)";      // 40 号 1 号（也是双手首选）
  const A39 = "(L F') (L' U' L U) F (U' L')";      // 它的镜像，正好就是 39 号 1 号
  ok('39 号：1 号仍然就是 40 号 1 号的镜像（R↔L 换一下）',
    all('39').some(a => a.alg === A39 && (a.tags || []).indexOf('preferred') >= 0) &&
    all('40').some(a => a.alg === A40));
  ok('39 号：新加的那条在 v0、uses 只有 OH、且是单手首选',
    all('39').some(a => a.view === 0 && a.alg === NEW && a.uses.join('+') === 'OH') &&
    ohPref('39').length === 1 && ohPref('39')[0].alg === NEW,
    JSON.stringify(all('39').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  // 映射：L→U、U→R、F 不变（撇号照搬），前面加 z
  const T = { 'L': 'U', "L'": "U'", 'U': 'R', "U'": "R'", 'F': 'F', "F'": "F'" };
  const toks = A39.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
  ok('39 号：映射对得上（L→U、U→R、F 不变 + z）',
    'z ' + toks.map(t => T[t]).join(' ') === NEW, toks.map(t => T[t]).join(' '));
  ok('39 号原来那条单手首选还在，只是不再是首选',
    all('39').some(a => a.alg === "r U' r' U' r y R U R' f'" && (a.tags || []).length === 0));
}

console.log('\n[8b12] OLL 36 / 38：各自的 1 号当单手首选（38 那条做了 z 变换）');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  const A36 = "(R U'2 R'2 F2) (r U' R U'2) r' F";
  ok('36 号：1 号加了 OH、同时是双手首选 + 单手首选（唯一的一条单手首选）',
    all('36').some(a => a.alg === A36 && a.uses.join('+') === '2H+OH' &&
      (a.tags || []).indexOf('preferred') >= 0 && (a.tags || []).indexOf('oholl-preferred') >= 0) &&
    ohPref('36').length === 1 && ohPref('36')[0].alg === A36,
    JSON.stringify(all('36').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  ok('36 号原来那条单手首选还在（只是摘掉了标签）',
    all('36').some(a => a.alg === "R' U' R U' R' U R U x' R U' R' U" && (a.tags || []).length === 0));
  const A38 = "(L' U'2 L2 F'2) (l' U L' U2) l F'";
  const NEW38 = "z U' R'2 U2 F'2 u' R U' R2 u F'";
  ok('38 号：1 号仍是 2H 首选（不标 OH），新加的那条在 v0、uses 只有 OH、是唯一单手首选',
    all('38').some(a => a.alg === A38 && a.uses.join('+') === '2H') &&
    all('38').some(a => a.view === 0 && a.alg === NEW38 && a.uses.join('+') === 'OH') &&
    ohPref('38').length === 1 && ohPref('38')[0].alg === NEW38,
    JSON.stringify(all('38').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  // 映射：L→U、U→R、F 不变（撇号照搬），宽转 l→u，前面加 z
  const T = { 'L': 'U', "L'": "U'", 'U': 'R', "U'": "R'", 'L2': 'U2', 'U2': 'R2', "U'2": "R'2",
              'F': 'F', "F'": "F'", "F'2": "F'2", 'l': 'u', "l'": "u'" };
  const toks = A38.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
  ok('38 号：z 变换对得上（L→U、U→R、F 不变、宽转 l→u，撇号照搬 + z）',
    'z ' + toks.map(t => T[t]).join(' ') === NEW38, toks.map(t => T[t]).join(' '));
}

console.log('\n[8b13] OLL 52：加一条新写法，同时当双手首选 + 单手首选');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const NEW52 = "R' U' R U' R' U F' U F R";
  const first = NEW52.split(' ')[0];
  ok('52 号：新写法在 v0、uses = 2H+OH、同时是双手首选 + 单手首选（各只有它一个）',
    all('52').some(a => a.view === 0 && a.alg === NEW52 && a.uses.join('+') === '2H+OH' &&
      (a.tags || []).indexOf('preferred') >= 0 && (a.tags || []).indexOf('oholl-preferred') >= 0) &&
    all('52').filter(a => (a.tags || []).indexOf('preferred') >= 0).length === 1 &&
    all('52').filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0).length === 1,
    JSON.stringify(all('52').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  ok('52 号：原来的双手首选 / 单手首选都还在，只是摘了标签',
    all('52').some(a => a.alg === "(R' U' R U') (R' U) y' (R' U R B)") &&
    all('52').some(a => a.alg === "R U R' U R U' y R U' R' F'" && (a.tags || []).length === 0));
  ok('52 号：新写法确实是库里这条（首段对得上、带 moves/n）',
    all('52').filter(a => a.alg === NEW52)[0].moves.join(' ').indexOf(first) === 0 &&
    all('52').filter(a => a.alg === NEW52)[0].n === 10,
    JSON.stringify([all('52').filter(a => a.alg === NEW52)[0].moves]));
}

console.log('\n[8b15] OLL 49 / 50 / 54：单手首选换成用户指定的那条（49 / 54 是 1 号的 z 变换）');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  const A49 = "(l U') (l'2 U l2 U l'2) (U' l)";
  const NEW49 = "z u R' u'2 R u2 R u'2 R' u";
  ok('49 号：1 号仍是 2H 首选（不带 OH）；新加的 z 变换在 v0、只算单手、是唯一单手首选',
    all('49').some(a => a.alg === A49 && a.uses.join('+') === '2H' &&
      (a.tags || []).join() === 'preferred') &&
    all('49').some(a => a.view === 0 && a.alg === NEW49 && a.uses.join('+') === 'OH') &&
    ohPref('49').length === 1 && ohPref('49')[0].alg === NEW49,
    JSON.stringify(all('49').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  ok('50 号：只有 1 号一条，它同时是双手 + 单手首选（只改了首选，没有加写法）',
    all('50').length === 1 &&
    all('50')[0].uses.join('+') === '2H+OH' &&
    (all('50')[0].tags || []).join() === 'preferred,oholl-preferred',
    JSON.stringify(all('50').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  const NEW54 = "z u R U' R U R' U' R U R2 u'", A54 = "(l U) (L' U L U') (L' U L U2) l'";
  ok('54 号：1 号仍是 2H 首选；新加的 z 变换在 v0、只算单手、是唯一单手首选',
    all('54').some(a => a.alg === A54 && a.uses.join('+') === '2H' &&
      (a.tags || []).join() === 'preferred') &&
    all('54').some(a => a.view === 0 && a.alg === NEW54 && a.uses.join('+') === 'OH') &&
    ohPref('54').length === 1 && ohPref('54')[0].alg === NEW54,
    JSON.stringify(all('54').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  /* z 变换的映射：L→U、U→R、R→D、D→L、F/B 不变（撇号照搬），宽转 l→u、r→d，前面加 z */
  const M = { 'L': 'U', "L'": "U'", 'L2': 'U2', "L'2": "U'2", 'U': 'R', "U'": "R'", 'U2': 'R2',
              "U'2": "R'2", 'R': 'D', "R'": "D'", 'R2': 'D2', 'D': 'L', "D'": "L'", 'D2': 'L2',
              'F': 'F', "F'": "F'", 'B': 'B', "B'": "B'", 'l': 'u', "l'": "u'", 'l2': 'u2',
              "l'2": "u'2", 'r': 'd', "r'": "d'", 'r2': 'd2' };
  [[ '49', A49, NEW49 ], [ '54', A54, NEW54 ]].forEach(([id, src, alg]) => {
    const toks = src.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
    ok(id + ' 号：z 变换逐动作对得上（' + toks.map(t => M[t]).join(' ') + '）',
      'z ' + toks.map(t => M[t]).join(' ') === alg, toks.map(t => M[t]).join(' '));
  });
}

console.log('\n[8b16] OLL 47：撤掉 1 号的 OH，改用 1 号的 z 变换当单手首选');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  const A47 = "F' (L' U' L U) (L' U' L U) F", NEW47 = "z F' U' R' U R U' R' U R F";
  ok('47 号：1 号只剩 2H（不再是单手）、仍是双手首选；新加的 z 变换在 v0、只算单手、是唯一单手首选',
    all('47').some(a => a.alg === A47 && a.uses.join('+') === '2H' &&
      (a.tags || []).join() === 'preferred') &&
    all('47').some(a => a.view === 0 && a.alg === NEW47 && a.uses.join('+') === 'OH') &&
    ohPref('47').length === 1 && ohPref('47')[0].alg === NEW47,
    JSON.stringify(all('47').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  const M = { 'L': 'U', "L'": "U'", 'U': 'R', "U'": "R'", 'F': 'F', "F'": "F'" };
  const toks = A47.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
  ok('47 号：z 变换逐动作对得上（' + toks.map(t => M[t]).join(' ') + '）',
    'z ' + toks.map(t => M[t]).join(' ') === NEW47, toks.map(t => M[t]).join(' '));
}

console.log('\n[8b17] OLL 29：加上 30 号唯一单手写法的「镜像 + z 变换」，当单手首选');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohOf = id => all(id).filter(a => a.uses.indexOf('OH') >= 0);
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  const SRC = "F U (R U2 R' U') R U2 R' U' F'";        // 30 号唯一的单手写法
  const NEW = "z F' R' U' R2 U R U' R2 U R F";
  ok('30 号：唯一那条单手写法就是镜像的源（它自己是单手首选）',
    ohOf('30').length === 1 && ohOf('30')[0].alg === SRC && ohPref('30')[0].alg === SRC,
    JSON.stringify(ohOf('30').map(a => a.alg)));
  ok('29 号：新条在 v0、uses 只有 OH、是唯一单手首选；原来那条单手首选只是摘了标签',
    all('29').some(a => a.view === 0 && a.alg === NEW && a.uses.join('+') === 'OH') &&
    ohPref('29').length === 1 && ohPref('29')[0].alg === NEW &&
    all('29').some(a => a.alg === "R U R' U' R U' R' F' U' F R U R'" && (a.tags || []).length === 0),
    JSON.stringify(all('29').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  /* 镜像：R↔L、r↔l 并翻方向（半转只换面）；再套 z 变换 L→U、U→R、R→D、D→L、F/B 不变，前面加 z */
  const MIR = { 'R': 'L', "R'": "L'", 'R2': 'L2', 'L': 'R', "L'": "R'", 'L2': 'R2',
                'r': 'l', "r'": "l'", 'l': 'r', "l'": "r'" };
  const SIG = { 'L': 'U', "L'": "U'", 'L2': 'U2', 'U': 'R', "U'": "R'", 'U2': 'R2',
                'R': 'D', "R'": "D'", 'R2': 'D2', 'D': 'L', "D'": "L'", 'D2': 'L2',
                'F': 'F', "F'": "F'", 'B': 'B', "B'": "B'", 'r': 'd', "r'": "d'", 'l': 'u', "l'": "u'" };
  const toks = SRC.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
  const mirrored = toks.map(t => {
    const base = t.replace(/[2']+$/, ''), suf = t.slice(base.length);
    const m = MIR[base] || base;
    return suf.indexOf('2') >= 0 ? m + '2' : m + (suf.indexOf("'") >= 0 ? '' : "'");
  });
  ok('29 号：镜像 → z 变换逐动作对得上（「' + mirrored.join(' ') + '」→「' +
     mirrored.map(t => SIG[t] || t).join(' ') + '」）',
    'z ' + mirrored.map(t => SIG[t] || t).join(' ') === NEW,
    mirrored.map(t => SIG[t] || t).join(' '));
}

console.log('\n[8b18] OLL 42：加上 41 号唯一单手写法的「镜像 + z 变换」，当单手首选');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohOf = id => all(id).filter(a => a.uses.indexOf('OH') >= 0);
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  const SRC = "(R U R') (U R U2 R') F (R U R' U') F'";     // 41 号唯一那条单手写法
  const NEW = "z U' R' U R' U' R2 U F' U' R' U R F";
  ok('41 号：唯一那条单手写法就是镜像的源',
    ohOf('41').length === 1 && ohOf('41')[0].alg === SRC && ohPref('41')[0].alg === SRC,
    JSON.stringify(ohOf('41').map(a => a.alg)));
  ok('42 号：新条在 v0、uses 只有 OH、是唯一单手首选；原来那条单手首选只是摘了标签',
    all('42').some(a => a.view === 0 && a.alg === NEW && a.uses.join('+') === 'OH') &&
    ohPref('42').length === 1 && ohPref('42')[0].alg === NEW &&
    all('42').some(a => a.alg === "R' U' R U' R' U2 R F R U R' U' F'" && (a.tags || []).length === 0),
    JSON.stringify(all('42').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  const MIR = { 'R': 'L', "R'": "L'", 'R2': 'L2', 'L': 'R', "L'": "R'", 'L2': 'R2',
                'r': 'l', "r'": "l'", 'l': 'r', "l'": "r'" };
  const SIG = { 'L': 'U', "L'": "U'", 'L2': 'U2', 'U': 'R', "U'": "R'", 'U2': 'R2',
                'R': 'D', "R'": "D'", 'R2': 'D2', 'D': 'L', "D'": "L'", 'D2': 'L2',
                'F': 'F', "F'": "F'", 'B': 'B', "B'": "B'", 'r': 'd', "r'": "d'", 'l': 'u', "l'": "u'" };
  const toks = SRC.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
  const mirrored = toks.map(t => {
    const base = t.replace(/[2']+$/, ''), suf = t.slice(base.length);
    const m = MIR[base] || base;
    return suf.indexOf('2') >= 0 ? m + '2' : m + (suf.indexOf("'") >= 0 ? '' : "'");
  });
  ok('42 号：镜像 → z 变换逐动作对得上（「' + mirrored.join(' ') + '」→「' +
     mirrored.map(t => SIG[t] || t).join(' ') + '」）',
    'z ' + mirrored.map(t => SIG[t] || t).join(' ') === NEW,
    mirrored.map(t => SIG[t] || t).join(' '));
}

console.log('\n[8b19] OLL 11：加上 12 号唯一单手写法的「镜像 + z 变换」，当单手首选');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohOf = id => all(id).filter(a => a.uses.indexOf('OH') >= 0);
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  const SRC = "r R2 U' R U' R' U2 R U' r' R";              // 12 号唯一那条单手写法
  const NEW = "z u' U2 R U' R U R2 U' R u U'";
  ok('12 号：唯一那条单手写法就是镜像的源',
    ohOf('12').length === 1 && ohOf('12')[0].alg === SRC && ohPref('12')[0].alg === SRC,
    JSON.stringify(ohOf('12').map(a => a.alg)));
  ok('11 号：新条在 v0、uses 只有 OH、是唯一单手首选；原来那条单手首选只是摘了标签',
    all('11').some(a => a.view === 0 && a.alg === NEW && a.uses.join('+') === 'OH') &&
    ohPref('11').length === 1 && ohPref('11')[0].alg === NEW &&
    all('11').some(a => a.alg === "r U R' U R' F R F' R U2 r'" && (a.tags || []).length === 0),
    JSON.stringify(all('11').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  const MIR = { 'R': 'L', "R'": "L'", 'R2': 'L2', 'L': 'R', "L'": "R'", 'L2': 'R2',
                'r': 'l', "r'": "l'", 'l': 'r', "l'": "r'" };
  const SIG = { 'L': 'U', "L'": "U'", 'L2': 'U2', 'U': 'R', "U'": "R'", 'U2': 'R2',
                'R': 'D', "R'": "D'", 'R2': 'D2', 'D': 'L', "D'": "L'", 'D2': 'L2',
                'F': 'F', "F'": "F'", 'B': 'B', "B'": "B'", 'r': 'd', "r'": "d'", 'l': 'u', "l'": "u'" };
  const toks = SRC.split(/\s+/).filter(Boolean);
  const mirrored = toks.map(t => {
    const base = t.replace(/[2']+$/, ''), suf = t.slice(base.length);
    const m = MIR[base] || base;
    return suf.indexOf('2') >= 0 ? m + '2' : m + (suf.indexOf("'") >= 0 ? '' : "'");
  });
  ok('11 号：镜像 → z 变换逐动作对得上（「' + mirrored.join(' ') + '」→「' +
     mirrored.map(t => SIG[t] || t).join(' ') + '」）',
    'z ' + mirrored.map(t => SIG[t] || t).join(' ') === NEW,
    mirrored.map(t => SIG[t] || t).join(' '));
}

console.log('\n[8b20] OLL 9：加上 10 号 2 号公式的「镜像 + z 变换」，当单手首选');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  const all = id => cs(id).views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const ohPref = id => all(id).filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  const SRC = "R U R' U R' F R F' R U2 R'";               // 10 号 2 号
  const NEW = "z U' R' U R' U F' U' F U' R2 U";
  ok('10 号：2 号就是镜像的源',
    all('10').some(a => a.no === 2 && a.alg === SRC),
    JSON.stringify(all('10').map(a => [a.no, a.alg])));
  ok('9 号：新条在 v3、uses 只有 OH、是唯一单手首选；原来那条单手首选只是摘了标签',
    all('9').some(a => a.view === 3 && a.alg === NEW && a.uses.join('+') === 'OH') &&
    ohPref('9').length === 1 && ohPref('9')[0].alg === NEW &&
    all('9').some(a => a.alg === "R U R' U' R' F R2 U R' U' F'" && (a.tags || []).length === 0),
    JSON.stringify(all('9').map(a => [a.no, a.view, a.uses, a.tags, a.alg])));
  const MIR = { 'R': 'L', "R'": "L'", 'R2': 'L2', 'L': 'R', "L'": "R'", 'L2': 'R2',
                'r': 'l', "r'": "l'", 'l': 'r', "l'": "r'" };
  const SIG = { 'L': 'U', "L'": "U'", 'L2': 'U2', 'U': 'R', "U'": "R'", 'U2': 'R2',
                'R': 'D', "R'": "D'", 'R2': 'D2', 'D': 'L', "D'": "L'", 'D2': 'L2',
                'F': 'F', "F'": "F'", 'B': 'B', "B'": "B'", 'r': 'd', "r'": "d'", 'l': 'u', "l'": "u'" };
  const toks = SRC.split(/\s+/).filter(Boolean);
  const mirrored = toks.map(t => {
    const base = t.replace(/[2']+$/, ''), suf = t.slice(base.length);
    const m = MIR[base] || base;
    return suf.indexOf('2') >= 0 ? m + '2' : m + (suf.indexOf("'") >= 0 ? '' : "'");
  });
  ok('9 号：镜像 → z 变换逐动作对得上（「' + mirrored.join(' ') + '」→「' +
     mirrored.map(t => SIG[t] || t).join(' ') + '」）',
    'z ' + mirrored.map(t => SIG[t] || t).join(' ') === NEW,
    mirrored.map(t => SIG[t] || t).join(' '));
}

console.log('\n[8b7] OLL 15：去掉 3 号，1 / 2 号合并成一条（用户说这两条本质一样）');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const c = db.cases.filter(x => x.id === '15')[0];
  const all = c.views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  ok('15 只剩 1 条写法（v0），3 号那条 L 版彻底没了',
    all.length === 1 && all[0].view === 0 &&
    !all.some(a => a.alg === "l' U' l L' U' L U l' U l"),
    JSON.stringify(all.map(a => [a.view, a.alg])));
  ok('合并后的那条同时是双手首选 + 单手首选，uses = 2H+OH',
    all[0].alg === "(r' U' r) (R' U' R U) (r' U r)" &&
    all[0].uses.join('+') === '2H+OH' &&
    all[0].tags.indexOf('preferred') >= 0 && all[0].tags.indexOf('oholl-preferred') >= 0,
    JSON.stringify([all[0].alg, all[0].uses, all[0].tags]));
  ok('verified 里写清了「和 jperm 那条本质上是一回事」',
    /jperm OH OLL/.test(all[0].verified || '') && /一回事/.test(all[0].verified || ''),
    all[0].verified);
}

console.log('\n[8b6] OH-OLL 14：单手首选换成 13 号那条的镜像（用户指定）');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs = id => db.cases.filter(c => c.id === id)[0];
  const oh = id => cs(id).views.flatMap(v => v.algs).filter(a => a.uses.indexOf('OH') >= 0);
  const NEW = "z F' R' U' R U2 F U' R' U' R U";
  const M13 = "F U R U' R2 F' R U R U' R'";
  const pref14 = oh('14').filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
  ok('14 的单手首选就是这条镜像公式（而且一个情况只有一条首选）',
    pref14.length === 1 && pref14[0].alg === NEW && pref14[0].uses.indexOf('OH') >= 0,
    JSON.stringify(pref14.map(a => [a.alg, a.uses, a.tags])));
  ok('13 号那条还在（14 加的是它的镜像，不是复制一份）',
    oh('13').some(a => a.alg === M13), JSON.stringify(oh('13').map(a => a.alg)));
  // 镜像关系：去掉开头的 z，把 R↔U / L↔D 互换并翻方向，正好回到 13 号那条
  const M = { 'F': "F'", "F'": 'F', 'B': "B'", "B'": 'B', 'R': "U'", "R'": 'U', 'R2': 'U2',
              'U': "R'", "U'": 'R', 'U2': 'R2', 'D': "L'", "D'": 'L', 'D2': 'L2',
              'L': "D'", "L'": 'D', 'L2': 'D2' };
  const back = NEW.replace(/^z\s+/, '').split(/\s+/).map(t => M[t]).join(' ');
  ok('镜像映射对得上（去掉 z 后 R↔U / L↔D 互换 + 翻方向 → 13 号那条）', back === M13, back);
  ok('这条的 verified 里写清了来源（13 号的镜像）',
    /13 号/.test(pref14[0].verified || '') && /镜像/.test(pref14[0].verified || ''),
    pref14[0].verified);
}

console.log('\n[8b5] Na / Nb：两种画面颜色的相对位置一样 → 只留基准画面');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pll.json'), 'utf8'));
  const cs = id => db.cases.filter(x => x.id === id)[0];
  ['Na', 'Nb'].forEach(id => {
    const c = cs(id);
    ok(id + '：只剩 1 个画面（v0），v1 的图也不再被引用 / 不再存在',
      c.views.length === 1 && c.views[0].view === 0 &&
      c.views[0].img.indexOf('-' + id + '-v0-') >= 0 &&
      !fs.existsSync(path.join(ROOT, 'img/pll/pll-' + id + '-v1-256x256.png')),
      JSON.stringify(c.views.map(v => v.view)));
  });
  const na = cs('Na').views[0].algs;
  ok("Na：从另一种画面搬过来的写法补了 AUF（两条单手补末尾 U'、那条 z 打头的补开头 U），一条没丢",
    na.some(a => a.uses.indexOf('OH') >= 0 && a.alg === "L U' R U2 L' U R' L U' R U2 L' U R' U'") &&
    na.some(a => a.uses.indexOf('OH') >= 0 && a.alg === "R U' L U2 R' U L' R U' L U2 R' U L' U'") &&
    na.some(a => a.uses.join('+') === '2H' && a.alg === "U z U R' D R2 U' R D' U R' D R2 U' R D'") &&
    na.length === 6,
    JSON.stringify(na.map(a => [a.no, a.uses, a.alg])));
  ok('Na：单手首选（ohpll-preferred）是搬过来的那条，页面上默认就显示它',
    na.filter(a => (a.tags || []).indexOf('ohpll-preferred') >= 0).length === 1 &&
    na.filter(a => (a.tags || []).indexOf('ohpll-preferred') >= 0)[0].alg ===
      "L U' R U2 L' U R' L U' R U2 L' U R' U'",
    JSON.stringify(na.filter(a => (a.tags || []).indexOf('ohpll-preferred') >= 0).map(a => a.alg)));
  ok('Na / Nb 的每条写法都记着「从另一种画面搬过来 + 补了什么 AUF」',
    ['Na', 'Nb'].every(id => cs(id).views[0].algs.every(a => a.verified)));
}

console.log('\n[8b4] PLL F：和单手首选只差一个 R\' 的那条重复写法已经删掉');
{
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pll.json'), 'utf8'));
  const c = db.cases.filter(x => x.id === 'F')[0];
  const all = c.views.flatMap(v => (v.algs || []).map(a => Object.assign({ view: v.view }, a)));
  const dup = "R U R' U' R' U R U2 R' L' U R U' L U' R U' R'";
  const key = a => a.replace(/[^A-Za-z0-9']/g, '');
  ok('F 现在 2 条写法（双手首选 + jperm 那条合并成的 2H+OH，以及单手首选）',
    all.length === 2 && all.map(a => a.no).join(',') === '1,2',
    JSON.stringify(all.map(a => [a.no, a.uses, a.tags, a.alg])));
  ok('那条「和单手首选只差一个 R\'」的重复写法不在了',
    !all.some(a => key(a.alg) === key(dup)), JSON.stringify(all.map(a => a.alg)));
  ok('1 号是合并后的那条：2H+OH + preferred，文本已经约掉多余的 F\' F（= 18 步）',
    all[0].uses.join('+') === '2H+OH' && all[0].tags.indexOf('preferred') >= 0 &&
    all[0].n === 18 && all[0].alg === "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    JSON.stringify([all[0].uses, all[0].tags, all[0].n, all[0].alg]));
  ok('F 的每条写法里都不再有「相邻两步互相抵消」（F / F\' 这种）',
    all.every(a => !(a.moves || []).some((t, i) => {
      const u = (a.moves || [])[i + 1];
      return !!u && t[0] === u[0] && (t.indexOf("'") >= 0) !== (u.indexOf("'") >= 0);
    })), JSON.stringify(all.map(a => a.moves)));
  ok('2 号是 v3 的单手首选',
    all[1].view === 3 && all[1].uses.join('+') === 'OH' && all[1].tags.indexOf('ohpll-preferred') >= 0,
    JSON.stringify([all[1].view, all[1].uses, all[1].tags]));
}

console.log('\n[8b3] 写法不该以整体转体 y / y\' / y2 开头（画面已经表达了）');
{
  // 开头带 y 的写法是有语义的 —— 正因如此它属于「另一个画面」：
  // 存进库时要去掉 y、搬到那个画面去（用户拍板）。这里盯着三本有画面层的库。
  const Y = /^\s*y(?:2|'|'2)?\s*/;
  ['data/pll.json', 'data/oll.json', 'data/oll2.json'].forEach(f => {
    const db = JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
    const bad = db.cases.flatMap(c => (c.views || [c]).flatMap(v =>
      (v.algs || []).filter(a => Y.test(a.alg)).map(a => c.id + ':' + a.alg)));
    ok(f + '：没有以 y / y\' / y2 开头的写法', bad.length === 0, bad.slice(0, 3).join(' | '));
  });
}

console.log('\n[8c] F2L 页的目录和 PLL / OLL 在同一个位置（正文同宽）');
{
  const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
  const one = (h, re) => (h.match(re) || [])[1] || '';
  const files = ['pll.html', 'oll.html', 'f2l.html'];
  const w = files.map(p => one(read(p), /main\{max-width:(\d+)px/));
  const left = files.map(p => one(read(p), /nav\.side\{[^}]*?left:max\(14px, calc\(50% - (\d+)px\)\)/s));
  const bp = files.map(p => one(read(p), /@media \(max-width:(\d+)px\)\{ nav\.side\{display:none\} \}/));
  ok('三个页面的正文同宽（F2L 以前 1180，太宽把目录挤到更左边）',
    w.every(x => x === '880') && w.length === 3, w.join('/'));
  ok('三个页面的目录 left 和「窄屏收起」阈值都一样',
    left.every(x => x && x === left[0]) && bp.every(x => x && x === bp[0]),
    left.join('/') + ' | ' + bp.join('/'));
  ok('F2L 打印：展开键 / 面板不印、那一列收成 0 宽',
    /\.pickbox,button\.pick\{display:none\}/.test(read('f2l.html')) &&
    /td\.pickCell\{padding:0;width:0\}/.test(read('f2l.html')) &&
    /col\.pick\{width:0\}/.test(read('f2l.html')));
  ok('F2L 打印：展开键那一格**不能** display:none（一行有两组，抽掉格子会让右半边串列消失）',
    !/td\.pickCell\{display:none\}/.test(read('f2l.html')));
  const f2lSrc = read('f2l.html');
  ok('F2L 空白半边：图片列一格（保住列线）+ 其余两列合成一格（末格不再画左边框）',
    /td\.empty\{background:var\(--chip\);border-left:1px solid var\(--line\)\}/.test(f2lSrc) &&
    /td\.emptyTail\{border-left:0\}/.test(f2lSrc) &&
    /<td class="empty"><\/td><td class="empty emptyTail" colspan="2"><\/td>/.test(f2lSrc) &&
    /td\.emptyTail\{border-left:0\}/.test(f2lSrc));
  ok('展开键左边不留表格框：单元格（td.f）和表头那格（th.fh）的右边框都去掉',
    /td\.f\{padding:[^}]*border-right:0\}/.test(f2lSrc) &&
    /th\.fh\{border-right:0\}/.test(f2lSrc) &&
    /<th class="red">红 F<\/th><th class="fh"><\/th><th><\/th>/.test(f2lSrc));
  ok('一格只显示第一条写法：脚本取 algs[0]，CSS 也有兜底（.fw ~ .fw 藏掉）',
    /return c && c\.algs\.length \? c\.algs\[0\]\.alg : null;/.test(f2lSrc) &&
    /td\.f \.fw ~ \.fw\{display:none\}/.test(f2lSrc));
}

console.log('\n[9] 公式页的数据源：两个库都是合法 JSON、结构齐全');
{
  // 生成器早期漏过尾逗号（json 解析直接报错），所以「能解析、结构对」一直单独盯。
  // 现在 pll.html / oll.html 的行数据都由 data/*.json 生成（页面里没有 SECTIONS 字面量了），
  // 所以改成「页面确实在用库」+「库本身结构齐全」两侧一起核。
  const SPEC = {
    'pll.html': { file: 'data/pll.json', dbVar: 'PLL_DB',
                  imgKeys: ['img', 'img-nc-day', 'img-nc-night'] },
    'oll.html': { file: 'data/oll.json', dbVar: 'OLL_DB',
                  imgKeys: ['img-day', 'img-night'] }
  };
  Object.keys(SPEC).forEach(p => {
    const spec = SPEC[p];
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + ' 的 SECTIONS 由数据库生成',
      /var SECTIONS = \(function/.test(h) &&
      new RegExp("typeof " + spec.dbVar + " !== 'undefined' && " + spec.dbVar + "\\.cases").test(h));
    let db;
    try { db = JSON.parse(fs.readFileSync(path.join(ROOT, spec.file), 'utf8')); }
    catch (e) { ok(spec.file + ' 是合法 JSON', false, e.message); return; }
    ok(spec.file + ' 是合法 JSON（' + db.cases.length + ' 个情况）',
      Array.isArray(db.cases) && db.cases.length > 0);
    const ids = db.cases.map(c => c.id);
    ok(spec.file + ' 编号齐全（' + ids.length + ' 条，去重 ' + new Set(ids).size + '）',
      ids.every(x => typeof x === 'string' && x.length > 0));
    const algs = db.cases.flatMap(c => (c.views || []).flatMap(v => v.algs || []));
    ok(spec.file + ' 里每条公式都挂在角度下、写法非空（' + algs.length + ' 条）',
      db.cases.every(c => (c.views || []).length > 0 &&
        c.views.every(v => Array.isArray(v.algs) && v.algs.every(a => typeof a.alg === 'string' && a.alg.trim()))),
      JSON.stringify(algs.filter(a => !(typeof a.alg === 'string' && a.alg.trim()))));
    ok(spec.file + ' 的每个角度都有图',
      db.cases.every(c => c.views.every(v =>
        spec.imgKeys.every(k => typeof v[k] === 'string' && v[k].length > 0))));
  });
}

console.log('\n[11] 公式表的单元格不能用 display:flex');
{
  // 为一个真 bug 加的：给公式加「↗」链接时写了 td.f{display:flex}，
  // 单元格不再是 table-cell，行高和列宽全乱。
  ['f2l.html', 'oll.html', 'pll.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const bad = [...h.matchAll(/(td[\w.-]*\{[^}]*display:\s*flex[^}]*\})/g)].map(m => m[1]);
    ok(p + ' 的 td 没用 flex', bad.length === 0, bad.join(' | '));
    ok(p + ' 仍是正常表格（有 colgroup 或 table-layout）',
      /<colgroup>/.test(h) || /table-layout/.test(h));
  });
}

console.log('\n[11b] 「在计算器里打开」的按钮：图标要真、平时要淡');
{
  // 原来是个 ↗ 文字符号套个边框，看着像表格里掉了个框。现在是内联 SVG 图标
  // （跟着 currentColor 走，白天/夜晚不用各写一套）+ 固定大小的圆钮。
  ['f2l.html', 'oll.html', 'pll.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const icon = h.match(/var CALC_ICON = ('(?:[^'\\]|\\.)*'(?:\s*\+\s*'(?:[^'\\]|\\.)*')*);/);
    const svg = icon ? [...icon[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m => m[1]).join('') : '';
    ok(p + ' 的按钮是内联 SVG 图标', /^<svg [^>]*viewBox="0 0 24 24"/.test(svg) &&
      /stroke="currentColor"/.test(svg) && /fill="currentColor"/.test(svg), svg.slice(0, 40));
    ok(p + ' 的图标是完整闭合的 XML', /<\/svg>$/.test(svg) &&
      (svg.match(/</g) || []).length === (svg.match(/>/g) || []).length, svg.slice(-12));
    ok(p + ' 的图标带了无障碍名字（title + aria-label）',
      /" title="' \+ tip/.test(h) && /" aria-label="' \+ tip/.test(h));
    ok(p + ' 的按钮不再用 ↗ 文字符号', !/[\u2197]/.test(h) &&
      /'" aria-label="' \+ tip \+ '">' \+ CALC_ICON/.test(h));
    // 一个表格里几十个这种钮，常亮会抢公式的戏：默认淡，指到行/钮才实心
    ok(p + ' 的按钮默认压暗（opacity:.55）', /a\.tocalc\{[^}]*opacity:\.55/.test(h));
    ok(p + ' 指到那一行时按钮亮起', /tr:hover a\.tocalc,a\.tocalc:hover,a\.tocalc:focus-visible\{opacity:1\}/.test(h));
    ok(p + ' 钮本身悬浮时填成 accent 实心、文字用 --on-accent（黄底压白字看不清）',
      /a\.tocalc:hover,a\.tocalc:focus-visible\{color:var\(--on-accent, #fff\);background:var\(--accent\)/.test(h));
    ok(p + ' 触屏（没有 hover）时不做淡出，按钮常亮',
      /@media \(hover:none\)\{a\.tocalc\{opacity:1\}\}/.test(h));
    ok(p + ' 打印时不印按钮', /@media print\{[\s\S]*?a\.tocalc\{display:none\}/.test(h));
  });
}

console.log('\n[12] 每个页面的内联脚本都必须能通过语法检查');
{
  // 为一个真事故加的：生成器里的转义被多吃了一层，oll.html / pll.html
  // 的内联脚本里出现了一个真换行，两个页面直接白屏 —— 而当时所有测试都通过，
  // 因为没有任何一条真的去解析这些脚本。用 new Function 做语法检查即可。
  PAGES.forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const blocks = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    if (!blocks.length) return;                       // 没有内联脚本就跳过
    let err = null;
    blocks.forEach((b, i) => {
      try { new Function(b); } catch (e) { err = '第 ' + (i + 1) + ' 段: ' + e.message; }
    });
    ok(p + ' 的内联脚本语法正确（' + blocks.length + ' 段）', !err, err);
  });
}

console.log('\n[13] 切页不该闪：主题要预设、导航条要早注入');
{
  // 为主题闪烁加的两条：
  // 主题原来在页面渲染完之后才设 -> 先用浅色画一遍再翻深色，看着就是一闪。
  // nav.js 原来在 body 末尾 -> 内容先渲染再被挤下去 42px。
  PAGES.forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const head = h.slice(0, h.indexOf('</head>'));
    ok(p + ' 在 head 里预设主题（首次绘制前）',
      /localStorage\.getItem\('cube-theme'\)/.test(head) &&
      /dataset\.theme/.test(head), 'head 里没有预设主题的脚本');
    const body = h.slice(h.indexOf('<body>'));
    const navAt = body.indexOf('src="js/nav.js"');
    ok(p + ' 的 nav.js 在 body 开头注入（不产生位移）',
      navAt >= 0 && navAt < 200, 'nav.js 位置 ' + navAt);
    ok(p + ' 只引用一次 nav.js', (h.match(/src="js\/nav\.js"/g) || []).length === 1);
  });

  // 公式表的图是懒加载的：不给 aspect-ratio 的话，加载完成前高度为 0，
  // 加载后整行被撑高 —— 切页时又是一次跳动
  ['f2l.html', 'oll.html', 'pll.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + ' 给图片预留了高度（aspect-ratio）',
      /td\.pic img\{[^}]*aspect-ratio/.test(h), '没有 aspect-ratio，加载时行高会跳');
  });
}

console.log('\n[14] 导航高亮框：会滑动的 .pill');
{
  // 换页时「当前页」那个蓝框要滑到点击的那一项，而不是原地跳过去。
  // 光看正则看不出对不对，这里用 DOM 桩真跑一遍 nav.js。
  const vm = require('vm');
  const nav = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  const SEL = '.topnav .links a[href]';

  // 桩里的「布局」：元素依次往右排，好让 placePill 算出不同位置
  let seq = 0;
  function el(tag) {
    const e = {
      tagName: tag, children: [], dataset: {}, style: {},
      className: '', textContent: '', href: '', value: '',
      offsetLeft: (seq++) * 48, offsetTop: 0, offsetWidth: 40, offsetHeight: 30,
      classList: {
        _s: new Set(),
        add(c) { this._s.add(c); },
        remove(c) { this._s.delete(c); },
        contains(c) { return this._s.has(c); },
        toggle(c, on) {
          if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); }
          else if (on) { this._s.add(c); } else { this._s.delete(c); }
        }
      },
      appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
      removeChild(c) { const i = this.children.indexOf(c);
                       if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; },
      insertBefore(c) { c.parentNode = this; this.children.unshift(c); return c; },
      // 打印前会把图催成 eager 再 decode()：桩里立刻兑现
      decode() { return Promise.resolve(); },
      setAttribute(k, v) { this[k] = v; },
      getAttribute(k) { return this[k]; },
      removeAttribute(k) { delete this[k]; },
      cloneNode() { return el(this.tagName); },
      addEventListener(t, fn) { (this._e = this._e || {});
                              (this._e[t] = this._e[t] || []).push(fn); },
      querySelectorAll() { return []; }, querySelector() { return null; },
      closest() { return null; },
      // 测试里要能触发这个元素自己身上的监听（nav.js 给导航项挂了 mouseenter 等）
      fire(t, a) { ((this._e || {})[t] || []).forEach(f => f(a || {})); }
    };
    return e;
  }

  function run(page, opts) {
    opts = opts || {};
    seq = 0;
    const body = el('body');
    const store = Object.assign({}, opts.store || {});
    // 首页那个 [data-logo] 占位：真页面上它在 <header> 里，nav.js 在 <body> 开头
    // 就跑了，那时还没解析到它 —— 所以 DOM 解析完之前桩里也返回空，
    // 这样「等 DOMContentLoaded 再填一次」漏写了就会红。
    const logoSlot = el('span');
    const lastSlot = el('a');
    lastSlot.setAttribute('data-last', 'tutorial-basic.html');
    // 首页那张「二阶」卡片也铺了一个 data-last（和教程卡片同一套写法）
    const lastSlot2 = el('a');
    lastSlot2.setAttribute('data-last', 'oll2.html');
    // 还有「三阶」那张（F2L / OLL / PLL 共用一个入口）
    const lastSlot3 = el('a');
    lastSlot3.setAttribute('data-last', 'f2l.html');
    let parsed = false;
    // 打印那套要换图：桩里放一张「夜晚」的图，看它会不会被换成白天版
    const imgs = [];
    const nightImg = el('img');
    nightImg.setAttribute('src', 'img/oll/oll-21-v0-night-256x256.png');
    imgs.push(nightImg);
    // nav.js 会在「夜版图」后面插一个白天版克隆，所以这张图得挂在某个父节点下
    const picBox = el('span');
    picBox.appendChild(nightImg);
    const doc = {
      body, documentElement: el('html'), createElement: el,
      getElementById: () => null,
      querySelectorAll: sel => (!parsed ? []
        : sel === '[data-logo]' ? [logoSlot]
        : sel === '[data-last]' ? [lastSlot, lastSlot2, lastSlot3]
        : sel === 'img' ? imgs : []),
      readyState: 'loading',          // 让 nav.js 走 DOMContentLoaded 那条路
      addEventListener(t, fn) { (this._e = this._e || {});
                              (this._e[t] = this._e[t] || []).push(fn); }
    };
    const pending = [], observers = [];
    const ctx = {
      console, clearTimeout() {},
      // 换主题时 nav.js 会盯着 data-theme（切换期间给 <html> 挂 theme-anim），
      // 桩里记下回调，测试里手动触发
      MutationObserver: function (cb) { this.observe = () => observers.push(cb); },
      // defer=true 时把回调攒起来，好检查「蓝框到位前 / 到位后」两个阶段
      setTimeout(fn) { pending.push(fn); if (!opts.defer) fn(); return 0; },
      // 导航里「教程」入口要读 localStorage 找上次看的那一篇
      localStorage: { getItem: k => (k in store ? store[k] : null),
                      setItem: (k, v) => { store[k] = String(v); },
                      removeItem: k => { delete store[k]; } },
      sessionStorage: { getItem: k => (k in store ? store[k] : null),
                        setItem: (k, v) => { store[k] = String(v); },
                        removeItem: k => { delete store[k]; } },
      window: { _e: {}, pageYOffset: 0,
                addEventListener(t, fn) { (this._e[t] = this._e[t] || []).push(fn); },
                matchMedia: () => ({ matches: !!opts.reduce }) },
      document: doc, location: { pathname: '/' + page, href: '' }, navigator: {}
    };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(nav, ctx);
    const navEl = body.children[0];
    const links = navEl.children[1];            // [0] 是 brand
    return {
      ctx, body, links, store, pill: links.children[0], pending, observers,
      logo: logoSlot, last: lastSlot, last2: lastSlot2, last3: lastSlot3, navEl,
      linkAt: i => links.children[i + 1],       // [0] 是 .pill
      // 导航项会变多，测试里一律按文字找，别写下标
      linkTo: t => links.children.find(c => String(c.textContent).indexOf(t) >= 0),
      active: links.children.find(c => c.className === 'on'),
      domReady: () => { parsed = true; (doc._e.DOMContentLoaded || []).forEach(fn => fn()); },
      click: e => (doc._e.click || []).forEach(fn => fn(e)),
      // 打印那套：window 上挂的 beforeprint/afterprint/keydown，桩里手动触发
      fireWindow: (t, ev) => ((ctx.window._e || {})[t] || []).forEach(fn => fn(ev || {})),
      imgs, nightImg, picBox
    };
  }

  function fire(target, extra) {
    let prevented = false;
    const e = Object.assign({
      button: 0, defaultPrevented: false,
      preventDefault() { prevented = true; },
      target: { closest: sel => (sel === 'a[href]' ? target : null) }
    }, extra || {});
    return { e, got: () => prevented };
  }

  /* 换主题：变量每帧都在变，元素自己那些「悬停变色」的过渡会被每帧重启 ——
     主页卡片的边框就会抖一下。所以切换期间要给 <html> 挂 theme-anim，
     让元素的过渡让路（规则在 theme.css），走完再摘掉。 */
  {
    const r = run('oll.html', { defer: true });
    ok('nav.js 盯着 data-theme 的变化', r.observers.length === 1, String(r.observers.length));
    if (r.observers[0]) r.observers[0]();
    ok('切主题时给 <html> 挂 theme-anim',
      r.ctx.document.documentElement.classList.contains('theme-anim'));
    r.pending.forEach(fn => fn());
    ok('变量过渡走完（260ms）就摘掉，不一直压着元素的过渡',
      !r.ctx.document.documentElement.classList.contains('theme-anim'));
  }

  /* 打印：主题/配色不动，只把 <img> 里「夜晚」那版**临时换成白天版**，打完放回去。
     （试过 content:url() 换图和「插只在打印里显示的克隆」，都稳定不了，已撤。）
     打印键 / Ctrl+P 要先等所有图加载完再 window.print()（lazy 的图不加载就是空框）。 */
  {
    const r = run('oll.html');
    r.domReady();
    r.ctx.document.documentElement.dataset.theme = 'dark';
    r.fireWindow('beforeprint', {});
    ok('打印前把「夜晚」那版图换成白天版（屏幕主题/配色不动）',
      (r.nightImg.getAttribute('src') || '').indexOf('-day-') >= 0 &&
      r.ctx.document.documentElement.dataset.theme === 'dark',
      r.nightImg.getAttribute('src') + ' / theme=' + r.ctx.document.documentElement.dataset.theme);
    r.fireWindow('afterprint', {});
    ok('打印完把原图放回去',
      (r.nightImg.getAttribute('src') || '').indexOf('-night-') >= 0,
      r.nightImg.getAttribute('src'));
    ok('夜晚版 -> 白天版的映射覆盖两套命名（PLL 无色夜去掉 -night；其余 -night- 换成 -day-）',
      /replace\('-nc-night-', '-nc-'\)/.test(nav) && /replace\('-night-', '-day-'\)/.test(nav));
    ok('打印键 / Ctrl+P 先等图加载完再 window.print()',
      /function printWithImages\(\)/.test(nav) &&
      /loadAll\(\)/.test(nav) && /\.decode\(\)/.test(nav) &&
      /setAttribute\('loading', 'eager'\)/.test(nav) &&
      /Ctrl\/Cmd\+P/.test(nav) && /closest\('#printbtn'\)/.test(nav));
    ok('打印不碰 data-theme / 配色（只换图）',
      !/dataset\.theme = 'light'/.test(nav) && !/classList\.add\('printing'\)/.test(nav));
  }

  // 结构：.links 里有个 .pill，排在最前面（垫在链接下面）
  /* 「回到顶部」按钮：长页才有；一个入口管好几页时，每一页都要有 */
  {
    const has = r => r.body.children.some(c => c.className === 'totop');
    ok('教程进阶页也有「回到顶部」（它和初级共用一个导航入口）', has(run('tutorial-advanced.html')));
    ok('教程初级页有', has(run('tutorial-basic.html')));
    ok('三阶那三页（F2L / OLL / PLL）共用一个入口，每页都有「回到顶部」',
      has(run('f2l.html')) && has(run('oll.html')) && has(run('pll.html')));
    ok('计算器这种非长页没有', !has(run('calc.html')));
    const css = fs.readFileSync(path.join(ROOT, 'css', 'nav.css'), 'utf8');
    const totopBox = css.slice(css.indexOf('.totop{'), css.indexOf('}', css.indexOf('.totop{')));
    ok('按钮是带圆角的正方形（不是圆的）',
      /border-radius:11px/.test(totopBox) && !/border-radius:50%/.test(totopBox), totopBox.slice(0, 90));
  }

  /* 一个入口管好几页（教程初级 / 进阶）：导航要跳到「上次看的那一篇」 */
  {
    const a = run('oll.html', { store: { 'cube-last:tutorial-basic.html': 'tutorial-advanced.html' } });
    ok('看过进阶之后，导航里「教程」指向进阶页',
      (a.linkTo('教程').href || '').indexOf('tutorial-advanced.html') >= 0, a.linkTo('教程').href);
    const b = run('oll.html');
    ok('没看过就默认初级页',
      (b.linkTo('教程').href || '').indexOf('tutorial-basic.html') >= 0, b.linkTo('教程').href);
  }

  const r0 = run('oll.html');
  ok('.links 里有 .pill', !!r0.pill && r0.pill.className === 'pill',
    r0.pill && r0.pill.className);
  ok('.pill 是 .links 的第一个子节点（垫在链接下面）', r0.links.children[0] === r0.pill);
  ok('当前页那一项带着 .on', !!r0.active, '没找到 .on');
  ok('开屏就把蓝框摆到当前项上（位置 = 该项的 offset）',
    !!r0.active && r0.pill.style.transform ===
      'translate(' + r0.active.offsetLeft + 'px,' + r0.active.offsetTop + 'px)',
    r0.pill.style.transform + ' vs ' + (r0.active && r0.active.offsetLeft));
  ok('开屏定位时关掉过渡（否则会看到它从左上角滑过来）',
    /pill\.style\.transition = 'none'/.test(nav));
  ok('窗口尺寸变化后重新对位',
    /window\.addEventListener\('resize'[\s\S]{0,80}?placePill/.test(nav));

  // 点别的导航项：蓝框滑过去，滑完再跳
  {
    const r = run('oll.html');
    const before = r.pill.style.transform;
    const c = fire(r.linkTo('计算器'));            // 当前页是 OLL，点「计算器」
    r.click(c.e);
    ok('点别的导航项：蓝框滑过去（transform 变了）',
      c.got() && r.pill.style.transform !== before,
      before + ' -> ' + r.pill.style.transform);
    ok('点别的导航项：滑完才跳页', r.ctx.location.href === 'calc.html',
      r.ctx.location.href);
  }
  // 文字颜色必须和蓝框同步 —— 否则蓝框一走，旧项的白字留在浅底上就看不见了，
  // 看着就像「框先滑过去、字过一会儿才冒出来」
  {
    const r = run('oll.html', { defer: true });
    const from = r.active, to = r.linkTo('练习');
    const c = fire(to);
    r.click(c.e);
    ok('点下去：旧项立刻褪回灰字',
      !from.classList.contains('on'), [...from.classList._s].join(','));
    ok('点下去：新项先不变白字（蓝框还没到，白字在浅底上看不见）',
      !to.classList.contains('on'), [...to.classList._s].join(','));
    r.pending.forEach(fn => fn());
    ok('蓝框到位后：新项才变白字',
      to.classList.contains('on'), [...to.classList._s].join(','));
    ok('蓝框到位后才跳页', r.ctx.location.href === 'practice.html', r.ctx.location.href);
  }
  // 点当前项：不拦（浏览器照常处理）
  {
    // 当前页是 OLL；页面自己会写 cube-last:f2l.html = oll.html（见那几页的脚本），
    // 所以「三阶公式」那一项的 href 就是当前页 —— 桩里手动给上这份存档
    const r = run('oll.html', { store: { 'cube-last:f2l.html': 'oll.html' } });
    const c = fire(r.active);            // active 就是「三阶公式」那一项
    r.click(c.e);
    ok('点当前项（一项管好几页时也算当前项）：不拦、也不动蓝框', !c.got());
  }
  // 下面这些也都不该拦
  [['ctrl+点击（新标签）', { ctrlKey: true }],
   ['shift+点击', { shiftKey: true }],
   ['中键', { button: 1 }]].forEach(([name, extra]) => {
    const r = run('oll.html');
    const c = fire(r.linkAt(0), extra);
    r.click(c.e);
    ok('不拦：' + name, !c.got());
  });
  // 站内链接（首页那六张卡片、公式表的 ↗）都走同一套：
  // 内容淡出 + 蓝框滑到目标页对应的那一项
  {
    const r = run('index.html', { defer: true });
    const card = el('a');
    card.setAttribute('href', 'editor.html');
    const c = fire(card);
    r.click(c.e);
    ok('点首页卡片：拦下来，内容先淡出',
      c.got() && r.body.classList.contains('nav-fade'),
      'preventDefault=' + c.got() + ' 类=' + [...r.body.classList._s].join(','));
    ok('点首页卡片：蓝框滑到对应那一项（编辑器）',
      r.pill.style.transform ===
        'translate(' + r.linkTo('编辑器').offsetLeft + 'px,' + r.linkTo('编辑器').offsetTop + 'px)',
      r.pill.style.transform);
    r.pending.forEach(fn => fn());
    ok('内容淡完才跳页', r.ctx.location.href === 'editor.html', r.ctx.location.href);
  }
  // 公式表的 ↗：calc.html#公式 也走同一套，蓝框还要滑到「计算器」
  {
    const r = run('oll.html', { defer: true });
    const jump = el('a');
    jump.setAttribute('href', 'calc.html#R_U_R');
    const c = fire(jump);
    r.click(c.e);
    ok('点公式的 ↗：拦下来，内容先淡出',
      c.got() && r.body.classList.contains('nav-fade'),
      'preventDefault=' + c.got() + ' 类=' + [...r.body.classList._s].join(','));
    ok('点公式的 ↗：蓝框滑到「计算器」',
      r.pill.style.transform ===
        'translate(' + r.linkTo('计算器').offsetLeft + 'px,' + r.linkTo('计算器').offsetTop + 'px)',
      r.pill.style.transform);
    r.pending.forEach(fn => fn());
    ok('跳页时 # 里的公式没丢', r.ctx.location.href === 'calc.html#R_U_R',
      r.ctx.location.href);
  }
  // 目标页不在导航表里：照样淡出，只是蓝框无处可去
  {
    const r = run('index.html', { defer: true });
    const other = el('a');
    other.setAttribute('href', 'elsewhere.html');
    const before = r.pill.style.transform;
    const c = fire(other);
    r.click(c.e);
    ok('目标不在导航表里：仍然淡出，蓝框不动',
      c.got() && r.body.classList.contains('nav-fade') &&
      r.pill.style.transform === before,
      'preventDefault=' + c.got() + ' 蓝框=' + r.pill.style.transform);
  }
  // 当前页的锚点（比如站在 calc.html 上点 calc.html#...）交给浏览器
  {
    const r = run('calc.html');
    const self = el('a');
    self.setAttribute('href', 'calc.html#R_U');
    const c = fire(self);
    r.click(c.e);
    ok('当前页的锚点链接：不拦', !c.got());
  }
  // 点到不是链接的地方：一点影响都没有
  {
    const r = run('index.html');
    let prevented = false;
    r.click({ button: 0, defaultPrevented: false,
              preventDefault() { prevented = true; },
              target: { closest: () => null } });
    ok('点到非链接区域：不受影响',
      !prevented && !r.body.classList.contains('nav-fade'));
  }
  // 直接打开 / 刷新：没有标记，内容不淡（否则每次开页都白闪一下）
  {
    const r = run('index.html');
    ok('直接打开：内容不淡', !r.body.classList.contains('nav-fade'),
      [...r.body.classList._s].join(','));
  }
  // 带标记打开：先隐着，等 DOM 好了再淡进来
  {
    const r = run('pll.html', { defer: true,
      store: { 'cube-nav-fade': JSON.stringify({ t: Date.now() }) } });
    ok('带标记打开：先挂上 .nav-fade（首次绘制前就把内容隐掉，才不闪）',
      r.body.classList.contains('nav-fade'), [...r.body.classList._s].join(','));
    r.domReady();
    ok('DOM 好了：摘掉 .nav-fade，内容淡进来',
      !r.body.classList.contains('nav-fade'), [...r.body.classList._s].join(','));
    ok('标记用完即删（刷新不再淡）',
      !('cube-nav-fade' in r.store), JSON.stringify(r.store));
  }
  // 过期标记不认（导航被中途取消时不残留）
  {
    const r = run('pll.html',
      { store: { 'cube-nav-fade': JSON.stringify({ t: Date.now() - 9000 }) } });
    ok('过期标记（>3 秒）不淡入', !r.body.classList.contains('nav-fade'),
      [...r.body.classList._s].join(','));
  }
  // 系统设了「减少动态效果」：既不滑也不淡，直接跳
  {
    const r = run('oll.html', { reduce: true });
    const c = fire(r.linkTo('练习'));
    r.click(c.e);
    ok('「减少动态效果」：不拦、不滑、不淡',
      !c.got() && !r.body.classList.contains('nav-fade'),
      'preventDefault=' + c.got() + ' 类=' + [...r.body.classList._s].join(','));
  }
  // 样式得配齐，否则类/内联样式都白设
  {
    const css = fs.readFileSync(path.join(ROOT, 'css', 'nav.css'), 'utf8');
    ok('.links 是定位参照（position:relative）',
      /\.topnav \.links\{[^}]*position:relative/.test(css));
    ok('.pill 绝对定位 + 有 transform 过渡',
      /\.topnav \.pill\{[^}]*position:absolute[^}]*transition:transform/.test(css));
    ok('链接压在方块上面（z-index:1）',
      /\.topnav a\{[^}]*z-index:1/.test(css));
    ok('当前项底色改由 .pill 提供（链接自身不再画背景，字色跟着 --on-accent）',
      /\.topnav a\.on\{color:var\(--on-accent, #fff\)\}/.test(css) &&
      !/\.topnav a\.on\{background/.test(css));
    ok('悬停不再加背景（否则会盖在蓝框上、看着发灰）',
      /\.topnav a:hover\{color:var\(--text, #222\)\}/.test(css) &&
      !/\.topnav a:hover\{[^}]*background/.test(css));
    ok('尊重 prefers-reduced-motion', /prefers-reduced-motion/.test(css));
    ok('链接变色的时长和 .pill 滑动一致（看着才像同一件事）',
      /\.topnav a\{[^}]*transition:background \.12s, color \.18s/.test(css) &&
      /\.topnav \.pill\{[^}]*transition:transform \.18s/.test(css));
    ok('nav.css 有内容淡出/淡入，且导航条不参与',
      /body > \*:not\(\.topnav\)\{transition:opacity/.test(css) &&
      /body\.nav-fade > \*:not\(\.topnav\)\{opacity:0\}/.test(css) &&
      !/body\.nav-fade\{[^}]*opacity/.test(css));
    ok('减少动态效果时内容也不淡（别把内容真藏起来）',
      /prefers-reduced-motion: reduce\)\{[\s\S]{0,240}?body\.nav-fade > \*:not\(\.topnav\)\{opacity:1\}/.test(css));
  }
}

console.log('\n[14b] 悬停导航项展开「二级目录」（教程 / 二阶公式）');
{
  const css = fs.readFileSync(path.join(ROOT, 'css', 'nav.css'), 'utf8');
  ok('nav.css 有二级目录的样式（平时收着、.on 展开；收起用 visibility，键盘也走不到）',
    /\.topnav \.sub\{position:absolute/.test(css) && /\.topnav \.sub\.on\{/.test(css) &&
    /visibility:hidden/.test(css) && /\.topnav \.sub a\.on\{/.test(css));
  // 首页那条 GitHub 纸带（.ghribbon，z-index:30）就挂在导航条下面、屏幕右端，
  // 正好和「二阶 / 三阶公式」那一项展开的目录重叠。
  // 导航条自己是个层叠上下文（position:relative + z-index），目录在里面 ——
  // 所以要比的是**导航条**那一层的 z-index，单独给目录调多大都没用。
  {
    const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const ribbon = +(idx.match(/\.ghribbon\{[^}]*z-index:(\d+)/) || [])[1];
    const navZ = +(css.match(/\.topnav\{[^}]*z-index:(\d+)/) || [])[1];
    const sub = +(css.match(/\.topnav \.sub\{[^}]*z-index:(\d+)/) || [])[1];
    ok('整条导航压在首页 GitHub 纸带上面（导航 ' + navZ + ' > 纸带 ' + ribbon + '），目录才盖得住它',
      !!ribbon && !!navZ && navZ > ribbon, 'ribbon=' + ribbon + ' nav=' + navZ);
    ok('目录自己的 z-index 只要高过导航里那几个兄弟（.pill 是 20）',
      !!sub && sub > 20, 'sub=' + sub);
  }

  const r = run('tutorial-advanced.html');
  r.domReady();
  const grp = r.linkTo('教程');
  const sub = grp._sub;
  ok('「教程」那一项挂上了二级目录（aria-haspopup / aria-expanded 都在）',
    !!sub && grp.getAttribute('aria-haspopup') === 'true' &&
    grp.getAttribute('aria-expanded') === 'false');
  ok('目录里两条：初级 / 进阶，当前这页（进阶）高亮，href 各自指过去',
    sub.children.length === 2 &&
    sub.children[0].textContent === '初级 · 层先法' &&
    sub.children[0].getAttribute('href') === 'tutorial-basic.html' &&
    sub.children[1].textContent === '进阶 · CFOP' &&
    sub.children[1].getAttribute('href') === 'tutorial-advanced.html' &&
    sub.children[1].className === 'on' && !sub.children[0].className,
    sub.children.map(c => c.textContent + '->' + c.getAttribute('href')).join(' | '));
  ok('平时是收着的', !sub.classList.contains('on'));
  grp.fire('mouseenter');
  ok('鼠标移上去：展开，并对齐到这一项下面（left / minWidth 按这一项算）',
    sub.classList.contains('on') && grp.getAttribute('aria-expanded') === 'true' &&
    sub.style.left === grp.offsetLeft + 'px' && sub.style.minWidth === grp.offsetWidth + 'px',
    sub.style.left + ' / ' + sub.style.minWidth);
  sub.fire('mouseenter');                    // 鼠标挪到目录上：不能收
  ok('鼠标挪到目录上也还开着', sub.classList.contains('on'));
  sub.fire('mouseleave');
  ok('移开：收起来，aria-expanded 落回 false',
    !sub.classList.contains('on') && grp.getAttribute('aria-expanded') === 'false');

  // 二阶公式那一条：OLL / PBL
  const r2 = run('pbl2.html');
  r2.domReady();
  const g2 = r2.linkTo('二阶公式');
  const s2 = g2._sub;
  ok('「二阶公式」也能展开，两条是 OLL / PBL，当前这页（PBL）高亮',
    !!s2 && s2.children.length === 2 &&
    s2.children[0].getAttribute('href') === 'oll2.html' &&
    s2.children[1].getAttribute('href') === 'pbl2.html' &&
    s2.children[1].className === 'on' && !s2.children[0].className,
    s2 ? s2.children.map(c => c.textContent + '->' + c.getAttribute('href')).join(' | ') : '没有目录');
  ok('只有「一项管好几页」的入口才有二级目录（其它项没有）',
    !r.linkTo('首页')._sub && !r.linkTo('编辑器')._sub && !r.linkTo('计算器')._sub &&
    !r.linkTo('练习')._sub && !r.linkTo('计时器')._sub);
  // 单手公式也成了两页一组（OH-OLL / OH-PLL）：二级目录得有两条，当前页高亮
  const g3 = run('oh-oll.html');
  g3.domReady();
  const s3 = g3.linkTo('单手公式')._sub;
  ok('「单手公式」也有二级目录：OH-OLL / OH-PLL，当前这页高亮',
    !!s3 && s3.children.length === 2 &&
    s3.children[0].getAttribute('href') === 'oh-oll.html' &&
    s3.children[1].getAttribute('href') === 'oh-pll.html' &&
    s3.children[0].className === 'on' && !s3.children[1].className,
    s3 ? s3.children.map(c => c.textContent + '->' + c.getAttribute('href')).join(' | ') : '没有目录');
  ok('二级目录里的链接也认得出是哪个入口（点了蓝框会滑到那一项）',
    !!s2.children[0]._pages && s2.children[0]._pages.indexOf('oll2.html') >= 0 &&
    s2.children[0]._pages.indexOf('pbl2.html') >= 0);
}

console.log('\n[15] 各页的明暗底色约定必须一致');
{
  // 颜色变量现在都在 theme.css 里（七页共用一份），所以这里读的是它。
  // 这一节仍然对每个页面真跑一遍 <head> 里的预设脚本，算出实际生效的 --bg，
  // 再核对三档存档 —— 脚本、属性、变量三者得对上，缺一处就会「切页面变配色」。
  const vm = require('vm');
  const themeCss = fs.readFileSync(path.join(ROOT, 'css', 'theme.css'), 'utf8');

  const headThemeScript = h => {
    const head = h.slice(0, h.indexOf('</head>'));
    return [...head.matchAll(/<script>([\s\S]*?)<\/script>/g)]
      .map(m => m[1]).filter(b => b.includes('cube-theme')).join('\n');
  };
  // 注意 (?:^|\n)：theme.css 的打印块里也有「:root,html[data-theme="dark"]{」，
  // 不锚行首就会读到打印那套白底
  const bgOf = key => {
    const re = key === ':root'
      ? /(?:^|\n):root\{[^}]*?--bg:\s*(#[0-9a-fA-F]{6})/
      : new RegExp('(?:^|\\n)html\\[data-theme="' + key + '"\\]\\{[^}]*?--bg:\\s*(#[0-9a-fA-F]{6})');
    const m = themeCss.match(re);
    return m ? m[1] : null;
  };
  const isDark = hex => {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16 & 255) + (n >> 8 & 255) + (n & 255)) / 3 < 128;
  };
  function effective(h, stored) {
    const el = { dataset: {} };
    const ctx = { document: { documentElement: el },
                  localStorage: { getItem: k => (k === 'cube-theme' ? stored : null) } };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(headThemeScript(h), ctx);
    const t = el.dataset.theme;
    // data-theme 没设时，生效的是 :root 的基础值
    const bg = (t ? bgOf(t) : null) || bgOf(':root');
    return { theme: t || '(未设)', bg: bg, dark: isDark(bg) };
  }

  PAGES.forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    [['没存档（站点的默认）', null, false],
     ['存档为 light', 'light', false],
     ['存档为 dark', 'dark', true]].forEach(([name, store, wantDark]) => {
      const e = effective(h, store);
      ok(p + ' ' + name + '时是' + (wantDark ? '夜晚' : '白天'),
        e.dark === wantDark, '实际 --bg=' + e.bg + ' theme=' + e.theme);
    });
  });

  // 预设脚本只管「首次绘制前」；主脚本里的 theme 变量也得读同一个存档，
  // 否则会先按存档画好、再被主脚本覆盖回去（editor.html 原来就只认深色）
  {
    const h = fs.readFileSync(path.join(ROOT, 'editor.html'), 'utf8');
    ok('editor.html 主脚本的 theme 也读 cube-theme',
      /var theme = 'light';[\s\S]{0,200}?localStorage\.getItem\('cube-theme'\)/.test(h));
    ok('editor.html 切换主题会写回 cube-theme（和别的页共用同一个键）',
      /function applyTheme[\s\S]{0,260}?localStorage\.setItem\('cube-theme', theme\)/.test(h));
  }
}

console.log('\n[16] 调色板：两套主题都在 theme.css 里，层次和对比度都得站得住');
{
  // 换配色只需要改 theme.css 一个文件，所以这里读的也是它。
  // 盯的是「关系」而不是具体色号 —— 卡面要比页面亮、正文压卡面要够清楚、
  // --on-accent 压在 accent 实心底上要够清楚……色号本身随便换。
  const css = fs.readFileSync(path.join(ROOT, 'css', 'theme.css'), 'utf8');
  function lum(hex) {
    const ch = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  function contrast(a, b) {
    const s = [lum(a), lum(b)].sort((m, n) => n - m);
    return (s[0] + 0.05) / (s[1] + 0.05);
  }
  const vars = re => {
    const m = css.match(re);
    if (!m) return null;
    const out = {};
    [...m[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6,8})/g)]
      .forEach(x => { out[x[1]] = x[2].toLowerCase(); });
    return out;
  };
  const light = vars(/(?:^|\n):root\{([\s\S]*?)\n\}/);
  const dark = vars(/(?:^|\n)html\[data-theme="dark"\]\{([\s\S]*?)\n\}/);
  ok('theme.css 里有白天和夜晚两套变量', !!light && !!dark);

  if (light && dark) {
    // 两套必须给出同一批变量名 —— 少一个，那一套主题下就会掉回浏览器默认值
    ok('两套主题定义的变量名完全一致',
      Object.keys(light).sort().join() === Object.keys(dark).sort().join(),
      '只在一套里有的：' + Object.keys(light).filter(k => !dark[k])
        .concat(Object.keys(dark).filter(k => !light[k])).sort().join(' '));
    ok('--accent-text 默认跟着 --accent（只有当「当底」和「当文字」要分两档时才覆盖）',
      /--accent-text\s*:\s*var\(--accent\)/.test(css));

    [['白天', light, ['#eef1ff', '#d2daff', '#aac4ff', '#b1b2ff'], '#d2daff', '#3a3f73'],
     ['夜晚', dark, ['#222831', '#393e46', '#ffd369', '#eeeeee'], '#222831', '#eeeeee']
    ].forEach(([name, v, PALETTE, wantBg, wantText]) => {
      const surface = v['--card'] || v['--panel'];
      const at = v['--accent-text'] || v['--accent'];   // accent 当文字用的那一档
      const missing = PALETTE.filter(c => !Object.values(v).includes(c));
      ok(name + '：指定的四色都用上了', missing.length === 0, '缺 ' + missing.join(' '));
      ok(name + '：页面底是 ' + wantBg, v['--bg'] === wantBg, v['--bg']);
      ok(name + '：卡面比页面亮一档（卡片才分得出来）',
        lum(surface) > lum(v['--bg']), 'bg=' + v['--bg'] + ' 卡面=' + surface);
      // 计算器 / 练习 / 编辑器里，占满屏的是舞台不是 --bg
      ok(name + '：舞台不比卡面亮',
        !v['--stage'] || lum(v['--stage']) <= lum(surface),
        '舞台=' + v['--stage'] + ' 卡面=' + surface);
      ok(name + '：正文是 ' + wantText, v['--text'] === wantText, v['--text']);
      ok(name + '：正文压卡面够清楚（' + contrast(v['--text'], surface).toFixed(1) + ':1）',
        contrast(v['--text'], surface) >= 7, '正文=' + v['--text'] + ' on ' + surface);
      // 次要文字（表头、说明、图上的编号）—— 最容易糊的就是这一档
      ok(name + '：次要文字压卡面够清楚（' + contrast(v['--muted'], surface).toFixed(1) + ':1）',
        contrast(v['--muted'], surface) >= 4.5, 'muted=' + v['--muted'] + ' on ' + surface);
      // accent 当底、上面压 --on-accent 的字（药丸、标签、选中的按钮…）
      ok(name + '：--on-accent 压 accent 实心底够清楚（' +
        contrast(v['--on-accent'], v['--accent']).toFixed(1) + ':1）',
        contrast(v['--on-accent'], v['--accent']) >= 4.5,
        'on-accent=' + v['--on-accent'] + ' on ' + v['--accent']);
      ok(name + '：accent 当文字压卡面够清楚（' + contrast(at, surface).toFixed(1) + ':1）',
        contrast(at, surface) >= 4.5, 'accent=' + at + ' on ' + surface);
      ok(name + '：accent 当文字压页面底不算糊（' + contrast(at, v['--bg']).toFixed(1) + ':1）',
        contrast(at, v['--bg']) >= 3, 'accent=' + at + ' on ' + v['--bg']);
      ok(name + '：描边色和卡面不是一个色（不然表格没有边）',
        v['--line'] !== surface && v['--line-strong'] !== surface);
      // 主按钮（计算器的播放键）：实心底 + 上面的图标 + 更重的投影，
      // 三样都得从卡面上「跳出来」，不然当不成主按钮
      ok(name + '：主按钮的图标压得住它的底色（' +
        contrast(v['--primary-fg'], v['--primary2']).toFixed(1) + ':1）',
        contrast(v['--primary-fg'], v['--primary2']) >= 3,
        'primary-fg=' + v['--primary-fg'] + ' on primary2=' + v['--primary2']);
      ok(name + '：主按钮比卡面重（' + contrast(v['--primary2'], surface).toFixed(1) + ':1）',
        contrast(v['--primary2'], surface) >= 3 && lum(v['--primary2']) !== lum(surface),
        'primary2=' + v['--primary2'] + ' on ' + surface);
      ok(name + '：主按钮上下两端有色差（才看得出是「有厚度」的实心块）',
        lum(v['--primary']) !== lum(v['--primary2']),
        'primary=' + v['--primary'] + ' primary2=' + v['--primary2']);
    });
  }
}

console.log('\n[16b] 换配色只改 theme.css 一处');
{
  // 「以后想调颜色更方便」就靠这一节守着：颜色变量只许在 theme.css 里定义。
  // 谁在自己页面里又写一套 --bg，改一处就会漏掉一页。
  PAGES.forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + ' 链了 theme.css', /<link rel="stylesheet" href="css\/theme\.css">/.test(h));
    const first = Math.min(...['theme.css', 'nav.css', '<style>']
      .map(x => h.indexOf(x)).filter(i => i >= 0));
    ok(p + ' 的 theme.css 排在 nav.css 和页面 <style> 之前（页面要能盖住它）',
      h.indexOf('theme.css') === first,
      'theme.css@' + h.indexOf('theme.css') + ' 最早@' + first);
    const style = h.slice(h.indexOf('<style>'), h.indexOf('</style>'));
    const own = [...style.matchAll(/(--[\w-]+)\s*:\s*[^;{}]*#[0-9a-fA-F]{3,8}/g)].map(m => m[1]);
    ok(p + ' 页面里没有自己定义颜色变量', own.length === 0, own.join(' '));
  });
  // 打印也是一套配色，同样归 theme.css —— 速查表打印出来要白底黑字，
  // 而且得压得住夜晚那套（:root 压不过 html[data-theme="dark"]，所以两个选择器都列上）
  const css = fs.readFileSync(path.join(ROOT, 'css', 'theme.css'), 'utf8');
  ok('theme.css 里带打印用的白底黑字，且能压过夜晚那套',
    /@media print\{[\s\S]*?:root,html\[data-theme="dark"\]\{[\s\S]*?--bg:#fff/.test(css));
  // 三个「面板」页（计算器 / 练习 / 编辑器）共用同一套版式语言：
  // 小标题都是正文色 + 加粗 + 底下一道细线。谁偷偷改回灰的，并排一看就不一样了。
  ['calc.html', 'practice.html', 'editor.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + ' 的小标题和别的面板页同一档（正文色 + 加粗 + 细线）',
      /\.sec > h2\{[^}]*color:var\(--text\);font-weight:700;[^}]*border-bottom:1px solid var\(--line\)/.test(h));
  });
  ['f2l.html', 'oll.html', 'pll.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const pr = h.slice(h.indexOf('@media print'));
    ok(p + ' 的打印块只管版式，不再自己写颜色', !/--[\w-]+\s*:\s*#/.test(pr));
  });
}

console.log('\n[16c] 白天/夜晚切换：颜色能插值，整页淡过去');
{
  const css = fs.readFileSync(path.join(ROOT, 'css', 'theme.css'), 'utf8');
  const root = css.match(/(?:^|\n):root\{([\s\S]*?)\n\}/)[1];
  const names = [...root.matchAll(/(--[\w-]+)\s*:\s*[^;]+;/g)].map(m => m[1]);
  ok('theme.css 里的颜色变量数得出来（' + names.length + ' 个）', names.length > 30, names.length);

  // 自定义属性默认是「字符串替换」，不能插值 —— 必须注册成颜色型，切换才能淡过去
  const reg = {};
  [...css.matchAll(/@property\s+(--[\w-]+)\s*\{\s*syntax:\s*'<color>'\s*;\s*inherits:\s*true\s*;\s*initial-value:\s*([^;]+);/g)]
    .forEach(m => { reg[m[1]] = m[2].trim(); });
  const missing = names.filter(n => !reg[n]);
  ok('每个颜色变量都注册成 @property <color>', missing.length === 0, missing.join(' '));
  const withVar = Object.keys(reg).filter(n => /var\(/.test(reg[n]));
  ok('initial-value 都是实打实的颜色（@property 里不解析 var()）',
    withVar.length === 0, withVar.join(' '));

  // 过渡挂在 :root 上，并且尊重系统的「减少动态效果」
  const rm = css.match(/@media \(prefers-reduced-motion: no-preference\)\{\s*:root\{([\s\S]*?)\n  \}/);
  ok('过渡挂在 :root 上，并受 prefers-reduced-motion 保护', !!rm);
  const inTrans = rm ? rm[1] : '';
  // 1px 的细线故意不参与过渡（逐帧重绘 + 分数像素比 = 边框闪）——
  // 这份名单是故意的，写死在这里；其它颜色一个都不许漏
  const NO_ANIM = ['--line', '--line-strong', '--kbd-line', '--toast-line'];
  const noTrans = names.filter(n => inTrans.indexOf(n + ' ') < 0);
  ok('除了 1px 细线那 ' + NO_ANIM.length + ' 个，其它颜色都在过渡列表里（' +
     (names.length - NO_ANIM.length) + ' 项）',
    noTrans.length === NO_ANIM.length && noTrans.every(n => NO_ANIM.includes(n)),
    noTrans.join(' '));
  ok('细线那 ' + NO_ANIM.length + ' 个确实没进过渡列表（边框不会再逐帧重绘）',
    NO_ANIM.every(n => inTrans.indexOf(n + ' ') < 0) &&
    /画成 1px 线的那几个颜色故意不参与过渡/.test(css));
  ok('时长是 240ms 这一档（再长就像「页面在变色」了）',
    /--bg 240ms ease/.test(inTrans) && !/--bg \d{4,}ms/.test(inTrans));

  // 元素自己的过渡（比如主页卡片 .card{transition:border-color .14s}）会和变量过渡打架：
  // 变量每帧都在变 → 元素那条约每帧重启一次 → 边框看着抖一下。
  // 所以切换期间要有一条把它们全关掉的规则，但要放行主题开关里的滑块。
  ok('切换期间关掉元素自己的过渡（放行主题开关滑块 .tk）',
    /html\.theme-anim \*:not\(\.tk\)[^{]*\{\s*transition:\s*none !important/.test(css) &&
    /html\.theme-anim \*:not\(\.tk\)::before/.test(css) &&
    /html\.theme-anim \*:not\(\.tk\)::after/.test(css));
  const navJs = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  ok('nav.js 用 MutationObserver 盯 data-theme，挂/摘 theme-anim',
    /new MutationObserver\(/.test(navJs) &&
    /attributeFilter:\s*\['data-theme'\]/.test(navJs) &&
    /classList\.add\('theme-anim'\)/.test(navJs) &&
    /classList\.remove\('theme-anim'\)/.test(navJs));
  ok('摘掉的时机比变量过渡（240ms）稍晚一点',
    /\}, 260\)/.test(navJs));

  // 首屏不能补一段动画：head 里的脚本要在首次样式计算前把 data-theme 定好
  // （首次样式计算不触发 transition，所以只要定得够早，打开页面就是「已到位」的样子）
  PAGES.forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const head = h.slice(0, h.indexOf('</head>'));
    ok(p + ' 在 head 里就定好主题（首屏不会补一段变色动画）',
      /dataset\.theme\s*=/.test(head) && /localStorage\.getItem\('cube-theme'\)/.test(head));
  });
}

console.log('\n[17] 白天 / 夜晚开关（滑动式，七页共用一份标记和样式）');
{
  const nav = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'css', 'nav.css'), 'utf8');

  ok('nav.js 给 #themebtn 注入标记（滑块 + 两端图标）',
    /getElementById\('themebtn'\)/.test(nav) &&
    /'<span class="tk"><\/span>'/.test(nav) &&
    /class="ti sun"/.test(nav) && /class="ti moon"/.test(nav));
  ok('图标是内联 SVG（字符图标在不同系统上会变成 emoji）',
    /sun: '<svg/.test(nav) && /moon: '<svg/.test(nav) &&
    !/[\u2600\u263e]/.test(nav));
  ok('等 DOM 好了再注入（#themebtn 在 nav.js 后面才解析到）',
    /ready\(buildThemeSwitch\)/.test(nav) &&
    /function ready\(fn\)\s*\{[\s\S]*?DOMContentLoaded/.test(nav));
  ok('开关带 role=switch，并同步 aria-checked',
    /setAttribute\('role', 'switch'\)/.test(nav) && /aria-checked/.test(nav));

  ok('nav.css 画轨道（药丸）',
    /body \.themebtn\{[^}]*width:56px[^}]*border-radius:14px/.test(css));
  ok('nav.css 画滑块，并按 data-theme 滑到两端',
    /\.themebtn \.tk\{[^}]*border-radius:50%/.test(css) &&
    /html\[data-theme="dark"\] body \.themebtn \.tk\{[^}]*transform:translateX\(28px\)/.test(css));
  ok('两端图标压在滑块上面（两边都看得见）',
    /\.themebtn \.ti\{[^}]*position:absolute/.test(css) &&
    /\.themebtn \.sun\{left:2px/.test(css) && /\.themebtn \.moon\{right:2px\}/.test(css));
  ok('当前那一边的图标亮、另一边留灰',
    /html\[data-theme="dark"\] body \.themebtn \.sun\{color:var\(--muted/.test(css) &&
    /html\[data-theme="dark"\] body \.themebtn \.moon\{color:var\(--on-accent/.test(css));
  // 夜晚的滑块是 accent 色，上面的月亮得用 --on-accent ——
  // 否则「亮底压亮字」，月亮会看不见（换主题色时最容易踩的一脚）
  ok('夜晚滑块用 accent，月亮图标用 --on-accent（一对）',
    /html\[data-theme="dark"\] body \.themebtn \.tk\{[^}]*background:var\(--accent/.test(css));

  // 各页只保留定位，尺寸/底色这些都交给 nav.css —— 免得七份各写一套互相打架
  PAGES.forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const m = h.match(/\.themebtn\{([^}]*)\}/);
    ok(p + ' 的 .themebtn 只保留定位',
      !!m && !/width|height|background|border|border-radius/.test(m[1]),
      m && m[1].trim());
    ok(p + ' 的按钮里没有写死的图标字符',
      !/<button class="themebtn"[^>]*>[^<]*[\u2600\u263e]/.test(h));
  });
}

console.log('\n[18] 站名与站标');
{
  // 站名散在三个地方：首页 <title>/<h1>，以及 nav.js 里的 SITE（站标的 aria-label）。
  // 改名时很容易只改一处，所以在这里对一下。
  const SITE = '六面魔方工具箱';
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const nav = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  const site = (nav.match(/var SITE = '([^']+)'/) || [])[1];
  // 首页大标题 = 站标（矢量，aria-label「六面」）+ 副标题「魔方工具箱」，合起来才是站名。
  // 副标题两侧的破折号是 CSS 画的，不在 HTML 里。
  const h1 = (idx.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '';
  const markLabel = (h1.match(/aria-label="([^"]+)"/) || [])[1];
  const sub = ((h1.match(/<span class="sub">([^<]*)<\/span>/) || [])[1] || '').trim();
  ok('首页大标题 = 站标「' + markLabel + '」+ 副标题「' + sub + '」，合起来是站名',
    !!markLabel && markLabel + sub === SITE, markLabel + ' + ' + sub);
  ok('导航条里的站名和首页一致（都是「' + site + '」）', site === SITE, site);
  ok('首页 <title> 也是站名',
    new RegExp('<title>' + SITE + '</title>').test(idx), SITE);
  // 站标那两个字还是分开上色（六主色 / 面正文色），首页和导航条同一套
  ok('首页站标的两字分色在（.g-a 主色 / .g-b 正文色）',
    /h1 \.mark \.g-a\{fill:var\(--accent-text\)\}/.test(idx) &&
    /h1 \.mark \.g-b\{fill:var\(--text\)\}/.test(idx));
  ok('副标题两侧的破折号是 CSS 画的，没写进 HTML（免得读屏把「—」读成站名）',
    /<span class="sub">魔方工具箱<\/span>/.test(h1) &&
    /h1 \.sub::before,h1 \.sub::after\{content:'—'/.test(idx));
  ok('首页那个站标由 nav.js 统一填（页面里只写 data-logo，不存第二份路径）',
    /<span class="mark" data-logo/.test(h1) &&
    /querySelectorAll\('\[data-logo\]'\)/.test(nav));

  // 导航条里只放图形：brand 是个 <a>，挂 aria-label，里面内联 SVG
  ok('导航条站标是链接到首页的图形（只图形、无文字）',
    /var brand = document\.createElement\('a'\)/.test(nav) &&
    /brand\.href = 'index\.html'/.test(nav) &&
    /brand\.setAttribute\('aria-label', SITE\)/.test(nav) &&
    /brand\.innerHTML = logoHTML/.test(nav) &&
    /var logoHTML = '<svg viewBox="0 0 1209 502"/.test(nav) &&
    !/brand\.textContent/.test(nav));
  // 两条 d 必须和 logo.svg 一模一样：改了图没同步内联的那份，这里会红
  const svg = fs.readFileSync(path.join(ROOT, 'logo.svg'), 'utf8');
  const dOf = (s, cls) => (s.match(new RegExp('class="' + cls + '"[^>]*\\sd="([^"]+)"')) || [])[1];
  const navD = cls => (nav.match(new RegExp("var LOGO_" + cls + " = '([^']+)'")) || [])[1];
  ['A', 'B'].forEach((cls, i) => {
    const want = dOf(svg, i ? 'g-b' : 'g-a');
    ok('导航条内联的 LOGO_' + cls + ' 与 logo.svg 一致（' + (want || '').slice(0, 12) + '…）',
      !!want && navD(cls) === want, String(navD(cls)).slice(0, 24));
  });
  const css = fs.readFileSync(path.join(ROOT, 'css', 'nav.css'), 'utf8');
  ok('nav.css 给站标定了高度与两色（走主题变量）',
    /\.topnav a\.brand svg\{[^}]*height:22px/.test(css) &&
    /\.topnav a\.brand \.g-a\{fill:var\(--accent-text/.test(css) &&
    /\.topnav a\.brand \.g-b\{fill:var\(--text/.test(css));
  ok('窄屏把站标收起来（选择器要盖得住那条 a.brand）',
    /\.topnav a\.brand\{display:none\}/.test(css));

  // 其他页面的标签页都带站名前缀（首页本身就是站名，不加）
  PAGES.filter(p => p !== 'index.html').forEach(p => {
    const t = (fs.readFileSync(path.join(ROOT, p), 'utf8')
      .match(/<title>([^<]*)<\/title>/) || [])[1];
    ok(p + ' 的标签页带站名前缀（' + t + '）', !!t && t.indexOf('六面 · ') === 0, t);
  });
}

console.log('\n[18b] 首页站标是 nav.js 在 DOM 解析完之后补上的');
{
  // 踩过的坑：nav.js 挂在 <body> 开头，跑的时候 <header> 还没解析到，
  // querySelectorAll('[data-logo]') 是空的 —— 结果首页只剩下面那行
  // 「— 魔方工具箱 —」，上面那个标没了。桩里 DOM 解析完之前也返回空，
  // 所以「等 DOMContentLoaded 再填一次」漏掉了这里就会红。
  const r = run('index.html');
  r.domReady();
  const html = String(r.logo.innerHTML || '');
  ok('解析完之后占位里填上了站标（svg + 两块 path）',
    html.indexOf('<svg viewBox="0 0 1209 502"') === 0 &&
    html.indexOf('class="g-a"') > 0 && html.indexOf('class="g-b"') > 0,
    html.slice(0, 40));
  ok('填进去的和导航条里那份是同一个字符串（不存在第二份路径）',
    html === String(r.navEl.children[0].innerHTML), '两处不一致');
}

console.log('\n[18c] 首页那张教程卡片：整张可点，效果和点导航条一样');
{
  // 卡片里铺了一个透明链接 <a class="stretch" data-last="tutorial-basic.html">，
  // href 由 nav.js 按「上次看的那一篇」定 —— 和导航条上那个入口同一条规则
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const card = (idx.match(/<div class="card">[\s\S]*?<\/div>/) || [''])[0];
  ok('教程卡片里铺了一个盖满卡片的链接（data-last 指向教程入口）',
    /<a class="stretch" href="tutorial-basic\.html" data-last="tutorial-basic\.html"/.test(card),
    card.slice(0, 60));
  ok('卡片是定位父级、铺满的那个链接 absolute inset:0',
    /\.card\{[^}]*position:relative/.test(idx) &&
    /\.card \.stretch\{position:absolute;inset:0/.test(idx));
  ok('标题里的「初级 / 进阶」压在铺满的链接上面（否则点不到）',
    /\.card h2 a\{position:relative;z-index:1/.test(idx));

  {
    const r = run('index.html',
      { store: { 'cube-last:tutorial-basic.html': 'tutorial-advanced.html' } });
    r.domReady();
    ok('上次看的是进阶 -> 卡片链接就指到进阶',
      r.last.getAttribute('href') === 'tutorial-advanced.html',
      String(r.last.getAttribute('href')));
  }
  {
    const r = run('index.html');
    r.domReady();
    ok('没看过 -> 默认初级', r.last.getAttribute('href') === 'tutorial-basic.html',
      String(r.last.getAttribute('href')));
  }
  // 点卡片 = 点导航条那个入口：蓝框滑到「教程」、内容淡出、淡完再跳
  {
    const r = run('index.html', { defer: true, store: { 'cube-last:tutorial-basic.html': 'tutorial-advanced.html' } });
    r.domReady();
    const a = el('a');
    a.setAttribute('href', 'tutorial-advanced.html');      // nav.js 已经改写过的那条
    const c = fire(a);
    r.click(c.e);
    const tut = r.linkTo('教程');
    ok('点卡片：拦下来，内容先淡出（和点导航条一样）',
      c.got() && r.body.classList.contains('nav-fade'));
    ok('点卡片：蓝框滑到「教程」那一项（即使 href 是进阶，也认得出是同一个入口）',
      r.pill.style.transform ===
        'translate(' + tut.offsetLeft + 'px,' + tut.offsetTop + 'px)',
      r.pill.style.transform);
    r.pending.forEach(fn => fn());
    ok('点卡片：淡完才跳页', r.ctx.location.href === 'tutorial-advanced.html',
      r.ctx.location.href);
  }
}


console.log('\n[19] 公式页的打印按钮');
{
  // 这三页本来就是打印用的；按钮只是省得用户去找浏览器的打印菜单。
  ['f2l.html', 'oll.html', 'pll.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + ' 头部有打印按钮（内联 SVG 打印机图标，不是字符）',
      /<button class="printbtn" id="printbtn"[\s\S]{0,400}?<svg[\s\S]{0,700}?<\/svg><\/button>/.test(h) &&
      !/[\u2399\u2b1a]/.test(h));
    ok(p + ' 点了调 window.print()',
      /getElementById\('printbtn'\)\.addEventListener\('click', function \(\) \{ window\.print\(\); \}\)/.test(h));
    // 打印出来当然不能再印这个按钮（主题开关也一样）
    ok(p + ' 打印时不印按钮（主题开关、页面目录一起藏）',
      /@media print\{[\s\S]*?\.themebtn,\.printbtn(,\.opts)?,nav\.side(?:,\.toolbtn)?\{display:none\}/.test(h));
    // 摆在主题开关左边，别叠上去
    ok(p + ' 和主题开关并排、互不重叠',
      /\.themebtn\{position:absolute;right:16px;top:16px\}/.test(h) &&
      /\.printbtn\{position:absolute;right:80px;top:16px/.test(h));
    // 打印那套配色由 theme.css 统一给白底黑字，页面里不应该再写回颜色
    ok(p + ' 打印样式没把配色写死回页面', !/--[\w-]+\s*:\s*#/.test(h.slice(h.indexOf('@media print'))));
  });
console.log('\n[19b] 打印分页：表格接着排，标题不当孤儿');
{
  // 原来是 section{break-inside:avoid} + overflow:hidden：整张表成了不可拆分的一块，
  // 这一页装不下就整节推到下一页，PLL 那种只有一个标题的页首也会被孤零零留在上一页。
  ['f2l.html', 'oll.html', 'pll.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const pr = h.slice(h.indexOf('@media print'));
    ok(p + ' 的表格能跨页接着排（卡片不再整块不可拆分）',
      /section\{break-inside:auto;overflow:visible/.test(pr) &&
      !/section\{break-inside:avoid/.test(pr));
    ok(p + ' 只禁止「一行被劈开」，标题不落在页尾',
      /tr\{break-inside:avoid\}/.test(pr) &&
      /header\{[^}]*break-after:avoid\}/.test(pr) &&
      /section > h2\{[^}]*break-after:avoid/.test(pr));
    ok(p + ' 打印时不留正文那 60px 底部空白', /main\{padding:0\}/.test(pr));
    ok(p + ' 打印时表格框线加粗、公式文字调大',
      /table\{border:2px solid #333\}/.test(pr) && /th,td\{border:1px solid #333\}/.test(pr) &&
      /code\{font-size:15px;font-weight:600\}/.test(pr));
  });
  const f2l = fs.readFileSync(path.join(ROOT, 'f2l.html'), 'utf8');
  ok('F2L 的红/绿 F 表头换页后重复（<thead> + table-header-group）',
    /<thead>/.test(f2l) && /thead\{display:table-header-group\}/.test(f2l));
  const rest = ['oll.html', 'pll.html', 'oll2.html', 'pbl2.html']
    .map(p => fs.readFileSync(path.join(ROOT, p), 'utf8'));
  ok('OLL / PLL / 二阶两页都没有表头行，不需要 table-header-group',
    rest.every(h => !/<thead>/.test(h)) && rest.every(h => !/table-header-group/.test(h)));
}

  // 导航条是 nav.js 注入的，公式页自己的打印规则管不到它 ——
  // 不藏的话速查表打出来最上面会多一条彩色横条
  const navCss = fs.readFileSync(path.join(ROOT, 'css', 'nav.css'), 'utf8');
  ok('打印时导航条和回到顶部都不印（nav.css 统一管，七页共用）',
    /@media print\{ \.topnav, \.totop\{display:none\} \}/.test(navCss));
}


/* 二阶那两页现在由数据库生成（js/oll2data.js / js/pbl2data.js）：
   真跑一遍内联脚本，拿渲染出来的表来核对内容（结构 / CSS 仍读源码）。 */
function renderDBPage(page, dbFile) {
  const vm = require('vm');
  const src = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const blocks = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const mkEl = (t) => ({ tagName: t, children: [], dataset: {}, style: {}, className: '', title: '',
    innerHTML: '', textContent: '',
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); }, toggle(c, v) { v ? this._s.add(c) : this._s.delete(c); } },
    setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k]; },
    addEventListener() {}, appendChild(c) { this.children.push(c); return c; },
    querySelectorAll() { return []; }, querySelector() { return null; },
    closest() { return null; }, remove() {} });
  const els = {};
  const ctx = { console, JSON, Math, Array, String, Object, setTimeout: () => 0, clearTimeout() {},
    document: { getElementById: id => els[id] || (els[id] = mkEl('div')), createElement: mkEl,
                documentElement: { dataset: {} }, querySelectorAll: () => [],
                addEventListener() {}, body: mkEl('body') },
    navigator: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    window: { print() {}, isSecureContext: false, addEventListener() {} }, location: {} };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, dbFile), 'utf8'), ctx);
  blocks.forEach(b => vm.runInContext(b, ctx));
  return els.app.innerHTML;
}

console.log('\n[19d] 二阶 PBL 公式页（pbl2.html）');
{
  const h = fs.readFileSync(path.join(ROOT, 'pbl2.html'), 'utf8');
  const rh = renderDBPage('pbl2.html', 'js/pbl2data.js');   // 渲染结果（表由库生成）
  // 五条公式（用户给的原文，逐条钉死；换法和名称对不对由 tools/verify.py 算）
  // 情况那格用短编号（和 F2L 的 01a / PLL 的 Aa 一个路数）：
  // a = 邻角换、d = 对角换；两个字母是「上层 / 下层」，只写一个 = 另一层排好了
  const ROWS = [
    ['dd', 'R2 B2 R2'],
    ['ad', "R' U R' B2 R U' R"],
    ['aa', "R2 U' R2 U2 F2 U' R2"],
    ['a', "R U2 R' U' R U2 L' U R' U' L"],
    ['d', "R U' R' U' F2 U' R U R' U F2"]
  ];
  // 编号是图左上角的角标（和 PLL / OLL / 二阶 OLL 一个做法），所以按「图 + 公式」钉
  const rows = [...rh.matchAll(/<img [^>]*data-pbl2="([\w-]+)"[\s\S]{0,400}?<code>([^<]+)<\/code>/g)];
  ok('五行「图 + 公式」，顺序和公式都按给的来',
    rows.length === 5 && rows.every((m, i) => m[1] === ROWS[i][0] && m[2] === ROWS[i][1]),
    rows.map(m => m[1] + '=' + m[2]).join(' | '));
  // 编号角标：图左上角那一块，大小写按给的写法（都是小写）
  const badges = [...rh.matchAll(/data-pbl2="[\w-]+"[\s\S]{0,300}?<span class="no">([^<]+)<\/span>/g)]
    .map(m => m[1]);
  ok('五个编号角标都在，大小写没写错（dd / ad / aa / a / d）',
    JSON.stringify(badges) === JSON.stringify(['dd', 'ad', 'aa', 'a', 'd']), badges.join(','));
  ok('角标是图左上角那一块（td.pic .no 绝对定位 + --badge 底，和 PLL 页同一套）',
    /td\.pic \.no\{position:absolute;left:3px;top:1px/.test(h) &&
    /td\.pic \.no\{[^}]*background:var\(--badge\)/.test(h) &&
    /<td class="pic"><span class="box"><img [^>]*data-pbl2="dd"/.test(rh) &&
    !/<td class="name"/.test(h));
  ok('三列：图 / 公式 / 展开键，而且没有「图 / 公式」表头那一行',
    /<colgroup><col class="pic"><col><col class="pick"><\/colgroup>/.test(rh) &&
    !/<thead>/.test(rh) && /<tbody>/.test(rh) &&
    /<td class="pickCell"><button class="pick off" type="button" disabled/.test(rh));
  // 编号缩写了，原来的说法不能丢：留在图的 alt / title 里（鼠标停一下还看得懂）
  ok('编号只是缩写，全称还在（alt / title 里写着 Adj / Diag 那套说法）',
    /data-pbl2="dd" alt="Diag \/ Diag：[^"]*" title="Diag \/ Diag：/.test(rh) &&
    /data-pbl2="aa" alt="Adj \/ Adj：[^"]*" title="Adj \/ Adj：/.test(rh) &&
    /data-pbl2="a" alt="Adj：[^"]*" title="Adj：/.test(rh) &&
    /data-pbl2="d" alt="Diag：[^"]*" title="Diag：/.test(rh));

  // 图：页面上只写 data-pbl2，昼夜两版都在（256x197）
  const ids = [...new Set([...rh.matchAll(/data-pbl2="([\w-]+)"/g)].map(m => m[1]))];
  ok('五行各配一张图（data-pbl2）', ids.length === 5, ids.join(','));
  const imgBad = [];
  ids.forEach(id => {
    ['day', 'night'].forEach(tone => {
      const rel = 'img/pbl2/' + id + '_' + tone + '-256x197.png';
      const abs = path.join(ROOT, rel);
      if (!fs.existsSync(abs)) { imgBad.push(rel + ' 不存在'); return; }
      try {
        const sz = require('child_process').execSync(
          'python3 -c "from PIL import Image;print(Image.open(\'' + abs + '\').size)"',
          { encoding: 'utf8' }).trim();
        if (sz !== '(256, 197)') imgBad.push(rel + ' ' + sz);
      } catch (e) { /* 没装 PIL 就只查存在性（verify.py 那边会查尺寸） */ }
    });
  });
  ok('每张图的昼夜两版都在、都是 256x197', imgBad.length === 0, imgBad.join('; '));
  // 二阶 PBL 不做旋转图：每个情况就一张（昼夜两版），文件名里没有 -v
  const p2files = fs.readdirSync(path.join(ROOT, 'img/pbl2')).filter(f => f.endsWith('.png'));
  ok('img/pbl2/ 下正好 10 张图（5 种情况 × 昼夜两版，不带 -v）',
    p2files.length === 10 && p2files.every(f => !f.includes('-v')),
    String(p2files.length));
  // PBL 是**固定视角**：库里没有 views 这一层，state / 图 / 写法直接挂在 case 上
  const p2db2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pbl2.json'), 'utf8'));
  ok('二阶 PBL 是固定视角：库里没有 views（state / 图 / 写法都在 case 上），生成的 data 也没有',
    p2db2.cases.every(c => !('views' in c) && c.state && c['img-day'] && c['img-night'] &&
      Array.isArray(c.algs) && c.algs.length) &&
    !/"views"/.test(fs.readFileSync(path.join(ROOT, 'js', 'pbl2data.js'), 'utf8')));

  ok('五条公式都带 ↗，且都指向 calc.html#',
    (rh.match(/class="tocalc"/g) || []).length === 5 &&
    (rh.match(/href="calc\.html#/g) || []).length === 5);
  // 二阶公式要在二阶模式里播：跳计算器的链接都得带 @2:（计算器那边认这个前缀）
  ok('五条 ↗ 都带 @2:（点进去就是二阶模式，不会拿三阶去播）',
    (rh.match(/href="calc\.html#@2:/g) || []).length === 5);
  // 计算器得认识这个前缀：一进来先切二阶，再摆局面、再播
  const calcSrc = fs.readFileSync(path.join(ROOT, 'calc.html'), 'utf8');
  ok('计算器认 @2: 前缀（先切二阶再播）；没带阶数标记的链接按三阶算',
    /else if \(h\.indexOf\('@2:'\) === 0\) \{ hashCube2 = true/.test(calcSrc) &&
    /setMode\(hashCube4 \? '4' : hashCube2 \? '2' : '3'\)/.test(calcSrc));
  ok('点公式能复制（code + copied + toast）',
    /addEventListener\('click'/.test(h) && /closest\('code'\)/.test(h) &&
    /classList\.add\('copied'\)/.test(h) && /id="toast"/.test(h));
  ok('每张图都能点开看大图（data-zoom）',
    (rh.match(/<img[^>]*data-zoom/g) || []).length === 5);
  ok('昼夜两版跟着主题换（syncPbl2Imgs 在 applyTheme 里再调一次）',
    /function syncPbl2Imgs/.test(h) && /applyTheme[\s\S]{0,300}?syncPbl2Imgs\(\)/.test(h));
  ok('打印时图统一换回白天版（交给共用的 nav.js，页面里不再按 id 硬编码）',
    !/content:url\(/.test(h) && /function printWithImages/.test(
      fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8')));
  // 左边那条「二阶公式」目录：和教程页那条目录同一套（能互相切、当前这页高亮）
  ok('左边目录两条（OLL / PBL），当前这页高亮的是 PBL',
    /<nav class="side" aria-label="二阶公式目录">\s*<a href="oll2\.html">OLL · 7 种<\/a>\s*<a class="on" href="pbl2\.html">PBL · 5 种<\/a>/.test(h));
  ok('目录的样式和教程页那条一样（固定在左侧、窄屏收起、打印不印）',
    /\.side\{position:fixed;[^}]*top:calc\(var\(--nav-h, 63px\) \+ 16px\)/.test(h) &&
    /\.side a\.on\{/.test(h) && /@media \(max-width:1240px\)\{ \.side\{display:none\} \}/.test(h) &&
    /\.themebtn,\.printbtn,\.side(?:,\.toolbtn)?\{display:none\}/.test(h));
  // 导航条 / 首页：两页合成一个入口、一张卡片（和教程那套一样）
  const nav = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  const navGroup = nav.slice(nav.indexOf("'oll2.html'"), nav.indexOf(']]', nav.indexOf("'oll2.html'")));
  ok('导航条里合成一个入口：文字「二阶公式」，管着这两页（二级目录里叫 OLL / PBL）',
    /'oll2\.html'\s*,\s*'二阶公式',\s*0,/.test(nav) &&
    /'oll2\.html', 'OLL · 7 种'/.test(navGroup) && /'pbl2\.html', 'PBL · 5 种'/.test(navGroup),
    navGroup.replace(/\s+/g, ' '));
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const card = (idx.match(/<div class="card">\s*<a class="stretch" href="oll2\.html"[\s\S]{0,700}?<\/div>/) || [''])[0];
  ok('首页那张卡片：整张通往二阶公式（data-last 跟着上次看的那页），标题右边 OLL / PBL 两个入口',
    /data-last="oll2\.html"[^>]*aria-label="二阶公式（OLL \/ PBL）"/.test(card) &&
    /<a href="oll2\.html">OLL<\/a>/.test(card) && /<a href="pbl2\.html">PBL<\/a>/.test(card),
    card.replace(/\s+/g, ' ').slice(0, 90));
  ok('首页缩略图也是昼夜两版（x2thumb 交给 applyTheme 换）',
    /<img src="img\/oll2\/sune-v0-day-256x256\.png"[^>]*id="x2thumb"/.test(card) &&
    /'img\/oll2\/sune-v0-' \+ \(t === 'dark' \? 'night' : 'day'\) \+ '-256x256\.png'/.test(idx));

  /* 和教程那两页一样：这一组记住「上次看的是哪一页」——
     从 PBL 离开，再点导航条 / 首页那个入口回来，还是 PBL */
  ok('两页各自记下「二阶公式这个入口看的是谁」（键名是这一组的第一页，和教程同一个做法）',
    /localStorage\.setItem\('cube-last:oll2\.html', 'pbl2\.html'\)/.test(h) &&
    /localStorage\.setItem\('cube-last:oll2\.html', 'oll2\.html'\)/.test(
      fs.readFileSync(path.join(ROOT, 'oll2.html'), 'utf8')));
  {
    const back = run('index.html', { store: { 'cube-last:oll2.html': 'pbl2.html' } });
    back.domReady();
    ok('从 PBL 离开后：导航条「二阶公式」指回 PBL',
      (back.linkTo('二阶公式').href || '').indexOf('pbl2.html') >= 0,
      back.linkTo('二阶公式').href);
    ok('从 PBL 离开后：首页那张卡片也指回 PBL',
      (back.last2.getAttribute('href') || '').indexOf('pbl2.html') >= 0,
      back.last2.getAttribute('href'));
    const fresh = run('index.html');
    fresh.domReady();
    ok('没看过 -> 默认这一组的第一个页面（OLL）',
      (fresh.linkTo('二阶公式').href || '').indexOf('oll2.html') >= 0 &&
      (fresh.last2.getAttribute('href') || '').indexOf('oll2.html') >= 0,
      fresh.linkTo('二阶公式').href + ' / ' + fresh.last2.getAttribute('href'));
  }
}

console.log('\n[19f] 二阶 OLL 公式页（oll2.html）');
{
  const h = fs.readFileSync(path.join(ROOT, 'oll2.html'), 'utf8');
  const rh = renderDBPage('oll2.html', 'js/oll2data.js');   // 渲染结果（表由库生成）
  // 七条公式（用户给的原文，逐条钉死；「图 ↔ 公式」由 tools/verify.py 读图核）
  const ROWS = [
    ['h', "R2 U2 R' U2 R'2"],
    ['pi', "F R U R' U' R U R' U' F'"],
    ['antisune', "R U2 R' U' R U' R'"],
    ['sune', "R U R' U R U2 R'"],
    ['l', "F R' F' R U R U' R'"],
    ['t', "R U R' U' R' F R F'"],
    ['u', "F R U R' U' F'"]
  ];
  // 行里没有单独的「情况」列：编号是图左上角那个角标（和 PLL / OLL 页一样），
  // 所以这里按「图（data-oll2）+ 公式」逐个钉
  const rows = [...rh.matchAll(/<img [^>]*data-oll2="([\w-]+)"[\s\S]{0,400}?<code>([^<]+)<\/code>/g)];
  ok('七行「图 + 公式」，顺序和公式都按给的来',
    rows.length === 7 && rows.every((m, i) => m[1] === ROWS[i][0] && m[2] === ROWS[i][1]),
    rows.map(m => m[1] + '=' + m[2]).join(' | '));
  // 编号角标：位置在图的左上角（和 PLL 页同一套 .no 样式），大小写按公式表写
  const badges = [...rh.matchAll(/data-oll2="[\w-]+"[\s\S]{0,300}?<span class="no">([^<]+)<\/span>/g)]
    .map(m => m[1]);
  ok('七个编号角标都在，大小写没写错（H / Pi / AntiSune / Sune / L / T / U）',
    JSON.stringify(badges) === JSON.stringify(['H', 'Pi', 'AntiSune', 'Sune', 'L', 'T', 'U']),
    badges.join(','));
  ok('角标是图左上角那一块（td.pic .no 绝对定位 + --badge 底，和 PLL 页同一套）',
    /td\.pic \.no\{position:absolute;left:3px;top:1px/.test(h) &&
    /td\.pic \.no\{[^}]*background:var\(--badge\)/.test(h) &&
    /<td class="pic"><span class="box"><img [^>]*data-oll2="h"/.test(rh) &&
    !/<td class="name"/.test(h));
  ok('三列：图 / 公式 / 展开键，而且没有「图 / 公式」表头那一行',
    /<colgroup><col class="pic"><col><col class="pick"><\/colgroup>/.test(rh) &&
    !/<thead>/.test(rh) && /<tbody>/.test(rh) &&
    /<td class="pickCell"><button class="pick off" type="button" disabled/.test(rh));

  // 图：页面上只写 data-oll2，昼夜两版都在（256x256）
  const ids = [...new Set([...rh.matchAll(/<img [^>]*data-oll2="([\w-]+)"/g)].map(m => m[1]))];
  ok('七行各配一张图（data-oll2）', ids.length === 7, ids.join(','));
  const imgBad = [];
  ids.forEach(id => {
    ['day', 'night'].forEach(tone => {
      const rel = 'img/oll2/' + id + '-v0-' + tone + '-256x256.png';
      const abs = path.join(ROOT, rel);
      if (!fs.existsSync(abs)) { imgBad.push(rel + ' 不存在'); return; }
      try {
        const sz = require('child_process').execSync(
          'python3 -c "from PIL import Image;print(Image.open(\'' + abs + '\').size)"',
          { encoding: 'utf8' }).trim();
        if (sz !== '(256, 256)') imgBad.push(rel + ' ' + sz);
      } catch (e) { /* 没装 PIL 就只查存在性（verify.py 那边会读图核） */ }
    });
  });
  ok('每张图的昼夜两版都在、都是 256x256', imgBad.length === 0, imgBad.join('; '));
  // 每个情况按 U^k 去重后有多个画面（h 是 2 个、其余 4 个），每个画面昼夜两版
  const o2db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/oll2.json'), 'utf8'));
  const o2views = o2db.cases.reduce((n, c) => n + c.views.length, 0);
  const o2files = fs.readdirSync(path.join(ROOT, 'img/oll2')).filter(f => f.endsWith('.png'));
  ok('img/oll2/ 下正好 ' + o2views * 2 + ' 张图（' + o2views + ' 画面 × 昼夜两版，没有多余文件）',
    o2files.length === o2views * 2 &&
    o2files.filter(f => f.includes('-v')).length === o2files.length,
    String(o2files.length));

  ok('七条公式都带 ↗，且都带 @2:（点过去就是二阶模式）',
    (rh.match(/class="tocalc"/g) || []).length === 7 &&
    (rh.match(/href="calc\.html#@2:/g) || []).length === 7);
  ok('点公式能复制（code + copied + toast）',
    /addEventListener\('click'/.test(h) && /closest\('code'\)/.test(h) &&
    /classList\.add\('copied'\)/.test(h) && /id="toast"/.test(h));
  ok('每张图都能点开看大图（data-zoom）',
    (rh.match(/<img[^>]*data-zoom/g) || []).length === 7);
  ok('昼夜两版跟着主题换（syncOll2Imgs 在 applyTheme 里再调一次）',
    /function syncOll2Imgs/.test(h) && /applyTheme[\s\S]{0,300}?syncOll2Imgs\(\)/.test(h));
  ok('打印时图统一换回白天版（交给共用的 nav.js，页面里不再按 id 硬编码）',
    !/content:url\(/.test(h) && /function printWithImages/.test(
      fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8')));
  ok('页头写缩写 + 英文全称（二阶 OLL / Orientation of the Last Layer）',
    /<h1>二阶 OLL<\/h1>\s*<p>Orientation of the Last Layer<\/p>/.test(h));
  // 左边那条「二阶公式」目录：同一套目录，这页高亮的是 OLL
  ok('左边目录两条（OLL / PBL），当前这页高亮的是 OLL',
    /<nav class="side" aria-label="二阶公式目录">\s*<a class="on" href="oll2\.html">OLL · 7 种<\/a>\s*<a href="pbl2\.html">PBL · 5 种<\/a>/.test(h));
  ok('目录指向的是另外那一页（点 PBL 过去就是 pbl2.html）',
    /<a href="pbl2\.html">PBL · 5 种<\/a>/.test(h) &&
    /\.side\{position:fixed;/.test(h) && /\.side a\.on\{/.test(h));
}

console.log('\n[19g] 三阶公式页（f2l / oll / pll）：一个导航入口 + 左边目录');
{
  const pages = ['f2l.html', 'oll.html', 'pll.html'];
  const nav = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  const navGroup = nav.slice(nav.indexOf("'f2l.html'"), nav.indexOf(']]', nav.indexOf("'f2l.html'")));
  ok('导航条里三页合成一个入口（三阶公式 → F2L / OLL / PLL，带回到顶部）',
    /'f2l\.html'\s*,\s*'三阶公式',\s*1,/.test(nav) &&
    /'f2l\.html', 'F2L · 39 种'/.test(navGroup) &&
    /'oll\.html', 'OLL · 57 种'/.test(navGroup) &&
    /'pll\.html', 'PLL · 21 种'/.test(navGroup),
    navGroup.replace(/\s+/g, ' '));

  pages.forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const others = pages.filter(x => x !== p);
    ok(p + '：左边目录三条（含自己），当前这页高亮',
      /<nav class="side" aria-label="三阶公式目录">/.test(h) &&
      others.every(o => h.indexOf('href="' + o + '"') >= 0) &&
      new RegExp('<a class="on" href="' + p.replace('.', '\\.') + '">').test(h));
    ok(p + '：目录的样式和教程 / 二阶那条一样（固定左侧、窄屏收起、打印不印）',
      /nav\.side\{position:fixed;/.test(h) && /nav\.side a\.on\{/.test(h) &&
      /@media \(max-width:1544px\)|@media \(max-width:1240px\)/.test(h) &&
      /,nav\.side(?:,\.toolbtn)?\{display:none\}/.test(h));
    ok(p + '：记下「三阶公式这个入口看的是自己」（和教程 / 二阶同一条规则）',
      new RegExp("localStorage\\.setItem\\('cube-last:f2l\\.html', '" + p + "'\\)").test(h));
  });

  // 单手公式那两页（OH-OLL / OH-PLL）也挂了同一套左边目录
  ['oh-oll.html', 'oh-pll.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const other = p === 'oh-oll.html' ? 'oh-pll.html' : 'oh-oll.html';
    ok(p + '：左边目录两条（含自己），当前这页高亮',
      /<nav class="side" aria-label="单手公式目录">/.test(h) &&
      h.indexOf('href="' + other + '"') >= 0 &&
      new RegExp('<a class="on" href="' + p.replace('.', '\\.') + '">').test(h));
    ok(p + '：目录位置 / 窄屏收起 / 打印不印，和「三阶公式」那条一致',
      /left:max\(14px, calc\(50% - 616px\)\)/.test(h) &&
      /@media \(max-width:1240px\)\{ nav\.side\{display:none\} \}/.test(h) &&
      /,nav\.side(?:,\.toolbtn)?\{display:none\}/.test(h) &&
      /main\{max-width:880px/.test(h));
  });

  // 目录不能压在正文上：按各页 CSS 里声明的正文宽 / 目录位置 / 收起阈值算一遍
  {
    const bad = [];
    pages.concat(['oll2.html', 'pbl2.html', 'oh-oll.html', 'oh-pll.html',
                  'tutorial-basic.html', 'tutorial-advanced.html'])
      .forEach(p => {
        const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
        const mw = +(h.match(/main\{max-width:(\d+)px/) || [])[1];
        // 目录的左边：只认「left:max(14px, calc(50% - Npx))」这一种写法
        // （F2L 页里还有 col.side{width:110px}，不能拿 `.side{…}` 当目录那条规则）
        const lx = +(h.match(/left:max\(14px, calc\(50% - (\d+)px\)\)/) || [])[1];
        // 收起的那条规则写法不一：有的是「{ nav.side{display:none} }」，
        // 教程页是「{ .side,.steps{display:none} }」—— 认「这个 @media 里提到 .side 且藏起来」
        const hide = +(h.match(/max-width:(\d+)px\)\{[^}]*\.side[^}]*display:none/) || [])[1];
        if (!mw || !lx || !hide) { bad.push(p + '（读不出正文宽 / 目录位置 / 阈值）'); return; }
        [1, 40, 200, 400, 900, 1400].forEach(add => {
          const vw = hide + add;
          const panel = Math.max(14, vw / 2 - lx) + 152;
          const content = vw / 2 - mw / 2;
          if (panel > content) bad.push(p + '@' + vw + '：目录右缘 ' + panel.toFixed(0) +
                                        ' > 正文左缘 ' + content.toFixed(0));
        });
      });
    ok('左边目录在任何「显示得出来」的宽度下都不压正文（按 CSS 里那几个数算的）',
      bad.length === 0, bad.slice(0, 3).join(' | '));
  }

  // 首页：三张卡片并成一张，标题右边三个入口
  {
    const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const card = (idx.match(/<div class="card">\s*<a class="stretch" href="f2l\.html"[\s\S]{0,700}?<\/div>/) || [''])[0];
    ok('首页那张卡片：整张通往三阶公式（data-last 跟着上次看的那页），标题右边 F2L / OLL / PLL 三个入口',
      /data-last="f2l\.html"[^>]*aria-label="三阶公式（F2L \/ OLL \/ PLL）"/.test(card) &&
      /<a href="f2l\.html">F2L<\/a>/.test(card) && /<a href="oll\.html">OLL<\/a>/.test(card) &&
      /<a href="pll\.html">PLL<\/a>/.test(card), card.replace(/\s+/g, ' ').slice(0, 100));
    ok('首页那张三阶卡片的缩略图跟着主题换（OLL 那张紫顶 / 黄顶）',
      /<img src="img\/oll\/oll-01-v0-day-256x256\.png"[^>]*id="ollthumb"/.test(card) &&
      /'img\/oll\/oll-01-v0-' \+ \(t === 'dark' \? 'night' : 'day'\) \+ '-256x256\.png'/.test(idx));
    ok('三阶那三张老卡片没了（首页只剩一张合成卡）',
      !/<a class="card" href="f2l\.html">/.test(idx) && !/<a class="card" href="oll\.html">/.test(idx) &&
      !/<a class="card" href="pll\.html">/.test(idx));
  }

  // 从 PLL 离开，再点导航条 / 首页卡片回来还是 PLL
  {
    const back = run('index.html', { store: { 'cube-last:f2l.html': 'pll.html' } });
    back.domReady();
    ok('从 PLL 离开后：导航条「三阶公式」指回 PLL',
      (back.linkTo('三阶公式').href || '').indexOf('pll.html') >= 0, back.linkTo('三阶公式').href);
    ok('从 PLL 离开后：首页那张卡片也指回 PLL',
      (back.last3.getAttribute('href') || '').indexOf('pll.html') >= 0,
      back.last3.getAttribute('href'));
    const fresh = run('index.html');
    fresh.domReady();
    ok('没看过 -> 默认这一组的第一个页面（F2L）',
      (fresh.linkTo('三阶公式').href || '').indexOf('f2l.html') >= 0 &&
      (fresh.last3.getAttribute('href') || '').indexOf('f2l.html') >= 0,
      fresh.linkTo('三阶公式').href + ' / ' + fresh.last3.getAttribute('href'));
  }
}

console.log('\n[19h] 单手 PLL 页（oh-pll.html）：公式和本页的图逐条对得上');
{
  const h = fs.readFileSync(path.join(ROOT, 'oh-pll.html'), 'utf8');
  // 行数据现在是库生成的（页面里的 SECTIONS 字面量没了）：这里按页面同一套规则
  // 从 data/pll.json 还原「单手能用」的清单，再去核页头 / 顺序 / 图。
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pll.json'), 'utf8'));
  const IDS = db.cases.map(c => c.id);
  const rows = db.cases.map(c => {
    let oh = [];
    (c.views || []).forEach(v => (v.algs || []).forEach(a => {
      if (a.uses.indexOf('OH') >= 0) {
        oh.push({ alg: a.alg, pref: (a.tags || []).indexOf('ohpll-preferred') >= 0 });
      }
    }));
    if (!oh.length) (c.views[0].algs || []).forEach(a => {
      if (a.uses.indexOf('2H') >= 0) oh.push({ alg: a.alg, pref: false });
    });
    // 和页面同一条规则：标了 ohpll-preferred 的排前面（默认显示的那条）
    oh.sort((x, y) => (y.pref ? 1 : 0) - (x.pref ? 1 : 0));
    return oh.length ? [c.id, oh.map(x => x.alg).join('\n')] : null;
  }).filter(Boolean);
  ok('页头写「单手 PLL」+ 英文全称（21 种）',
    /<h1>单手 PLL<\/h1>\s*<p>One-Handed · Permutation of the Last Layer<\/p>/.test(h) &&
    /var SECTIONS = \(function/.test(h) && rows.length === 21);
  ok('21 条公式按标准顺序排（' + rows.length + ' 条）',
    rows.length === 21 && rows.every((r, i) => r[0] === IDS[i] && r[1] && r[1].trim()),
    rows.map(r => r[0]).join(','));

  // 表格是 JS 现搭的（和 PLL / OLL 页一样），所以这里核对模板 + 磁盘上的图
  ok('每行一张图：模板里 IMG(编号) + data-ohpll',
    /'<td class="pic"><span class="box"><img src="' \+ IMG\(n, alg\) \+ '" data-zoom data-ohpll="/.test(h));
  // 图也来自库：按这一行显示的公式反查角度（viewOf 的同一套规则）——
  // 单手公式常常不在基准角度（F 在角度3、Ja 在角度2、Na/Z 在角度1）。
  const caseById = {};
  db.cases.forEach(c => { caseById[c.id] = c; });
  const viewOfRow = (id, alg) => {
    const c = caseById[id];
    return c.views.filter(v => v.algs.some(a => a.alg === alg))[0] || c.views[0];
  };
  const bad = [];
  rows.forEach(r => {
    const v = viewOfRow(r[0], r[1]);
    [['彩色', 'img'], ['无色白天', 'img-nc-day'], ['无色夜晚', 'img-nc-night']].forEach(([label, k]) => {
      const f = v[k];
      if (!f) { bad.push(r[0] + ' 缺' + label); return; }
      if (!fs.existsSync(path.join(ROOT, f))) { bad.push(f + ' 不存在'); return; }
      const b = fs.readFileSync(path.join(ROOT, f));
      if (b.readUInt32BE(16) !== 256 || b.readUInt32BE(20) !== 256) {
        bad.push(f + '=' + b.readUInt32BE(16) + 'x' + b.readUInt32BE(20));
      }
    });
  });
  ok('每行的三版图都在、都是 256x256（21 × 3 张）', bad.length === 0, bad.slice(0, 3).join('; '));
  // 现在和 PLL 页一样从库里取图：按公式反查角度，无色版还分昼夜
  ok('图从数据库来：按公式反查角度，无色版分昼夜',
    /function viewOf\(id, alg\)/.test(h) &&
    /if \(showColors\) return v\.img;/.test(h) &&
    /v\['img-nc-night'\] : v\['img-nc-day'\]/.test(h));
  ok('图点一下能看大图（模板上有 data-zoom，放大镜那套在共用的 nav.js 里）',
    /data-zoom data-ohpll=/.test(h));

  ok('每行公式都带 ↗（模板里一行一个 toCalc，链接是 calc.html#公式）',
    /\+ '<\/code>' \+ toCalc\(line, n\)/.test(h) &&
    /'<a class="tocalc" href="calc\.html#' \+ frag/.test(h));
  ok('↗ 不带阶数标记（计算器按「不带标记 = 三阶」处理，这些公式正是三阶）',
    /var green = false;/.test(h) && /不带阶数标记 = 三阶/.test(h));

  ok('点公式能复制（code + copied + toast）',
    /addEventListener\('click'/.test(h) && /closest\('code'\)/.test(h) &&
    /classList\.add\('copied'\)/.test(h) && /id="toast"/.test(h));
  ok('有打印按钮 + 打印规则（图上分页、藏按钮、藏 toast）',
    /id="printbtn"/.test(h) && /@media print\{[\s\S]*?tr\{break-inside:avoid\}/.test(h) &&
    /\.themebtn,\.printbtn(,\.opts)?(,nav\.side)?(,\.toolbtn)?\{display:none\}/.test(h) &&
    /\.toolbtn\{display:none\}/.test(h) && /a\.tocalc\{display:none\}/.test(h));
  ok('主题开关还在（页面底色跟着明暗走）',
    /id="themebtn"/.test(h) && /localStorage\.setItem\('cube-theme', t\)/.test(h));
  ok('单手这一页也有「显示颜色」开关，位置和 PLL 页一致（页头内、打印按钮之后）',
    /<\/button>\s*\n\s*<!--[^>]*-->\s*\n\s*<div class="opts">[\s\S]{0,200}?id="tg-colors"/.test(h) &&
    /id="showcolors" checked> 显示颜色/.test(h) &&
    /ohpll-color-v1/.test(h));

  // 表格是页面脚本现搭的：真跑一遍，免得「模板看着对、一跑就报错」（IMG 少定义一次就白屏）
  {
    const vm = require('vm');
    const blocks = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    function el(tag) {
      return {
        tagName: tag, children: [], style: {}, dataset: {}, className: '', textContent: '',
        innerHTML: '', value: '',
        classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
                     contains(c) { return this._s.has(c); },
                     toggle(c, on) { on ? this._s.add(c) : this._s.delete(c); } },
        setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k]; },
        addEventListener() {}, appendChild(c) { this.children.push(c); return c; },
        querySelectorAll() { return []; }, querySelector() { return null; },
        closest() { return null; }, remove() {}
      };
    }
    const byId = {};
    ['app', 'themebtn', 'printbtn', 'toast'].forEach(i => { byId[i] = el('div'); });
    const store = {};
    const doc = { getElementById: i => byId[i] || el('div'), createElement: el,
                  documentElement: el('html'), querySelectorAll: () => [],
                  addEventListener() {}, body: el('body') };
    const ctx = { console, JSON, Math, Array, String, Object, setTimeout: () => 0,
                  clearTimeout() {}, document: doc, navigator: {},
                  localStorage: { getItem: k => (k in store ? store[k] : null),
                                  setItem: (k, v) => { store[k] = String(v); } },
                  window: { print() {}, isSecureContext: false }, location: {} };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    let err = null;
    try {
      // 页面依赖公式库（图、候选都从它来），桩里也要先跑一遍
      vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'plldata.js'), 'utf8'), ctx);
      blocks.forEach(b => vm.runInContext(b, ctx));      // 全部脚本，按出现顺序
    } catch (e) { err = e; }
    const out = byId.app.innerHTML;
    const nRow = (out.match(/<tr>/g) || []).length;
    const nImg = [...out.matchAll(/data-ohpll="([\w-]+)"/g)].map(m => m[1]);
    const nCalc = (out.match(/class="tocalc"/g) || []).length;
    ok('页面脚本真跑一遍不报错，并且渲染出 21 行（每行图 + 公式 + ↗）',
      !err && nRow === 21 && nImg.length === 21 && nCalc >= 21,
      err ? String(err) : (nRow + ' 行 / ' + nImg.length + ' 图 / ' + nCalc + ' ↗'));
    ok('渲染出来的图片地址就是 img/pll 下按角度命名的那 21 张，编号一个不差',
      IDS.every(x => nImg.indexOf(x) >= 0) &&
      new RegExp('src="img/pll/pll-Aa-v0-256x256\\.png"').test(out),
      nImg.slice(0, 4).join(','));
    ok('跑完之后把「当前主题」写进了存档（和后几页一样）', !!store['cube-theme'],
      JSON.stringify(store));
  }

  // 单手那一列的首选：库里 OH 那几条里标了 ohpll-preferred 的（没标就取第一条）。
  // Ga/Gb/Gc 都有专属单手写法；Gd 用的是和双手共用的 1 号。
  {
    const norm = str => String(str).replace(/[\s()（）]+/g, '');   // 比较时忽略括号和空白
    const mainPll = {};
    db.cases.forEach(c => {
      const a = (c.views[0].algs || []).filter(x => x.uses.indexOf('2H') >= 0)[0];
      if (a) mainPll[c.id] = norm(a.alg);
    });
    const ohFirst = {};
    rows.forEach(r => { ohFirst[r[0]] = norm(String(r[1]).split('\n')[0]); });
    const ohPool = c => c.views.flatMap(v => v.algs).filter(a => a.uses.indexOf('OH') >= 0);
    const pickOh = c => ohPool(c).filter(a => (a.tags || []).indexOf('ohpll-preferred') >= 0)[0]
                          || ohPool(c)[0];
    const cs = id => db.cases.filter(c => c.id === id)[0];
    ok('每个情况的单手首选都和库里对得上（OH 那几条里标了 ohpll-preferred 的）',
      db.cases.every(c => { const p = pickOh(c); return !p || ohFirst[c.id] === norm(p.alg); }),
      db.cases.filter(c => { const p = pickOh(c); return p && ohFirst[c.id] !== norm(p.alg); })
        .map(c => c.id).join(',') || '');
    ok('Ga / Gb / Gc 用的是专属单手写法（不等于双手主写法）；Gd 用的是共用的 1 号',
      ohFirst['Ga'] && ohFirst['Ga'] !== mainPll['Ga'] &&
      ohFirst['Gb'] && ohFirst['Gb'] !== mainPll['Gb'] &&
      ohFirst['Gc'] && ohFirst['Gc'] !== mainPll['Gc'] &&
      ohFirst['Gd'] === mainPll['Gd'],
      ['Ga', 'Gb', 'Gc', 'Gd'].map(g => g + '=' + (ohFirst[g] || '')).join(' | '));
    // 用户之前逐条定过的口径不能被这次导入冲掉
    const noOh = (id, alg) => {
      const a = cs(id).views.flatMap(v => v.algs).filter(x => x.alg === alg)[0];
      return a && a.uses.indexOf('OH') < 0;
    };
    const usesOf = (id, no) =>
      cs(id).views.flatMap(v => v.algs).filter(a => a.no === no)[0].uses.slice().sort().join('+');
    ok('Ga / Gb / Gc / Gd 的 1 号（双手主写法）现在仍然只有 2H',
      usesOf('Ga', 1) === '2H' && usesOf('Gb', 1) === '2H' &&
      noOh('Ga', "D' R2 U R' U R' U' R U' R2 U' D R' U R U") &&
      noOh('Gb', "(R' d' F) (R2 u) (R' U) (R U' R u' R2)"),
      ['Ga', 'Gb', 'Gc', 'Gd'].map(g =>
        g + ':' + cs(g).views.flatMap(v => v.algs).map(a => a.no + '=' + a.uses.join('/')).join(' ')).join(' | '));
    /* 合并同一条写法的重复项之后，uses 取并集：Ga/Gb/Gc/Gd 的 2 号在 jperm 的单手清单里
       有同一动作、只差记号（R'2 与 R2）的一条，所以它们现在带 OH。 */
    ok('Ga / Gc / Gd 的 2 号（以及 Gc 1 号）是 2H+OH —— 同一条在 jperm 单手清单里也出现过',
      usesOf('Ga', 2) === '2H+OH' && usesOf('Gc', 1) === '2H+OH' &&
      usesOf('Gc', 2) === '2H+OH' && usesOf('Gd', 2) === '2H+OH' &&
      noOh('Gc', "(R2 u' R U' R) (U R' u R2) y (R U' R')") === false,
      JSON.stringify([usesOf('Ga', 2), usesOf('Gc', 1), usesOf('Gc', 2), usesOf('Gd', 2)]));
    const GB_OH = "(R' U' R) y (R2 u) (R' U R U') (R u' R2)";
    const gbOh = cs('Gb').views.flatMap(v => v.algs).filter(a => a.alg === GB_OH)[0];
    ok('Gb 2 号：同时也是 2H（2H+OH），带 ohpll-preferred',
      gbOh.uses.slice().sort().join('+') === '2H+OH' &&
      (gbOh.tags || []).indexOf('ohpll-preferred') >= 0,
      JSON.stringify([gbOh.uses, gbOh.tags]));
  }

  // jperm 的 OH PLL（https://jperm.net/algs/oh/pll）已经并进来：
  // 7 条和库里已有的同一条合并（其中 5 条顺带补上 OH），32 条新增；
  // 12 条需要在末尾补一个 AUF 才解得出（jperm 那边省了，比如他们的 Jb 就比我们少一个 U'）。
  {
    const jp = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pll.json'), 'utf8'));
    const cs = id => jp.cases.filter(c => c.id === id)[0];
    const normA = str => String(str).replace(/[\s()（）]+/g, '');   // 库里保留括号，比较时忽略
    const has = (id, alg) => cs(id).views.flatMap(v => v.algs)
      .some(a => normA(a.alg) === normA(alg));
    const OHn = c => c.views.flatMap(v => v.algs).filter(a => a.uses.indexOf('OH') >= 0).length;
    const total = jp.cases.reduce((n, c) => n + OHn(c), 0);
    ok('jperm 的 OH 写法都进来了（Ga 补 AUF 的那条、Gb 的 R2 u 那条、Jb 的经典条…）',
      has('Ga', "R2 U R' U R' U' R U' R2 U' D R' U R D' U") &&
      has('Gb', "(R' U' R) y (R2 u) (R' U R U') (R u' R2)") &&
      has('Jb', "R U R' F' R U R' U' R' F R2 U' R' U'") &&
      has('Y', "R2 U' R' U R U' x' U' z' U' R U' R' U' r B") &&
      total >= 53,        // 合并掉重复写法之后是 54（原来 56 里有 2 条是同一条的另一种记号）
      'OH 写法总数 ' + total);
    // 带 M 层的写法一律只算双手（单手做 M 不现实，用户拍板）
    const M_MOVE = /^M[2']?$/;
    const mWithOh = jp.cases.flatMap(c => c.views.flatMap(v => v.algs.map(a => [c.id, a])))
      .filter(([, a]) => a.uses.indexOf('OH') >= 0 &&
        a.moves.some(t => M_MOVE.test(t)));
    ok('带 M 层的写法都不带 OH（H 的 M2 那条就是 2H）',
      mWithOh.length === 0 &&
      cs('H').views.flatMap(v => v.algs).filter(a => a.alg === "M2 U' M2 U2 M2 U' M2")[0]
        .uses.join('+') === '2H',
      JSON.stringify(mWithOh.map(([id, a]) => id + ':' + a.alg)));
    ok('jperm 的 `y M\' …` 那条：去掉开头的 y 之后哪个画面都对不上 → 按规矩丢掉（库里不再有它）',
      !cs('Z').views.flatMap(v => v.algs).some(a => a.alg.indexOf("y M'") === 0) &&
      cs('Z').views.flatMap(v => v.algs).some(a => a.alg === "M' U M2 U M2 U M' U2 M2 U'"),
      JSON.stringify(cs('Z').views.flatMap(v => v.algs).map(a => a.alg)));
    ok('jperm 只有 1 条没进来（H 的 x\' R r … u U\' …，里面有中层转、在我们模型里不是纯 PLL）',
      !has('H', "x' R r U2 R' r' u U' R2 U D"));
  }

  const nav = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  ok('导航条里「单手公式」加在「三阶公式」右边、「二阶公式」左边（现在管 OH-OLL / OH-PLL 两页）',
    /'oh-oll\.html',\s*'单手公式',\s*1,/.test(nav) &&
    nav.indexOf("'oh-oll.html'") > nav.indexOf("'f2l.html'") &&
    nav.indexOf("'oh-oll.html'") < nav.indexOf("'oll2.html'") &&
    /\['oh-oll\.html', 'OH-OLL · 57 种'\], \['oh-pll\.html', 'OH-PLL · 21 种'\]/.test(nav),
    nav.slice(nav.indexOf("'oh-oll.html'") - 40, nav.indexOf("'oh-oll.html'") + 160));
}

console.log('\n[19j] 展开键：再点收起、展开态样式、开合过渡（PLL / 单手 / OLL 同一套）');
{
  // 真跑一遍页面的展开逻辑：一格里两条写法时，点开应只有 1 条候选
  // （OH 页曾经是两条一模一样的 —— 去重的写和读用了不同的键），再点一次收起。
  const vm = require('vm');
  const mkCls = () => {
    const s = new Set();
    return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
      toggle(c, v) { v === undefined ? (s.has(c) ? s.delete(c) : s.add(c)) : (v ? s.add(c) : s.delete(c)); } };
  };
  const mkEl = (t) => ({ tagName: t, children: [], style: {}, dataset: {}, className: '', title: '',
    disabled: false, offsetHeight: 90, offsetWidth: 300, classList: mkCls(), _ev: {},
    addEventListener(ev, fn) { (this._ev[ev] = this._ev[ev] || []).push(fn); },
    fire(ev) { (this._ev[ev] || []).forEach(f => f({ preventDefault() {}, stopPropagation() {} })); },
    setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k]; },
    appendChild(c) { this.children.push(c); return c; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 100, top: 100, right: 200, bottom: 126 }; },
    closest() { return null; }, remove() {}, cloneNode() { return mkEl(t); },
    set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h || ''; },
    set textContent(v) { this._t = v; }, get textContent() { return this._t === undefined ? '' : this._t; } });
  // 造一行「正在显示第一条写法」的表，把页面的展开逻辑真跑一遍，返回点开/收起的结果
  const probe = (page, dbFile, attr, id, algs, inject) => {
    const h = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const blocks = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    const codes = algs.map(t => { const c = mkEl('code'); c.textContent = t; return c; });
    const cell = mkEl('td'); cell._codes = codes;
    const liveCodes = () => cell._codes.filter(c => c.tagName === 'code');
    cell.querySelector = sel => sel === 'code' ? (liveCodes()[0] || null)
                          : sel === 'a.tocalc' ? mkEl('a') : null;
    cell.querySelectorAll = sel => sel === 'code' ? liveCodes() : [];
    cell.appendChild = c => { cell._codes.push(c); return c; };
    // 面板里现在**也**列「当前这一行正在显示的那条」（带 .cur 高亮，不再排除），
    // 所以下面「点候选换过去」要挑第一条**不是**当前那条的
    const firstOther = () => (box().children || []).filter(c => !c.classList.contains('cur'))[0];
    const curLabels = () => (box().children || []).filter(c => c.classList.contains('cur'))
      .map(c => ((c.innerHTML || '').match(/<span>([^<]*)<\/span>/) || [])[1] || '');
    // apply() 会先把这一格清空（真实 DOM 里 innerHTML='' 会把旧 <code> 干掉），桩里照做
    Object.defineProperty(cell, 'innerHTML', {
      get() { return ''; }, set() { cell._codes = []; },
    });
    const img = mkEl('img');
    img.getAttribute = k => k === attr ? id : img[k];
    img.closest = sel => (sel === 'tr' ? tr : null);   // 切主题时页面会从图片找到那一行
    const pick = mkEl('button');
    const tr = mkEl('tr');
    tr.querySelector = sel => sel === 'td.pic img' ? img : sel === 'td.f' ? cell
                          : sel === 'button.pick' ? pick
                          : sel === 'code' ? cell.querySelector('code') : null;
    const byId = {};
    ['app', 'themebtn', 'printbtn', 'toast', 'showcolors', 'tg-colors']
      .forEach(i => { byId[i] = mkEl('div'); });
    const store = {};
    const doc = { getElementById: i => byId[i] || mkEl('div'), createElement: mkEl,
      documentElement: { dataset: {} },
      querySelectorAll: sel => sel === '#app tr' ? [tr]
                            : sel.indexOf('img[data-') >= 0 ? [img] : [],
      addEventListener() {}, body: mkEl('body') };
    const ctx = { console, JSON, Math, Array, String, Object, setTimeout: () => 0, clearTimeout() {},
      document: doc, navigator: {},
      localStorage: { getItem: k => (k in store ? store[k] : null),
                      setItem: (k, v) => { store[k] = String(v); } },
      window: { print() {}, isSecureContext: false, addEventListener() {},
                pageXOffset: 0, pageYOffset: 0, innerWidth: 1200, innerHeight: 800 },
      location: {} };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    let err = null;
    try {
      vm.runInContext(fs.readFileSync(path.join(ROOT, dbFile), 'utf8'), ctx);
      if (inject) inject(ctx);          // 测试里给某个情况补一条写法（只改内存里的库）
      blocks.forEach(b => vm.runInContext(b, ctx));
    } catch (e) { err = e; }
    const box = () => doc.body.children[doc.body.children.length - 1] || mkEl('div');
    const shown0 = (cell.querySelector('code') || {}).textContent || '';
    pick.fire('click');
    const labels = (box().children || []).map(c =>
      ((c.innerHTML || '').match(/<span>([^<]*)<\/span>/) || [])[1] || '');
    const idx = (box().children || []).map(c =>
      ((c.innerHTML || '').match(/<b class="idx">(\d+)<\/b>/) || [])[1] || '');
    const cur = curLabels();          // 快照：面板里带 .cur 的就是当前这条
    const opened = pick.classList.contains('on') && box().classList.contains('on');
    pick.fire('click');
    const closed = !pick.classList.contains('on') && !box().classList.contains('on');
    // 再开一次，点第一条候选：这一格应换成那条写法，并写进 localStorage
    let applied = '';
    if (labels.length) {
      pick.fire('click');
      const first = firstOther();        // 面板现在也含当前那条，要挑「别的」写法
      if (first) first.fire('click');
      // apply() 会先塞 <code> 再塞那个「跳计算器」的 <a>，所以要挑 code 看
      const now = (cell._codes || []).filter(c => c.tagName === 'code').map(c => c.textContent);
      applied = now[now.length - 1] || '';
    }
    return { err, labels, idx, opened, closed, applied, store, imgSrc: img.src || '', shown: shown0,
             cur,
             // 切一次昼夜：页面会按「这一行现在那条写法」重刷配图
             theme: () => { byId.themebtn.fire('click'); return img.src || ''; } };
  };
  // 单手页 Ga：库里现在 5 条单手写法，行里显示首选那条（ohpll-preferred 排最前）
  const GADB = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pll.json'), 'utf8'))
    .cases.filter(c => c.id === 'Ga')[0];
  const gaPool = GADB.views.flatMap(v => v.algs).filter(a => a.uses.indexOf('OH') >= 0);
  const gaFirst = gaPool.filter(a => (a.tags || []).indexOf('ohpll-preferred') >= 0)[0] || gaPool[0];
  const gaRest = [gaFirst].concat(gaPool.filter(a => a !== gaFirst));
  const GA = gaRest.map(a => a.alg);
  const oh = probe('oh-pll.html', 'js/plldata.js', 'data-ohpll', 'Ga', GA);
  ok('单手页展开 Ga：面板列出全部单手写法（含本行那条，带 .cur 高亮），号取自库里',
    !oh.err && oh.opened && oh.labels.join('|') === GA.join('|') &&
    oh.idx.join(',') === gaRest.map(a => String(a.no)).join(',') &&
    oh.cur.join('|') === GA[0],
    oh.err ? String(oh.err) : JSON.stringify([oh.labels, oh.idx, oh.cur]));
  ok('单手页再点同一个展开键：收起（键和面板都不再有 .on）', oh.closed);
  // 存档里留着「后来被撤了 OH 标签」的旧写法时，单手页不能把它当默认显示出来
  const GA_OLD = "D' R2 U R' U R' U' R U' R2 U' D R' U R U";
  const ohStale = probe('oh-pll.html', 'js/plldata.js', 'data-ohpll', 'Ga', GA,
                        c => c.localStorage.setItem('cube-pick:oh-pll:Ga', GA_OLD));
  ok('单手页不认存档里已经不是 OH 的旧写法（Ga 仍显示单手首选那条）',
    !ohStale.err && ohStale.shown === GA[0] && ohStale.labels.join('|') === GA.join('|'),
    ohStale.err ? String(ohStale.err) : JSON.stringify([ohStale.shown, ohStale.labels]));
  // 单手 OLL 页（oh-oll.html）：13 有两条单手写法，候选就是另一条
  const OLLDB = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  const cs2 = id => OLLDB.cases.filter(c => c.id === id)[0];
  const ohPool = id => cs2(id).views.flatMap(v => v.algs).filter(a => a.uses.indexOf('OH') >= 0);
  const ooh13 = ohPool('13');
  const oohFirst = ooh13.filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0)[0] || o13[0];
  const oohRest = [oohFirst].concat(ooh13.filter(a => a !== oohFirst));
  const oo = probe('oh-oll.html', 'js/olldata.js', 'data-oholl', '13', oohRest.map(a => a.alg));
  ok('单手 OLL 页展开 13：面板列出全部单手写法（含本行那条，带 .cur 高亮），号取自库里',
    !oo.err && oo.opened && oo.labels.join('|') === oohRest.map(a => a.alg).join('|') &&
    oo.idx.join(',') === oohRest.map(a => String(a.no)).join(',') &&
    oo.cur.join('|') === oohRest[0].alg,
    oo.err ? String(oo.err) : JSON.stringify([oo.labels, oo.idx]));
  ok('单手 OLL 页再点同一个展开键：收起', oo.closed);
  // 存档里留着「不是 OH 的」写法时，单手页不能把它当默认显示出来
  const ooh2h = cs2('13').views[0].algs.filter(a => a.uses.indexOf('OH') < 0)[0].alg;
  const ooStale = probe('oh-oll.html', 'js/olldata.js', 'data-oholl', '13', oohRest.map(a => a.alg),
                        c => c.localStorage.setItem('cube-pick:oh-oll:13', ooh2h));
  ok('单手 OLL 页不认存档里不是 OH 的写法（13 仍显示 oholl-preferred 那条）',
    !ooStale.err && ooStale.shown === oohRest[0].alg,
    ooStale.err ? String(ooStale.err) : ooStale.shown);
  // 8 号：单手页显示 oholl-preferred 那条，展开候选里应当出现新加的「15 号 1 号的逆」
  const o8 = ohPool('8');
  const o8first = o8.filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0)[0] || o8[0];
  const o8rest = [o8first].concat(o8.filter(a => a !== o8first));
  const oo8 = probe('oh-oll.html', 'js/olldata.js', 'data-oholl', '8', o8rest.map(a => a.alg));
  ok('单手 OLL 页 8 号：候选里有新加的「15 号 1 号的逆」',
    !oo8.err && oo8.labels.indexOf("(r' U' r) (U' R' U R) (r' U r)") >= 0,
    oo8.err ? String(oo8.err) : JSON.stringify(oo8.labels));

  // 反过来：双手 OLL 页也不能认单手专属写法（57 那条只有 OH）
  const o57oh = ohPool('57')[0];
  const o57main = cs2('57').views[0].algs.filter(a => a.uses.indexOf('2H') >= 0)[0].alg;
  const olStale = probe('oll.html', 'js/olldata.js', 'data-oll', '57', [o57main],
                        c => c.localStorage.setItem('cube-pick:oll:57', o57oh.alg));
  ok('双手 OLL 页不认单手专属写法（57 仍显示双手那条）',
    !olStale.err && olStale.shown === o57main && o57oh.uses.join('+') === 'OH',
    olStale.err ? String(olStale.err) : JSON.stringify([olStale.shown, o57oh.uses]));

  // 反过来：双手 PLL 页也不能认单手专属写法（Gc 的第 3 条）
  const GC_OH = "R2 u' R U' R U R' D x' U2 r U' r'";
  const GC_MAIN = "(R2 U') (R U' R U R' U R2 U D') (R U' R') D U'";
  const plStale = probe('pll.html', 'js/plldata.js', 'data-pll', 'Gc', [GC_MAIN],
                        c => c.localStorage.setItem('cube-pick:pll:Gc', GC_OH));
  ok('双手 PLL 页不认存档里的单手专属写法（Gc 仍显示 2H 主写法）',
    !plStale.err && plStale.shown === GC_MAIN,
    plStale.err ? String(plStale.err) : plStale.shown);
  // OLL 页 13：候选 = 库里这个情况的其它写法（正在显示的那条不列进来），编号取库里的
  const o13 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/oll.json'), 'utf8'))
    .cases.filter(c => c.id === '13')[0].views[0].algs;
  const ol = probe('oll.html', 'js/olldata.js', 'data-oll', '13', [o13[0].alg]);
  ok('OLL 页展开 13：面板列出全套写法（含本行那条，带 .cur 高亮），编号取库里',
    !ol.err && ol.opened && ol.labels.join('|') === o13.map(a => a.alg).join('|') &&
    ol.idx.join(',') === o13.map(a => String(a.no)).join(',') && ol.cur.join('|') === o13[0].alg,
    ol.err ? String(ol.err) : JSON.stringify([ol.labels, ol.idx]));
  ok('OLL 页再点同一个展开键：收起', ol.closed);

  // 每条写法挂在自己所属的画面上（v3 的写法就挂 v3）；换到它时图要跟着切到那个画面
  {
    const o2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/oll2.json'), 'utf8'));
    const cs = id => o2.cases.filter(c => c.id === id)[0];
    const at = (id, v) => (cs(id).views[v].algs || []).map(a => a.alg);
    ok('antisune：v0 还是原来那条（1 号），v3 挂着 R\' U\' R U\' R\' U2 R（2 号）',
      at('antisune', 0).join('|') === "R U2 R' U' R U' R'" &&
      at('antisune', 3).join('|') === "R' U' R U' R' U2 R" &&
      cs('antisune').views[3].algs[0].no === 2,
      JSON.stringify([at('antisune', 0), at('antisune', 3)]));
    ok('sune：v0 还是原来那条（1 号），v2 挂着 L U L\' U L U2 L\'（2 号）',
      at('sune', 0).join('|') === "R U R' U R U2 R'" &&
      at('sune', 2).join('|') === "L U L' U L U2 L'" &&
      cs('sune').views[2].algs[0].no === 2,
      JSON.stringify([at('sune', 0), at('sune', 2)]));
    const pa = probe('oll2.html', 'js/oll2data.js', 'data-oll2', 'antisune',
                     ["R U2 R' U' R U' R'"]);
    const paNight = pa.theme ? pa.theme() : '';
    ok('二阶 OLL：换到 v3 的写法后再切昼夜，图仍停在 v3（不会被打回基准画面）',
      /antisune-v3-night-256x256\.png$/.test(paNight), paNight);
    ok('二阶 OLL 展开 antisune：面板列出 v0 那条（带 .cur）和 v3 那条，点 v3 换公式 + 图切到 v3 + 存档',
      !pa.err && pa.opened && pa.labels.length === 2 &&
      pa.cur.join('|') === "R U2 R' U' R U' R'" &&
      pa.labels[1] === "R' U' R U' R' U2 R" && pa.applied === pa.labels[1] &&
      /antisune-v3-day-256x256\.png$/.test(pa.imgSrc) &&
      pa.store['cube-pick:oll2:antisune'] === "R' U' R U' R' U2 R",
      pa.err ? String(pa.err) : JSON.stringify([pa.labels, pa.imgSrc]));
    const ps = probe('oll2.html', 'js/oll2data.js', 'data-oll2', 'sune',
                     ["R U R' U R U2 R'"]);
    ok('二阶 OLL 展开 sune：面板列出 v0（带 .cur）和 v2 那条，点 v2 图切到 v2',
      !ps.err && ps.opened && ps.labels.length === 2 &&
      ps.cur.join('|') === "R U R' U R U2 R'" &&
      ps.labels[1] === "L U L' U L U2 L'" &&
      /sune-v2-day-256x256\.png$/.test(ps.imgSrc) &&
      ps.store['cube-pick:oll2:sune'] === "L U L' U L U2 L'",
      ps.err ? String(ps.err) : JSON.stringify([ps.labels, ps.imgSrc]));
  }

  // 二阶两页：库里多数情况只有一条写法（sune / antisune 各多一条，挂在 v2 / v3 画面上），
  // 下面这几条用「库里补一条」来验证机制本身
  const o2alt = "R2 U2 R' U2 R2";
  const o2 = probe('oll2.html', 'js/oll2data.js', 'data-oll2', 'h',
                   ["R2 U2 R' U2 R'2", o2alt],
                   c => c.OLL2_DB.cases.filter(x => x.id === 'h')[0].views[0].algs
                     .push({ alg: o2alt, no: 2, n: 6, uses: ['2H'], tags: [] }));
  ok('二阶 OLL 展开 h：库里加第二条写法后，面板列出两条（当前那条带 .cur）、点另一条换过去、换完存档',
    !o2.err && o2.opened && o2.labels.length === 2 && o2.labels[1] === o2alt &&
    o2.cur.join('|') === o2.labels[0] &&
    o2.applied === o2alt && o2.store['cube-pick:oll2:h'] === o2alt,
    o2.err ? String(o2.err) : JSON.stringify([o2.labels, o2.applied]));
  ok('二阶 OLL 再点同一个展开键：收起', o2.closed);
  const p2alt = 'R2 B2 R2 U2';
  const p2 = probe('pbl2.html', 'js/pbl2data.js', 'data-pbl2', 'dd',
                   ['R2 B2 R2', p2alt],
                   c => c.PBL2_DB.cases.filter(x => x.id === 'dd')[0].algs
                     .push({ alg: p2alt, no: 2, n: 5, uses: ['2H'], tags: [] }));
  ok('二阶 PBL 展开 dd：面板列出两条（当前那条带 .cur）、点另一条换过去、换完存档',
    !p2.err && p2.opened && p2.labels.length === 2 && p2.labels[1] === p2alt &&
    p2.cur.join('|') === p2.labels[0] &&
    p2.applied === p2alt && p2.store['cube-pick:pbl2:dd'] === p2alt,
    p2.err ? String(p2.err) : JSON.stringify([p2.labels, p2.applied]));
  ok('二阶 PBL 再点同一个展开键：收起', p2.closed);
  /* 每个展开键都能点（用户要求）：只有一条写法也点得开 —— 面板最后一行是「自定义…」，
     可以在那儿自己填一条。所以脚本里不能再有「只有一条写法就 return、把键留在淡态」那段。 */
  ['oll2.html', 'pbl2.html', 'oll.html', 'oh-oll.html', 'pll.html', 'oh-pll.html', 'f2l.html'].forEach(p => {
    const s = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + '：展开键一律可点（没有「只有一条写法就淡掉」那段）',
      /pick\.classList\.remove\('off'\);/.test(s) && /pick\.disabled = false;/.test(s) &&
      !/length < 2\)\s*\{[\s\S]{0,80}?return;/.test(s));
  });

  // 展开面板里每条候选显示它在 **case 内的编号**（库里唯一，不同写法不同号）
  {
    const pdb = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pll.json'), 'utf8'));
    // Ga 的两条写法都是 2H（1 号 / 2 号）：行里显示 1 号时，候选那条应显示 2 号
    const ga = pdb.cases.filter(c => c.id === 'Ga')[0].views.flatMap(v => v.algs);
    const pg = probe('pll.html', 'js/plldata.js', 'data-pll', 'Ga', [ga[0].alg]);
    // 双手页的候选池：每个画面的 2H 写法（该画面没有就用基准画面的），按画面顺序
    const pool2h = c => {
      const out = [];
      const base = c.views[0].algs.filter(a => a.uses.indexOf('2H') >= 0);
      c.views.forEach(v => {
        const mine = v.algs.filter(a => a.uses.indexOf('2H') >= 0);
        (mine.length ? mine : base).forEach(a => { if (!out.some(x => x.alg === a.alg)) out.push(a); });
      });
      return out;
    };
    const gaPool = pool2h(pdb.cases.filter(c => c.id === 'Ga')[0]);
    ok('展开面板显示写法在 case 内的编号（Ga 行显示 1 号 → 面板每条显示各自的库编号）',
      !pg.err && pg.idx.join(',') === gaPool.map(a => String(a.no)).join(',') &&
      pg.labels.join('|') === gaPool.map(a => a.alg).join('|') &&
      pg.cur.join('|') === gaPool[0].alg,
      pg.err ? String(pg.err) : JSON.stringify([pg.idx, pg.labels]));
    // 号来自库：注入一条编号很靠后的写法，面板显示的必须是那个号，而不是「面板里第几条」
    const extra = "R2 U' R' U' R U R U R U' R";
    const eAlgs = pdb.cases.filter(c => c.id === 'E')[0].views.flatMap(v => v.algs);
    const pe = probe('pll.html', 'js/plldata.js', 'data-pll', 'E', [eAlgs[0].alg],
                     c => c.PLL_DB.cases.filter(x => x.id === 'E')[0].views[0].algs
                       .push({ alg: extra, no: 99, n: 12, uses: ['2H'], tags: [] }));
    ok('面板上的号取自库里（注入的 99 号写法显示 99，而不是面板下标）',
      !pe.err && pe.idx[pe.labels.indexOf(extra)] === '99' &&
      pe.idx.every((n, i) => n === '99' || (pool2h(pdb.cases.filter(c => c.id === 'E')[0])[i] || {}).no === +n),
      pe.err ? String(pe.err) : JSON.stringify([pe.idx, pe.labels]));
    // 四个库：同一个 case 里编号必须唯一且连续 1..n
    const badNo = [];
    ['data/pll.json', 'data/oll.json', 'data/oll2.json', 'data/pbl2.json'].forEach(f => {
      JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')).cases.forEach(c => {
        const views = c.views || [c];
        const nos = views.flatMap(v => (v.algs || []).map(a => a.no));
        if (nos.join(',') !== nos.map((_, i) => i + 1).join(',')) badNo.push(f + ':' + c.id + '=' + nos);
      });
    });
    ok('四个库里，写法编号在 case 内唯一且连续（1..n）', badNo.length === 0, badNo.slice(0, 3).join(' '));
  }

  // ---------- F2L：一格里一个展开键（公式格右边那一列） ----------
  const probeF2L = (id, algs, store, inject) => {
    const h = fs.readFileSync(path.join(ROOT, 'f2l.html'), 'utf8');
    const blocks = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    const cell = mkEl('td');
    cell._codes = algs.map(t => { const c = mkEl('code'); c.textContent = t; return c; });
    const liveCodes = () => cell._codes.filter(c => c.tagName === 'code');
    cell.querySelector = sel => sel === 'code' ? (liveCodes()[0] || null)
                          : sel === 'a.tocalc' ? mkEl('a') : null;
    cell.querySelectorAll = sel => sel === 'code' ? liveCodes() : [];
    cell.appendChild = c => { cell._codes.push(c); return c; };
    cell.getAttribute = k => (k === 'data-f2l' ? id : cell[k]);
    // apply() 会整格重画：桩里也要跟着换掉 <code>，否则 shown() 还是旧的
    Object.defineProperty(cell, 'innerHTML', {
      get() { return ''; },
      set(v) {
        const m = /<code>([^<]*)<\/code>/.exec(String(v));
        const c = mkEl('code'); c.textContent = m ? m[1] : '';
        cell._codes = m ? [c] : [];
      },
    });
    const pick = mkEl('button');
    pick.getAttribute = k => (k === 'data-f2l' ? id : pick[k]);
    pick.classList.add('off'); pick.disabled = true;      // 模板里的初始态（只有一条写法时就这样）
    const els = {};
    const st = store || {};
    const doc = { getElementById: i => els[i] || (els[i] = mkEl('div')), createElement: mkEl,
      documentElement: { dataset: {}, scrollLeft: 0, scrollTop: 0 },
      querySelectorAll: sel => sel === 'button.pick[data-f2l]' ? [pick]
                            : sel === '#app td.f[data-f2l]' ? [cell] : [],
      addEventListener() {}, body: mkEl('body') };
    const ctx = { console, JSON, Math, Array, String, Object, setTimeout: () => 0, clearTimeout() {},
      document: doc, navigator: {},
      localStorage: { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); } },
      window: { print() {}, isSecureContext: false, addEventListener() {},
                pageXOffset: 0, pageYOffset: 0, innerWidth: 1200, innerHeight: 800 },
      location: {} };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    let err = null;
    try {
      vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/f2ldata.js'), 'utf8'), ctx);
      if (inject) inject(ctx);
      blocks.forEach(b => vm.runInContext(b, ctx));
    } catch (e) { err = e; }
    const shown0 = (cell.querySelector('code') || {}).textContent || '';
    const boxOf = () => doc.body.children[doc.body.children.length - 1] || mkEl('div');
    // 面板里现在也列「当前这一格显示的那条」（带 .cur），点候选要挑别的
    const firstOther = () => (boxOf().children || []).filter(c => !c.classList.contains('cur'))[0];
    const curLabels = () => (boxOf().children || []).filter(c => c.classList.contains('cur'))
      .map(c => ((c.innerHTML || '').match(/<span>([^<]*)<\/span>/) || [])[1] || '');
    pick.fire('click');
    const labels = (boxOf().children || []).map(c =>
      ((c.innerHTML || '').match(/<span>([^<]*)<\/span>/) || [])[1] || '');
    const idx = (boxOf().children || []).map(c =>
      ((c.innerHTML || '').match(/<b class="idx">(\d+)<\/b>/) || [])[1] || '');
    const cur = curLabels();          // 快照：面板里带 .cur 的就是当前这条
    const opened = pick.classList.contains('on') && boxOf().classList.contains('on');
    pick.fire('click');
    const closed = !pick.classList.contains('on') && !boxOf().classList.contains('on');
    let applied = '';
    if (labels.length) {
      pick.fire('click');
      const first = firstOther();
      if (first) first.fire('click');
      applied = ((cell.querySelector('code') || {}).textContent) || '';
    }
    return { err, labels, idx, opened, closed, applied, store: st, shown: shown0, cell, pick, cur };
  };
  const A07 = ["(R U R' U2)(R U2 R' U)y'(R' U R)", "(R' F R F')(R U' R' U)(R U' R' U2 R U' R')"];
  const f07 = probeF2L('07', [A07[0]]);
  ok('F2L 展开键：07 有两条写法 → 键点亮，面板两条（当前那条带 .cur），编号取库里',
    !f07.err && f07.opened && !f07.pick.classList.contains('off') && !f07.pick.disabled &&
    f07.labels.join('|') === A07.join('|') && f07.idx.join(',') === '1,2' && f07.cur.join('|') === A07[0],
    f07.err ? String(f07.err) : JSON.stringify([f07.labels, f07.idx]));
  ok('F2L 展开键：再点同一个键收起', f07.closed);
  ok('F2L 展开键：点候选就换过去，并写进 cube-pick:f2l:07',
    f07.applied === A07[1] && f07.store['cube-pick:f2l:07'] === A07[1],
    JSON.stringify([f07.applied, f07.store]));
  const f14 = probeF2L('14a', ["(R U R')"]);
  ok('F2L 展开键：只有一条写法也点得开（面板里有那一行 + 「自定义…」）',
    !f14.err && !f14.pick.classList.contains('off') && !f14.pick.disabled &&
    f14.labels.length === 1,
    f14.err ? String(f14.err) : JSON.stringify(f14.labels));
  const f01 = probeF2L('01a', ["(R U' R' U)(R U' R' U2)(R U' R')"], null,
                       c => c.F2L_DB.cases.filter(x => x.id === '01a')[0].algs
                         .push({ no: 3, alg: "(R U' R' U2)(R U' R' U)(R U' R')", n: 11, moves: [] }));
  ok('F2L 展开键：库里补一条写法 → 键自动亮，面板两条、新那条显示的号是库里给的 3（不是面板第 1 条）',
    !f01.err && f01.labels.length === 2 && f01.idx.join(',') === '1,3' && f01.cur.length === 1 &&
    !f01.pick.classList.contains('off'),
    f01.err ? String(f01.err) : JSON.stringify([f01.labels, f01.idx]));
  const fStale = probeF2L('01a', ["(R U' R' U)(R U' R' U2)(R U' R')"],
                          { 'cube-pick:f2l:01a': '这条早就不在库里了' });
  ok('F2L 展开键：存档里已经不存在的写法不当默认（usable 挡掉）',
    !fStale.err && fStale.shown === "(R U' R' U)(R U' R' U2)(R U' R')", fStale.shown);
  const fRestore = probeF2L('07', [A07[0]], { 'cube-pick:f2l:07': A07[1] });
  ok('F2L 展开键：存档里那条还能显示 → 首屏就换成它',
    !fRestore.err && fRestore.shown === A07[1], fRestore.shown);

  // 三个页面同一套：展开态样式 + 开合过渡（不用 display:none，否则没法过渡）+ 打印不留空列
  ['pll.html', 'oh-pll.html', 'oll.html', 'oh-oll.html', 'oll2.html', 'pbl2.html'].forEach(p => {
    const s = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + '：展开键有单独的展开态样式（底色 + 主色）',
      /button\.pick\.on\{[^}]*background:var\(--chip\)/.test(s));
    ok(p + '：面板里「当前正在显示的那条」有专门的高亮样式（.cur）',
      /\.pickbox button\.cur\{[^}]*background:var\(--chip\)/.test(s));
    ok(p + '：面板用透明度/位移过渡开合（隐藏态不是 display:none）',
      /\.pickbox\{[^}]*opacity:0;visibility:hidden/.test(s) &&
      /\.pickbox\.on\{[^}]*opacity:1;visibility:visible/.test(s) &&
      /\.pickbox\{[^}]*transition:opacity/.test(s) &&
      !/\.pickbox\{[^}]*display:none/.test(s));
    ok(p + '：再点同一个键会收起（capture 阶段不先替它 close）',
      /if \(open && open\.pick === pick\) \{ close\(\); return; \}/.test(s) &&
      /closeIfOutside\(e\.target\)/.test(s));
    ok(p + '：展开面板的候选带序号（公式前面的 .idx，号来自库里的 case 内编号）',
      /<b class="idx">' \+ \(noOf\(row\.id, (it\.)?alg\)/.test(s) &&
      /function noOf\(id, alg\)/.test(s) && /\.pickbox \.idx\{/.test(s));
    ok(p + '：展开键左边不留表格框（td.f 的右边框去掉）',
      /td\.f\{border-right:0\}/.test(s));
    ok(p + '：打印时不印展开键那一列（单元格 + 列宽一起去掉）',
      /@media print\{\.pickbox,button\.pick,td\.pickCell\{display:none\}col\.pick\{width:0\}\}/.test(s));
  });
}

console.log('\n[19h2] 单手 OLL 页（oh-oll.html）：每个情况显示它的单手写法');
{
  const h = fs.readFileSync(path.join(ROOT, 'oh-oll.html'), 'utf8');
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'oll.json'), 'utf8'));
  // 和页面同一套规则：先把 OH 的挑出来（oholl-preferred 排前面），一条都没有才回退双手
  const pick = c => {
    let oh = [];
    (c.views || []).forEach(v => (v.algs || []).forEach(a => {
      if (a.uses.indexOf('OH') >= 0) {
        oh.push({ alg: a.alg, pref: (a.tags || []).indexOf('oholl-preferred') >= 0, moves: a.moves });
      }
    }));
    if (!oh.length) (c.views[0].algs || []).forEach(a => {
      if (a.uses.indexOf('2H') >= 0) oh.push({ alg: a.alg, pref: false, moves: a.moves });
    });
    oh.sort((x, y) => (y.pref ? 1 : 0) - (x.pref ? 1 : 0));
    return oh;
  };
  const rows = db.cases.map(c => [c.id, pick(c)]).filter(r => r[1].length);
  ok('页面读 olldata.js；页头写「单手 OLL」+ 英文全称（和单手 PLL 一样用 One-Handed）',
    /<script src="js\/olldata\.js"><\/script>/.test(h) &&
    /<h1>单手 OLL<\/h1>\s*<p>One-Handed · Orientation of the Last Layer<\/p>/.test(h) &&
    /<h1>单手 PLL<\/h1>\s*<p>One-Handed · Permutation of the Last Layer<\/p>/.test(
      fs.readFileSync(path.join(ROOT, 'oh-pll.html'), 'utf8')));
  ok('57 个情况每个都有一条单手写法（' + rows.length + ' 条）', rows.length === 57, String(rows.length));
  ok('一个情况里「首选」只有一条（oholl-preferred），面板/首屏默认就是它',
    db.cases.every(c => {
      const pref = (c.views || []).flatMap(v => v.algs || [])
        .filter(a => (a.tags || []).indexOf('oholl-preferred') >= 0);
      return pref.length === 1 && pick(c)[0].pref;
    }));
  ok('单手写法里没有带 M 层的（带 M 的按规矩只算双手）',
    rows.every(r => r[1].every(x => !(x.moves || []).some(t => /^M[2']?$/.test(t)))));
  ok('按库里的四个分组铺行（十字 / 单点 / 一字 / 拐角）',
    /OLL_DB\.groups/.test(h) && /byKey\[c\.group\]/.test(h));
  ok('存档键是 cube-pick:oh-oll:<编号>', /var KEY = 'cube-pick:oh-oll:'/.test(h));
  ok('行里的图带 data-oholl（展开键靠它找到这一行），图跟着写法所属的画面走',
    /data-zoom data-oholl="/.test(h) && /viewOfAlg\(/.test(h));
  ok('单手 OLL 页有左边那条「单手公式」目录（OH-OLL 高亮，另一条通 OH-PLL）',
    /<nav class="side" aria-label="单手公式目录">\s*<a class="on" href="oh-oll\.html">OH-OLL · 57 种<\/a>\s*<a href="oh-pll\.html">OH-PLL · 21 种<\/a>/.test(h) &&
    /nav\.side\{position:fixed;/.test(h) &&
    /@media \(max-width:1240px\)\{ nav\.side\{display:none\} \}/.test(h) &&
    /,nav\.side(?:,\.toolbtn)?\{display:none\}/.test(h));
  ok('「单手公式」这一组两页写同一个分组键 cube-last:oh-oll.html',
    /setItem\('cube-last:oh-oll\.html', 'oh-oll\.html'\)/.test(h) &&
    /setItem\('cube-last:oh-oll\.html', 'oh-pll\.html'\)/.test(
      fs.readFileSync(path.join(ROOT, 'oh-pll.html'), 'utf8')));
}

console.log('\n[19i] 首页卡片：顺序和导航条一致，单手那张也在');
{
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // 每张卡片取「主入口」：单个卡片是 <a class="card" href=…>，
  // 合并卡片（教程 / 三阶 / 二阶）是铺满的那条 <a class="stretch" href=…>
  const cards = [...idx.matchAll(/<a class="card" href="([^"]+)">|<a class="stretch" href="([^"]+)"/g)]
    .map(m => m[1] || m[2]);
  const nav = fs.readFileSync(path.join(ROOT, 'js', 'nav.js'), 'utf8');
  const table = nav.slice(nav.indexOf('var PAGES = ['), nav.indexOf('];', nav.indexOf('var PAGES = [')));
  // 每个入口的第一项（缩进正好 4 空格）才是「导航条上那一项」；
  // 「一项管几页」的那些成员写在续行里（缩进更多），不算独立入口
  const entries = [...table.matchAll(/^ {4}\['([\w.-]+\.html)'/gm)].map(m => m[1])
    .filter(f => f !== 'index.html');           // 首页自己不用卡片
  ok('首页卡片顺序和导航条一致（' + cards.length + ' 张：' + cards.join(' → ') + '）',
    JSON.stringify(cards) === JSON.stringify(entries),
    '卡片: ' + cards.join(',') + ' / 导航: ' + entries.join(','));
  ok('单手那张卡片在「三阶公式」后面、「二阶公式」前面',
    cards.indexOf('oh-oll.html') === cards.indexOf('f2l.html') + 1 &&
    cards.indexOf('oh-oll.html') === cards.indexOf('oll2.html') - 1);
  const card = (idx.match(/<div class="card">\s*<a class="stretch" href="oh-oll\.html"[\s\S]{0,400}?<\/div>/) || [''])[0];
  ok('单手卡片：图取自 img/oll/（跟着主题换昼夜），标题「单手 OLL · PLL」两个入口',
    /<img src="img\/oll\/oll-[\w]+-v\d-day-256x256\.png" alt="单手公式"/.test(card) &&
    /<h2>单手 <a href="oh-oll\.html">OLL<\/a> · <a href="oh-pll\.html">PLL<\/a><\/h2>/.test(card) &&
    /getElementById\('oHthumb'\)/.test(idx), card.replace(/\s+/g, ' ').slice(0, 100));
}

console.log('\n[19e] 公式页页头：缩写 + 英文全称');
{
  // 四页的 h1 底下都跟一行英文全称：不熟缩写的人看得懂，搜索也搜得到
  const EN = {
    'f2l.html': 'First Two Layers',
    'oll.html': 'Orientation of the Last Layer',
    'pll.html': 'Permutation of the Last Layer',
    'pbl2.html': 'Permutation of Both Layers',
    'oll2.html': 'Orientation of the Last Layer'
  };
  Object.keys(EN).forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const m = h.match(/<h1>([^<]*)<\/h1>\s*<p>([^<]*)<\/p>/);
    ok(p + ' 页头是「缩写 + ' + EN[p] + '」', !!m && m[2] === EN[p], m ? m[2] : '没找到');
  });
  // 原来 pbl2 底下那一长段说明（Adj/Diag、斜杠含义、两个视图、点公式复制…）整段删掉
  const pb = fs.readFileSync(path.join(ROOT, 'pbl2.html'), 'utf8');
  ok('pbl2 页那段长说明删干净了（.tip 连样式一起）',
    !/class="tip"/.test(pb) && !/相邻两个角换/.test(pb) && !/\.tip\b/.test(pb));
}

console.log('\n[19c] 教程页：公式都能送进计算器，进阶页的 OLL 步骤图跟昼夜换');
{
  ['tutorial-basic.html', 'tutorial-advanced.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const n = (h.match(/class="tocalc"/g) || []).length;
    const mv = (h.match(/class="mv"/g) || []).length;      // 记号表里那些"点记号跳计算器"
    const all = (h.match(/href="calc\.html#/g) || []).length;
    // 每条公式一个 ↗，链接里带 hash；计算器只认 calc.html#...
    // 初级教程的记号表也在跳计算器（class="mv"），所以两种加起来才是全部 calc 链接
    ok(p + ' 有 ' + n + ' 条公式带 ↗、' + mv + ' 个记号链接（共 ' + all + ' 条 calc.html#）',
      n >= 7 && all === n + mv);
    if (p === 'tutorial-advanced.html') {
      // 这一页还没写完：最前面先明说一句（内容是占位的），别让人当成定稿
      ok('进阶页最前面有一段「还没写完」的说明：内容暂时是 AI 草稿',
        /<main>\s*(?:<!--[\s\S]*?-->\s*)?<p class="wip"><b>这一页还没写完<\/b>[\s\S]{0,200}?AI 生成的草稿/.test(h) &&
        /\.wip\{[^}]*border-left:3px solid var\(--head-red\)/.test(h) &&
        /\.wip\{[^}]*background:none/.test(h.slice(h.indexOf('@media print'))),
        (h.match(/<p class="wip">[^<]*<b>[^<]*/) || [''])[0]);
      ok('说明里点名了「以哪几页为准」（初级教程 + F2L / OLL / PLL），而且都链过去',
        ['tutorial-basic.html', 'f2l.html', 'oll.html', 'pll.html']
          .every(x => new RegExp('<a href="' + x.replace('.', '\\.') + '">').test(
            (h.match(/<p class="wip">[\s\S]*?<\/p>/) || [''])[0])) &&
        /那几页是逐条核过的/.test(h));
    }
    if (p === 'tutorial-basic.html') {
      // 记号表：六个小写（宽转 r l u d f b）也在，而且都能点着跳计算器
      ok('初级记号表里有一个小写（宽转）记号 r，点一下能跳计算器；其余方向只是文字提一句',
        /<a class="mv" href="calc\.html#r"[^>]*title="在计算器里看 r"><code>r<\/code><\/a>/.test(h) &&
        /小写 = <b>宽转<\/b>/.test(h) && /r = R \+ M/.test(h) &&
        /<code>l<\/code> \/ <code>u<\/code>/.test(h) && /<code>Rw<\/code>/.test(h) &&
        // 别把六个都做成链接：表里只留 r 一个
        !/<a class="mv" href="calc\.html#u"/.test(h), String(mv) + ' 个记号链接');
    }
    ok(p + ' 点公式能复制（<code> + copied 态 + toast）',
      /document\.addEventListener\('click'/.test(h) && /closest\('code'\)/.test(h) &&
      /classList\.add\('copied'\)/.test(h) && /id="toast"/.test(h));
    ok(p + ' 打印时把按钮 / ↗ / toast 都藏起来', /@media print\{[\s\S]*?display:none/.test(h));
    ok(p + ' 打印时正文左右留白（不贴纸边）',
      /@media print\{[\s\S]*?main\{padding:0 12mm/.test(h));
    const pr = h.slice(h.indexOf('@media print'));
    ok(p + ' 打印美化：卡片改成细分隔线、步骤号画成描边小方块',
      /section\{margin:0;padding:4mm 0 0;border:0;border-top:1px solid #ccc/.test(pr) &&
      /\.n\{display:inline-grid;width:auto;min-width:6mm/.test(pr) &&
      /border:1px solid #666/.test(pr));
    ok(p + ' 打印美化：字号 / 图宽 / 公式框都按纸面调过',
      /body\{background:#fff;color:#000;font-size:10\.5pt/.test(pr) &&
      /\.one img\{width:46mm\}/.test(pr) &&
      /code\{font-size:11pt;font-weight:600/.test(pr));
    ok(p + ' 右边步骤目录落在「回到顶部」按钮上方',
      /\.steps\{right:18px;bottom:calc\(18px \+ 40px \+ 14px\)/.test(h));
    ok(p + ' 右边目录会标识当前看到哪一步（滚动高亮）',
      /querySelectorAll\('\.steps a\[href\^="#"\]'\)/.test(h) &&
      /classList\.toggle\('on', i === best\)/.test(h));
  });
  // 教程页的配图是编辑器导出的 256x258（透明底，和 f2l 那批同规格），
  // 逐张核对存在 + 尺寸，别出现「引了一张不在的图」
  const imgs = [];
  ['tutorial-basic.html', 'tutorial-advanced.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    (h.match(/src="tutorial\/[\w.-]+\.png"/g) || []).forEach(m => {
      const f = m.slice(5, -1);
      if (imgs.indexOf(f) < 0) imgs.push(f);
    });
  });
  const bad = imgs.filter(f => {
    const b = fs.readFileSync(path.join(ROOT, f));
    // 256x258 是编辑器导出的立体图；256x256 是顶层俯视图（步骤 4 / 7 那几张）
    return b.readUInt32BE(16) !== 256 || (b.readUInt32BE(20) !== 258 && b.readUInt32BE(20) !== 256);
  });
  ok('教程配图 ' + imgs.length + ' 张都在、都是 256 宽（立体图 258 高、俯视图 256）',
    imgs.length >= 5 && bad.length === 0, bad.slice(0, 3).join(' '));
}

console.log('\n[20] OLL 图的昼夜两版 + 图片尺寸/体积');
{
  // 白天紫顶、夜晚黄顶：两张图除了顶面颜色完全一样，页面按主题挑
  const oll = fs.readFileSync(path.join(ROOT, 'oll.html'), 'utf8');
  ok('OLL 页按主题挑图（白天 img-day / 夜晚 img-night，图从库里取）',
    /function IMG\(id, view\)/.test(oll) &&
    /var c = DB_CASE\[id\]/.test(oll) &&
    /document\.documentElement\.dataset\.theme === 'dark'/.test(oll) &&
    /v\['img-night'\] \|\| v\['img-day'\]/.test(oll) &&
    /v\['img-day'\] \|\| v\['img-night'\]/.test(oll));
  ok('切主题时把已经画出来的图也换掉（否则要刷新才对）',
    /function syncOllImages\(\)/.test(oll) &&
    /root\.dataset\.theme = t;\s*\n\s*syncOllImages\(\);/.test(oll) &&
    /data-oll="' \+ esc\(n\)/.test(oll));
  // 练习页 / 计算器选公式栏里的 OLL 缩略图也一样
  ['practice.html', 'calc.html'].forEach(p => {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    ok(p + ' 的 OLL 缩略图也分昼夜两版',
      /kind === 'oll' \? \(?document\.documentElement\.dataset\.theme === 'dark' \? '-night' : '-day'\)?/.test(h) ||
      /var to = document\.documentElement\.dataset\.theme === 'dark' \? '-night' : '-day'/.test(h));
  });
  ok('计算器的 OLL 缩略图跟着「这条写法属于哪个画面」走（写法可能不在 v0）',
    /var tv = row\[2\] == null \? 0 : row\[2\]/.test(fs.readFileSync(path.join(ROOT, 'calc.html'), 'utf8')));

  // 图片本身：尺寸、存在、体积
  const pngSize = f => {
    const b = fs.readFileSync(f);
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), bytes: b.length };
  };
  // PLL 的图现在在 img/pll 下（按角度命名），所以这一项单独给目录
  const dirs = { f2l: ['img/f2l', 256, 258], oll: ['img/oll', 256, 256], 'img/pll': ['img/pll', 256, 256] };
  let total = 0, big = [], wrong = [], missing = [];
  Object.keys(dirs).forEach(k => {
    const [dir, w, h] = dirs[k];
    fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.png')).forEach(f => {
      const p = path.join(ROOT, dir, f);
      const d = pngSize(p);
      total += d.bytes;
      if (d.w !== w || d.h !== h) wrong.push(f + '=' + d.w + 'x' + d.h);
      if (d.bytes > 40 * 1024) big.push(f + '=' + Math.round(d.bytes / 1024) + 'KB');
    });
  });
  ok('三种图的尺寸分别是 256x258 / 256x256 / 256x256', wrong.length === 0, wrong.slice(0, 3).join(' '));
  ok('单张都不超过 40KB（64 色之后是 2~5KB）', big.length === 0, big.slice(0, 3).join(' '));
  ok('全部图片合计 < 3.5MB（256 的 64 色调色板 PNG）',
    total < 3.5 * 1024 * 1024, (total / 1048576).toFixed(2) + 'MB');
  // OLL 两版成对存在
  const ollImgs = fs.readdirSync(path.join(ROOT, 'img/oll')).filter(f => f.endsWith('.png'));
  const days = ollImgs.filter(f => f.includes('-day-')).length;
  const nights = ollImgs.filter(f => f.includes('-night-')).length;
  // OLL 每个情况按 U^k 有多个去重画面（对称的少于 4 个），每个画面昼夜两版
  const ollDb = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/oll.json'), 'utf8'));
  const nViews = ollDb.cases.reduce((n, c) => n + c.views.length, 0);
  ok('OLL 每个画面昼夜两版（' + nViews + ' 画面 × 2 = ' + ollImgs.length + ' 张）',
    days === nViews && nights === nViews && ollImgs.length === nViews * 2,
    days + ' / ' + nights);
  // 引用的文件都得在
  const refs = new Set();
  ['f2l.html', 'oll.html', 'oh-oll.html', 'oll2.html', 'pll.html', 'oh-pll.html', 'practice.html',
   'calc.html', 'index.html']
    .forEach(p => {
      const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
      // 目录名要整段匹配：写成 (?:f2l|oll|pll)\/ 的话，「oll2/…」会被当成「oll/…」，
      // 「img/pll/…」也会被剥掉 img/ 前缀去 pll/ 下找（那个目录已经没了）。
      (h.match(/(?:^|[^\w])((?:img\/(?:pll|oll2|oll|pbl2|f2l)|2x2oll|2x2pbl|ohpll|f2l|oll|pll)\/[\w.-]+\.png)/g) || [])
        .forEach(m => refs.add(m.replace(/^[^\w]/, '')));
    });
  const miss = [...refs].filter(r => !fs.existsSync(path.join(ROOT, r)));
  ok('页面里引用的图片都存在（' + refs.size + ' 个引用）', miss.length === 0, miss.slice(0, 3).join(' '));
}


console.log('\n[21] PLL 页的「显示颜色」开关 + 无色图');
{
  const pll = fs.readFileSync(path.join(ROOT, 'pll.html'), 'utf8');
  // 样式是「滑动开关」：一条轨道 + 一个滑块（和主题开关同一套语言）。
  // 真勾选框藏起来（视觉由 .on 决定），但 Tab 还能走到、:focus-within 给焦点圈。
  ok('PLL 页标题下有个「显示颜色」开关（滑动开关：轨道 + 滑块）',
    /<label class="tg" id="tg-colors"[\s\S]{0,160}?<input type="checkbox" id="showcolors" checked> 显示颜色/.test(pll) &&
    /\.tg::before\{content:'';position:absolute;left:0;top:50%;width:36px;height:20px/.test(pll) &&
    /\.tg\.on::after\{transform:translateX\(16px\)/.test(pll) &&
    /\.tg input\{position:absolute;width:1px;height:1px;margin:0;opacity:0/.test(pll) &&
    /\.tg:focus-within::before\{outline:2px solid var\(--accent-text\)/.test(pll));
  // 图现在从数据库取（img/pll/…-v<角度>）：无色版取库里那两个字段
  ok('关掉时用另一套图（库里带 -nc- 的那两版）',
    /function viewImg\(id, view\)/.test(pll) &&
    /if \(showColors\) return v\.img;/.test(pll) &&
    /v\['img-nc-night'\] : v\['img-nc-day'\]/.test(pll));
  // 显示颜色时只有一张图（箭头压在黄色顶面上，白天夜里都看得清）——
  // 曾经多生成过一套彩色夜晚版，是多余的，磁盘上不该再有
  ok('彩色版不分昼夜：磁盘上没有「彩色夜晚」图',
    !/var nc = showColors \? \(/.test(pll) &&
    fs.readdirSync(path.join(ROOT, 'img', 'pll'))
      .filter(f => /-night-256x256\.png$/.test(f) && !/-nc-night-/.test(f)).length === 0);
  ok('开关摆在右上角，主题按钮下面（和计算器的相机同一竖列）',
    /\.opts\{position:absolute;right:16px;top:56px;display:flex;justify-content:flex-end\}/.test(pll) &&
    /\.themebtn\{position:absolute;right:16px;top:16px\}/.test(pll) &&
    /<div class="opts">[\s\S]{0,220}?id="showcolors"/.test(pll));
  // 持久化：先读存档决定首次渲染，切开关再写回去
  ok('开关状态存在 pll-color-v1，先读存档再渲染',
    /var COLOR_KEY = 'pll-color-v1';/.test(pll) &&
    /showColors = localStorage\.getItem\(COLOR_KEY\) !== '0';/.test(pll) &&
    pll.indexOf('localStorage.getItem(COLOR_KEY)') < pll.indexOf('document.getElementById(\'app\')')) ;
  ok('切开关会写回存档',
    /localStorage\.setItem\(COLOR_KEY, showColors \? '1' : '0'\)/.test(pll));
  ok('切开关不重画整张表，只换图片地址',
    /function syncPllImages\(\)[\s\S]{0,200}?querySelectorAll\('#app img\[data-pll\]'\)/.test(pll) &&
    /data-pll="' \+ esc\(n\)/.test(pll));
  // 无色图分昼夜，所以切主题也得把已画出来的图换掉
  ok('切主题时无色图跟着换成夜晚黄箭头那版',
    /function applyTheme\(t\)[\s\S]{0,160}?__pllRefreshImgs\(\)/.test(pll) &&
    /root\.dataset\.theme = t;[\s\S]{0,60}?__pllRefreshImgs\(\)/.test(pll));
  ok('打印时不印这个开关（连页面目录一起藏）',
    /@media print\{[\s\S]*?\.themebtn,\.printbtn,\.opts,nav\.side(?:,\.toolbtn)?\{display:none\}/.test(pll));

  // 图片：每个 PLL 编号三张 —— 彩色 / 无色白天（紫箭头）/ 无色夜晚（黄箭头）。
  // 编号和角度都从库里取（页面里的 SECTIONS 字面量已经没有了）。
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pll.json'), 'utf8'));
  const uniq = db.cases.map(c => c.id);
  const nView = db.cases.reduce((n, c) => n + c.views.length, 0);
  const miss = [], wrong = [];
  uniq.forEach(id => {
    ['', '-nc', '-nc-night'].forEach(v => {
      const f = 'img/pll/pll-' + id + '-v0' + v + '-256x256.png';
      if (!fs.existsSync(path.join(ROOT, f))) miss.push(f);
      else {
        const b = fs.readFileSync(path.join(ROOT, f));
        if (b.readUInt32BE(16) !== 256 || b.readUInt32BE(20) !== 256) {
          wrong.push(f + '=' + b.readUInt32BE(16) + 'x' + b.readUInt32BE(20));
        }
      }
    });
  });
  ok('每个 PLL 编号都有三版：彩色 + 无色白天 + 无色夜晚（' + uniq.length + ' × 3 张）',
    uniq.length >= 21 && miss.length === 0, miss.slice(0, 3).join(' '));
  ok('三版尺寸都是 256x256', wrong.length === 0, wrong.slice(0, 3).join(' '));
  // 磁盘上不能有多余的图（旧版 512 的、彩色夜晚的），数量正好 角度数 × 3
  const allPng = fs.readdirSync(path.join(ROOT, 'img', 'pll')).filter(f => f.endsWith('.png'));
  ok('img/pll 下正好 ' + (nView * 3) + ' 张图（' + nView + ' 个角度 × 3 版），没有多余旧图',
    allPng.length === nView * 3 && nView >= 63 &&
    allPng.every(f => /^pll-[A-Za-z]{1,2}-v\d(-nc(-night)?)?-256x256\.png$/.test(f)),
    allPng.length + ' 张');
  // 无色版应当明显更"轻"：颜色去掉后不透明像素少得多
  const ncDir = allPng.filter(f => f.includes('-nc'));
  ok('磁盘上有 ' + (nView * 2) + ' 张无色图（白天+夜晚），单张都很小（约 5KB）',
    ncDir.length === nView * 2 &&
    ncDir.every(f => fs.statSync(path.join(ROOT, 'img', 'pll', f)).size < 12 * 1024),
    ncDir.length + ' 张');
  // 每个编号基准角度（v0）的夜晚版必须是黄箭头版 —— 和白天那版像素不同，否则等于没换
  const same = uniq.filter(id => {
    const a = fs.readFileSync(path.join(ROOT, 'img/pll/pll-' + id + '-v0-nc-256x256.png'));
    const b = fs.readFileSync(path.join(ROOT, 'img/pll/pll-' + id + '-v0-nc-night-256x256.png'));
    return a.equals(b);
  });
  ok('无色夜晚版和白天版确实不一样（换了箭头颜色）', same.length === 0, same.slice(0, 3).join(' '));

  /* 光看文件名和体积看不出"图根本没换色"——Aa 的夜晚图就曾经是白天那张，
     页面照常打开、测试全绿。所以这里自己把 PNG 解开，核箭头到底是什么颜色。
     这批图都是 8 位调色板 PNG（216 张全是），解码只要几十行。 */
  const zlib = require('zlib');
  const decodePng = file => {
    const b = fs.readFileSync(path.join(ROOT, file));
    let p = 8, w = 0, h = 0, bd = 0, ct = 0, plte = null, trns = null;
    const idat = [];
    while (p + 8 <= b.length) {
      const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8);
      const data = b.slice(p + 8, p + 8 + len);
      if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
      else if (type === 'PLTE') plte = data;
      else if (type === 'tRNS') trns = data;
      else if (type === 'IDAT') idat.push(data);
      p += 12 + len;
    }
    if (bd !== 8 || ct !== 3) throw new Error(file + ': 不是 8 位调色板 PNG (' + bd + '/' + ct + ')');
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const idx = Buffer.alloc(w * h);
    for (let y = 0; y < h; y++) {
      const ft = raw[y * (w + 1)];
      const line = raw.slice(y * (w + 1) + 1, y * (w + 1) + 1 + w);
      for (let x = 0; x < w; x++) {
        const a = x ? idx[y * w + x - 1] : 0;
        const bb = y ? idx[(y - 1) * w + x] : 0;
        const c = (x && y) ? idx[(y - 1) * w + x - 1] : 0;
        let v = line[x];
        if (ft === 1) v += a;
        else if (ft === 2) v += bb;
        else if (ft === 3) v += (a + bb) >> 1;
        else if (ft === 4) {
          const q = a + bb - c, pa = Math.abs(q - a), pb = Math.abs(q - bb), pc = Math.abs(q - c);
          v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? bb : c);
        } else if (ft !== 0) throw new Error(file + ': 未知行过滤器 ' + ft);
        idx[y * w + x] = v & 255;
      }
    }
    // 按 RGBA 数颜色；alpha 取 tRNS（没写就是全不透明）
    const counts = new Map();
    for (let i = 0; i < idx.length; i++) {
      const k = idx[i], o = k * 3;
      const alpha = trns && k < trns.length ? trns[k] : 255;
      const key = plte[o] + ',' + plte[o + 1] + ',' + plte[o + 2] + ',' + alpha;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return { w, h, counts };
  };
  const hueSat = (r, g, b) => {
    const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, d = mx - mn;
    let h = 0;
    if (d) {
      if (mx === r / 255) h = ((g - b) / 255 / d) % 6;
      else if (mx === g / 255) h = (b - r) / 255 / d + 2;
      else h = (r - g) / 255 / d + 4;
      if (h < 0) h += 6;
      h *= 60;
    }
    return [h, mx ? d / mx : 0];
  };
  // 无色图的箭头紫（hue 235~290, S>0.2）/ 夜晚换成的 #FFE600 / 彩色版顶面的黄
  const tally = file => {
    const { counts } = decodePng(file);
    let purple = 0, night = 0, top = 0;
    counts.forEach((n, k) => {
      const v = k.split(',').map(Number);
      if (v[3] <= 128) return;
      const hs = hueSat(v[0], v[1], v[2]);
      if (hs[0] >= 235 && hs[0] <= 290 && hs[1] > 0.2) purple += n;
      // 夜晚箭头是 #FFE600，但量化成 256 色调色板后会差几级（E/F/H 落到 255,231,0），
      // 所以按色相判黄 —— 和紫色的判法对称，抗锯齿像素也能一一对上。
      if (hs[0] >= 40 && hs[0] <= 70 && hs[1] > 0.2) night += n;
      if (v[0] >= 250 && v[1] >= 225 && v[1] <= 235 && v[2] <= 10) top += n;
    });
    return { purple, night, top };
  };
  const purpleBad = [], nightBad = [], pairBad = [], topBad = [];
  uniq.forEach(id => {
    const day = tally('img/pll/pll-' + id + '-v0-nc-256x256.png');
    const nit = tally('img/pll/pll-' + id + '-v0-nc-night-256x256.png');
    const col = tally('img/pll/pll-' + id + '-v0-256x256.png');
    if (day.purple < 500 || day.night) purpleBad.push(id + ':' + day.purple + '紫/' + day.night + '黄');
    if (nit.night < 500 || nit.purple) nightBad.push(id + ':' + nit.night + '黄/' + nit.purple + '紫');
    if (day.purple !== nit.night) pairBad.push(id + ':' + day.purple + '≠' + nit.night);
    if (col.top < 5000) topBad.push(id + ':' + col.top);
  });
  ok('无色白天版：箭头确实还是紫的、一点黄都没有（' + uniq.length + ' 张）',
    purpleBad.length === 0, purpleBad.slice(0, 3).join(' '));
  ok('无色夜晚版：箭头确实是黄的（#FFE600 那一档）、一个紫像素都没有',
    nightBad.length === 0, nightBad.slice(0, 3).join(' '));
  ok('夜晚版就是把白天版那些紫像素原样染黄（逐张计数一一对应）',
    pairBad.length === 0, pairBad.slice(0, 3).join(' '));
  ok('彩色版顶面还是黄的（没被无色那套规则误伤）',
    topBad.length === 0, topBad.slice(0, 3).join(' '));
}

console.log('\n[22] 计算器舞台：四周的按钮互不重叠');
{
  /* 舞台四周一共摆着 10 块浮动的东西：左上角「三阶 / 二阶 / 四阶」那一摞模式栏、
     主题开关、拍照，四个方向的整体旋转折角（n/s/w/e），两个滚转（z1/z2），
     右下角还有一摞放大缩小。它们全是 position:absolute，谁跟谁叠上只能靠算 ——
     拍照键最早摆在左上角，正好压在「整体逆时针滚 z'」那个 56px 的大按键上；
     模式栏占据左上角之后，z1/z2 又往右让了一段，这里一并核。 */
  const calc = fs.readFileSync(path.join(ROOT, 'calc.html'), 'utf8');
  // 抠出 <style>，再把 @media 整块和注释删掉（打印那块的 .snap{display:none}
  // 会盖住真正的定位规则，注释里也可能有花括号）
  const strip = t => {
    let out = '', i = 0;
    while (i < t.length) {
      if (t.startsWith('@media', i)) {
        let j = t.indexOf('{', i), depth = 0;
        if (j < 0) break;
        for (; j < t.length; j++) {
          if (t[j] === '{') depth++;
          else if (t[j] === '}' && --depth === 0) { j++; break; }
        }
        i = j;
      } else if (t[i] === '/' && t[i + 1] === '*') {
        const j = t.indexOf('*/', i + 2);
        i = j < 0 ? t.length : j + 2;
      } else out += t[i++];
    }
    return out;
  };
  const css = strip(calc.slice(calc.indexOf('<style>'), calc.indexOf('</style>')));
  // 同一个选择器可能出现在好几条规则里（.snap 的定位和宽高就分在两处），
  // 按 CSS 的规矩合并：后面的同名属性盖前面。取值时也要取最后一条。
  const rules = {};
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    m[1].split(',').forEach(sel => {
      const k = sel.trim();
      rules[k] = rules[k] === undefined ? m[2] : rules[k] + ';' + m[2];
    });
  }
  const decl = (sel, prop) => {
    if (rules[sel] === undefined) throw new Error('calc.html 里找不到规则 ' + sel);
    const all = [...rules[sel].matchAll(new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+)', 'g'))];
    return all.length ? all[all.length - 1][1].trim() : null;
  };
  const val = (sel, prop, base) => {
    const v = decl(sel, prop);
    if (v === null) return null;
    return /%$/.test(v) ? parseFloat(v) / 100 * base : parseFloat(v);
  };
  const size = sel => {
    const w = parseFloat(decl(sel, 'width')), h = parseFloat(decl(sel, 'height'));
    if (!(w > 0) || !(h > 0)) throw new Error(sel + ' 的宽高没读出来');
    return [w, h];
  };
  const rect = (sel, w, h, W, H) => {
    const tf = decl(sel, 'transform') || '';
    const l = val(sel, 'left', W), r = val(sel, 'right', W);
    const t = val(sel, 'top', H), b = val(sel, 'bottom', H);
    let x = l !== null ? l : W - r - w;
    let y = t !== null ? t : H - b - h;
    if (/translateX\(-50%\)/.test(tf)) x -= w / 2;
    if (/translateY\(-50%\)/.test(tf)) y -= h / 2;
    return { sel, x, y, w, h };
  };
  // 主题开关的宽高在 nav.css（body .themebtn），页面里只有位置
  const [obW, obH] = size('.orbit button');
  const zoomBtns = ((calc.match(/<div class="zoom">([\s\S]*?)<\/div>/) || [])[1] || '')
    .match(/<button/g) || [];
  const [zbW, zbH] = size('.zoom button');
  const items = [
    // 左上角那一摞（和编辑器同一个 modebar）：min-width 88 + 内边距 6 + 边框 2，
    // 高 = 三个按钮（4+4 内边距 + 11.5px 字 × 1.55 行高 ≈ 18）+ 两个 2px 间距
    // + 内边距 6 + 边框 2 = 90，这里按 92 算（宁可算大一点）
    ['.modebar', 88, 92],
    ['.themebtn', 56, 28],                       // nav.css: body .themebtn
    ['.snap', ...size('.snap')],
    ['.orbit .n', obW, obH], ['.orbit .s', obW, obH],
    ['.orbit .w', obW, obH], ['.orbit .e', obW, obH],
    ['.orbit .z1', obW, obH], ['.orbit .z2', obW, obH],
    // 右下角那摞是 grid：n 个按钮 + (n-1) 个 gap
    ['.zoom', zbW, zoomBtns.length * zbH + Math.max(0, zoomBtns.length - 1) *
      parseFloat(decl('.zoom', 'gap'))],
  ];
  ok('舞台上的浮动按钮都认得出来（模式栏/主题开关/拍照/6 个整体旋转/缩放那摞）',
    items.length === 10 && zoomBtns.length === 3, items.length + ' 个, 缩放 ' + zoomBtns.length + ' 个');
  const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w &&
                           a.y < b.y + b.h && b.y < a.y + a.h;
  // 舞台宽高：页面右侧固定 322px 面板，所以常见桌面是「窗口宽-322」；
  // 窄屏（<760px）会变成上下排，舞台占满宽度。
  // 注：舞台高低于 ~350px 时，左右两个折角（.w/.e，竖着居中）和右下角那摞
  // 缩放本身就会挤上（老问题，和拍照键无关），所以这里只核 ≥360px 的尺寸；
  // 拍照键单独再核一遍小尺寸（它在右上角，不会碰到中间那两个）。
  const sizes = [[1200, 800], [900, 640], [760, 560], [640, 420], [560, 360]];
  const bad = [], snapBad = [];
  const all = sizes.concat([[438, 360], [380, 320], [520, 260], [360, 240]]);
  all.forEach(([W, H]) => {
    const rs = items.map(([sel, w, h]) => rect(sel, w, h, W, H));
    for (let i = 0; i < rs.length; i++) {
      for (let j = i + 1; j < rs.length; j++) {
        if (!overlap(rs[i], rs[j])) continue;
        const pair = [rs[i].sel, rs[j].sel].sort().join('×');
        if (sizes.some(([w2, h2]) => w2 === W && h2 === H)) bad.push(W + '×' + H + ' ' + pair);
        if (pair.indexOf('.snap') >= 0) snapBad.push(W + '×' + H + ' ' + pair);
      }
    }
  });
  // 模式栏在左上角、z1/z2 往右让开了：这三块彼此不能叠，也不能压到中间的折角
  ok('模式栏不和「整体滚 z / z\'」叠（两个滚转键已经往右挪）',
    /<div class="modebar" id="modebar">/.test(calc) &&
    /\.orbit \.z1\{left:118px;top:2px\}/.test(calc) &&
    /\.orbit \.z2\{left:174px;top:2px\}/.test(calc));
  ok('常见舞台尺寸（' + sizes.length + ' 种）下四周按钮两两不叠',
    bad.length === 0, bad.slice(0, 3).join(' | '));
  // 这次报的就是这个：拍照键压在「整体逆时针滚 z'」上
  ok('拍照键在任何尺寸下都不和别的按钮叠（连更小的舞台也算）',
    snapBad.length === 0, snapBad.slice(0, 3).join(' | '));
  // 这条是这次的 bug 本身：拍照键摆在左上角 = 压在 z1（整体逆时针滚）上
  ok('拍照键在右上角和主题开关并排（不再压着「整体逆时针滚 z\'」）',
    /\.snap\{position:absolute;right:80px;top:14px/.test(calc) &&
    !/\.snap\{[^}]*left:14px/.test(calc));
  ok('拍照键打印时不印', /@media print\{ \.themebtn,\.panel,\.orbit,\.zoom,\.snap\{display:none\} \}/.test(calc));
}

console.log('\n[23] 五个库里都不许有重复写法（同一情况里两条一模一样的公式）');
{
  /* 用户报过 OLL 55 的 1 / 2 号重复 —— 一查全库还有 13 组：同一条公式被两种记号各写了一遍
     （`R'2` vs `R2`、带括号 / 不带括号）。按项目自己的等价规则（`R'2` ≡ `R2`）它们就是同一条，
     已经全部合并；这条测试钉住别再冒出来。 */
  const canon = a => String(a).replace(/[()\s]/g, '').replace(/([URFDLBMSurflbdxyzE])'2/g, '$1' + '2');
  let dup = 0;
  [['data/pll.json', 'id'], ['data/oll.json', 'id'], ['data/oll2.json', 'id'],
   ['data/pbl2.json', 'id'], ['data/f2l.json', 'id']].forEach(([file, key]) => {
    const db = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
    db.cases.forEach(c => {
      const views = c.views || [c];
      const seen = {};
      const bad = [];
      views.forEach(v => (v.algs || []).forEach(a => {
        const k = canon(a.alg);
        if (seen[k]) bad.push([seen[k], a.alg]); else seen[k] = a.alg;
      }));
      if (bad.length) {
        dup += bad.length;
        ok(file + ' ' + c[key] + '：没有两条写法是同一条公式', false, JSON.stringify(bad));
      }
    });
  });
  ok('五个库里都没有重复写法（同一情况里没有两条一样的公式）', dup === 0, dup + ' 组重复');
}

console.log('\n[21b] 打印时页头那些开关（.opts 里的「显示颜色」）不印');
{
  /* 用户报过：OH-PLL 打印出来多了一个「显示颜色」开关。
     开关在 <div class="opts"> 里，PLL 页的打印规则把 .opts 一起隐藏了，抄到 OH-PLL 时漏了。 */
  let n = 0;
  ['pll.html', 'oh-pll.html', 'oll.html', 'oh-oll.html', 'oll2.html', 'pbl2.html', 'f2l.html',
   'calc.html', 'timer.html', 'practice.html', 'editor.html'].forEach(f => {
    const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (!/class="opts"/.test(h)) return;
    n++;
    // 隐藏那一条和 .opts 写在同一行上，直接按行找（页面里 @media print 有好几处，整段正则容易抓错）
    const hide = h.split('\n').filter(l => /\.opts/.test(l) && /display:none/.test(l))[0] || '';
    ok(f + '：有 .opts 开关，打印规则里就要把它隐藏掉（别让开关印在纸上）',
      !!hide, hide || '（没有一行同时含 .opts 和 display:none）');
    /* ⚠ 光隐藏还不够：**必须写在 .opts 屏幕样式（display:flex）之后**。
       同权重下后来的那条赢 —— OH-PLL 原来把隐藏写在前面，纸上照样有「显示颜色」（用户报过两次）。 */
    const screenAt = h.search(/\.opts\{[^}]*display:flex/);
    const printAt = Math.max(h.lastIndexOf('.opts{display:none}'),
                             h.search(/\.opts[^\n]*\{display:none\}/));
    ok(f + '：隐藏 .opts 的打印规则要写在 .opts 屏幕样式之后（同权重，写在前面会被盖掉）',
      screenAt >= 0 && printAt > screenAt,
      '屏幕 .opts 在 ' + screenAt + '，打印隐藏那条在 ' + printAt);
  });
  ok('至少有一个页面用 .opts（这条测试有东西可测）', n >= 1, String(n));
}

console.log('\n[22] 按钮图标一律内联 SVG（手机不会把字符渲染成 emoji / 另一套字形）');
{
  /* 踩过的坑：计算器的正向 / 反向 / 步骤栏四个键原本是 ↻ ↺ ⏮ ◀ ▶ ⏭ 这几个**字符**，
     手机浏览器的字体把它们换成了彩色 emoji / 另一套字形 —— 同一个键在手机和电脑上长得不一样。
     现在形状都是内联 SVG（fill:none + stroke:currentColor），这条测试钉住不许回退。 */
  const GLYPH = /[\u25C0\u25B6\u23EE\u23ED\u21BA\u21BB\u23EA\u23E9\u23F4\u23F5\u2B05\u2B06\u2B07\u27A1]/;
  const calc = fs.readFileSync(path.join(ROOT, 'calc.html'), 'utf8');
  const btn = id => (calc.match(new RegExp('<button[^>]*id="' + id + '"[\\s\\S]*?</button>')) || [''])[0];
  ['fwd','rev','first','prev','next','last'].forEach(id => {
    const tag = btn(id);
    ok(id + ' 这个键里画的是内联 SVG、没有拿字符当图标',
      /<svg/.test(tag) && !GLYPH.test(tag), tag.replace(/\s+/g, ' ').slice(0, 90));
  });
  ok('按钮关掉系统外观、去掉点按高亮（iOS 的原生圆角 / 蓝底 / 灰蓝闪一下都没了）',
    /button\{-webkit-appearance:none;appearance:none\}/.test(calc) &&
    /-webkit-tap-highlight-color:transparent/.test(calc));
  ok('这两组图标的尺寸写在 CSS 里（.run button i svg / .ctrl button.step svg）',
    /\.run button i svg\{[^}]*stroke:currentColor/.test(calc) &&
    /\.ctrl button\.step svg\{[^}]*stroke:currentColor/.test(calc));
  // 全仓普查：按钮里不许出现这类字符（emoji 化的高危区）
  ['index.html','f2l.html','oll.html','pll.html','oh-pll.html','oh-oll.html','oll2.html','pbl2.html',
   'timer.html','practice.html','editor.html','calc.html'].forEach(f => {
    const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const bad = [...h.matchAll(/<button[^>]*>([^<]*)</g)].map(m => m[1].trim()).filter(t => GLYPH.test(t));
    ok(f + '：按钮里没有 ◀ ▶ ⏮ ⏭ ↺ ↻ 这类字符图标', bad.length === 0, bad.join(' | '));
  });
}

console.log('\n[25] js/algpicks.js：CSV / 导入匹配 / 恢复默认 / 弹窗（公式页那三个图标键的底座）');
{
  const vm = require('vm');
  const store = {};
  const fake = { get length() { return Object.keys(store).length; },
                 key: i => Object.keys(store)[i],
                 getItem: k => (k in store ? store[k] : null),
                 setItem: (k, v) => { store[k] = String(v); },
                 removeItem: k => { delete store[k]; } };
  const ctx = { console, localStorage: fake, window: { localStorage: fake },
                document: { querySelectorAll: () => [] } };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'algpicks.js'), 'utf8'), ctx);
  const A = ctx.AlgPicks;

  ok('CSV 表头是「页,情况,公式,view」',
    A.csv('oll', []).trim() === '页,情况,公式,view', A.csv('oll', []).trim());
  ok('CSV 导出带引号的公式也能原样解析回来',
    (() => {
      const csv = A.csv('oll', [{ id: '15', alg: 'R U2 R\' (U R)', view: 2 }]);
      const rows = A.readCsv(csv);
      return rows.length === 1 && rows[0].id === '15' && rows[0].alg === "R U2 R' (U R)" && rows[0].view === 2;
    })());
  ok('没有表头时按「第 1 列 = 情况、最后 1 列 = 公式」兜底（两列的手工表也能导）',
    (() => { const r = A.readCsv('15,R U\n20,F R F\'\n');
             return r.length === 2 && r[0].id === '15' && r[0].alg === 'R U' &&
                    r[1].id === '20' && r[1].alg === "F R F'"; })());

  // 导入：对得上库里的 → 选中；对不上 → 自定义（带当时那个 view）
  const picked = {}, added = [];
  const res = A.importCsv('页,情况,公式,view\noll,15,R U,2\noll,15,F R F\',3\noll,99,X,0\n', {
    page: 'oll',
    ids: id => id !== '99',
    find: (id, alg) => (id === '15' && alg === 'R U' ? 2 : null)
  });
  ok('导入：对上库里的当「选中它」、对不上的当自定义、找不到情况的跳过',
    res.got === 2 && res.picked === 1 && res.custom === 1 && res.skipped.length === 1 &&
    /* 两条都写进了 cube-pick，所以最后一行（自定义那条）就是这一行显示的那条 */
    A.readPick('oll', '15') === "F R F'" && A.customs('oll', '15').length === 1 &&
    A.customs('oll', '15')[0].view === 3,
    JSON.stringify(res));

  /* 用户报过：已经有自定义公式时，再导入一条新的自定义导不进去 /
     已有的那条自定义在面板里看不见（面板里「候选里出现过就不摆」那道挡把用户自己的东西挡掉了）。 */
  ok('已有自定义时再导入一条新的：两条都在，选中换成新的那条',
    (() => {
      A.addCustom('oll', '21', '第一条自定义', 1);
      A.writePick('oll', '21', '第一条自定义');
      const r = A.importCsv('页,情况,公式,view\noll,21,第二条自定义,2',
                            { page: 'oll', ids: id => id === '21', find: () => null });
      const cs = A.customs('oll', '21');
      return r.custom === 1 && cs.length === 2 &&
             cs[0].alg === '第一条自定义' && cs[1].alg === '第二条自定义' &&
             A.readPick('oll', '21') === '第二条自定义';
    })(),
    JSON.stringify(A.customs('oll', '21')));

  /* 用户报过「导入 CSV 没生效」：Excel 存的分号 / 从表格粘的制表符、没表头的四列、
     别的页导出来的文件，原来都会一条不剩地丢掉（而且提示跟着刷新一起没了，看着就像没反应）。 */
  ok('分隔符不写死逗号：分号 / 制表符的 CSV 也认',
    (() => {
      const a = A.readCsv('页;情况;公式;view\noll;15;R U;2');
      const b = A.readCsv('页\t情况\t公式\tview\noll\t15\tR U\t2');
      return a.length === 1 && a[0].alg === 'R U' && a[0].view === 2 &&
             b.length === 1 && b[0].id === '15' && b[0].alg === 'R U';
    })());
  ok('没表头时按列数猜：四列当「页,情况,公式,view」，两列当「情况,公式」',
    (() => {
      const a = A.readCsv('oll,15,R U,2'), b = A.readCsv('15,R U');
      return a[0].id === '15' && a[0].alg === 'R U' && a[0].view === 2 &&
             b[0].id === '15' && b[0].alg === 'R U';
    })());
  ok('导入：别的页的文件只要这一页有同一个情况也收（并计数），一条都没匹配上时给出提示',
    (() => {
      A.writePick('oll', '15', '');
      const r = A.importCsv('页,情况,公式,view\noh-oll,15,R U,0\nzz,99,啥,0',
                            { page: 'oll', ids: id => id === '15', find: () => 0 });
      const none = A.importCsv('页,情况,公式\nzz,99,啥', { page: 'oll', ids: () => false, find: () => null });
      return r.got === 1 && r.other === 1 && r.skipped.length === 1 && r.rows === 2 &&
             A.readPick('oll', '15') === 'R U' &&          // 对不上库里的：当自定义，也要显示出来
             none.got === 0 && none.rows === 1;
    })());

  /* 库里**有**这条 → 按以前那样选中它（用库里那条的**原文**与画面），**绝不新增自定义** ——
     哪怕 CSV 里的 view 和库里那条不一样、哪怕用户自己敲的那串没空格。
     这一段自带一份假 localStorage / 模块实例。 */
  {
    const st5 = {};
    const fake5 = { get length() { return Object.keys(st5).length; },
                    key: i => Object.keys(st5)[i],
                    getItem: k => (k in st5 ? st5[k] : null),
                    setItem: (k, v) => { st5[k] = String(v); },
                    removeItem: k => { delete st5[k]; } };
    const ctx5 = { console, localStorage: fake5, window: { localStorage: fake5 },
                   document: { querySelectorAll: () => [] } };
    ctx5.globalThis = ctx5;
    vm.createContext(ctx5);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'algpicks.js'), 'utf8'), ctx5);
    const A3 = ctx5.AlgPicks;
    const DB3 = "x L U' L D2 L' U L D2 L2";
    const api3 = { page: 'pll', ids: id => id === 'Ab',
                   find: (id, alg) => (alg === "xLU'LD2L'ULD2L2" ? { view: 0, alg: DB3 } : null) };
    const r5 = A3.importCsv('页,情况,公式,view\npll,Ab,xLU\'LD2L\'ULD2L2,1', api3);
    ok('匹配上库里：用库里那条的原文（带空格）与库里的画面，且**不新增自定义**',
      r5.got === 1 && r5.picked === 1 && r5.custom === 0 &&
      A3.readPick('pll', 'Ab') === DB3 && A3.customs('pll', 'Ab').length === 0,
      JSON.stringify({ r5, pick: A3.readPick('pll', 'Ab'), cust: A3.customs('pll', 'Ab') }));
  }

  ok('自定义公式记着它自己挑的画面（库里的写法反查不到时会用到）',
    A.customView('oll', '15', "FRF'") === 3 && A.customView('oll', '15', 'R U') === null);
  ok('同一条再加一次不重复，只更新 view',
    (() => { A.addCustom('oll', '15', "F R F'", 1); return A.customs('oll', '15').length === 1 &&
             A.customView('oll', '15', "FRF'") === 1; })());

  /* 恢复默认：只清这一页**选中的写法**，自己加的自定义公式留着（用户要求）；别的页更不动。
     （用户还报过「点了没用」—— 原来是按前缀扫，不再依赖页面传 id。） */
  A.writePick('pll', 'Aa', 'x');
  const killed = A.resetPage('oll');
  ok('恢复默认只清这一页的选中；自定义公式保留（别的页也不动）',
    killed >= 1 && !Object.keys(store).some(k => k.indexOf('cube-pick:oll:') === 0) &&
    store['cube-custom:oll:15'] && store['cube-pick:pll:Aa'] === 'x',
    killed + ' 个键 / ' + JSON.stringify(Object.keys(store)));

  // 七个公式页都挂上了那三个键 + 面板里的「自定义…」
  ['pll.html', 'oh-pll.html', 'oll.html', 'oh-oll.html', 'oll2.html', 'pbl2.html', 'f2l.html'].forEach(f => {
    const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
    /* ⚠ algpicks.js 必须在**页面脚本之前**加载：页面里那句 mountTools 有 typeof 保护，
       顺序反了会被静默跳过 —— 表现就是「这一页没有那几个按键」（单手 PLL 踩过）。 */
    ok(f + '：algpicks.js 在页面脚本之前加载（否则 mountTools 会被静默跳过，键就没了）',
      h.indexOf('<script src="js/algpicks.js"></script>') < h.indexOf('AlgPicks.mountTools('),
      h.indexOf('<script src="js/algpicks.js"></script>') + ' < ' + h.indexOf('AlgPicks.mountTools('));
    ok(f + '：引了 algpicks.js、挂了图标键、面板里有「自定义…」',
      /<script src="js\/algpicks\.js"><\/script>/.test(h) &&
      /AlgPicks\.mountTools\('[^']+', \{/.test(h) &&
      /\.toolbtn\{/.test(h) && /AlgPicks\.decoratePanel\(/.test(h),
      [/\.toolbtn\{/.test(h), /AlgPicks\.mountTools/.test(h), /decoratePanel/.test(h)].join(','));
  });
  // 面板里那条「已被选中的自定义公式」要按自定义的样子标（用户报过：样式和下面那条不一样）
  {
    const mk2 = t => ({
      tagName: t, className: '', textContent: '', title: '', children: [], _on: {}, style: {},
      classList: { _s: new Set(), add(c) { this._s.add(c); }, contains(c) { return this._s.has(c); } },
      addEventListener(ev, fn) { (this._on[ev] = this._on[ev] || []).push(fn); },
      appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
      querySelector() { return null; }, querySelectorAll() { return []; },
      set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; }
    });
    const ctx2 = { console, localStorage: fake, window: { localStorage: fake },
      document: { createElement: mk2, getElementById: () => null, head: null, body: mk2('body') } };
    ctx2.globalThis = ctx2;
    vm.createContext(ctx2);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'algpicks.js'), 'utf8'), ctx2);
    const A2 = ctx2.AlgPicks;
    A2.addCustom('oll', '20', "R U R'", 2);          // 这条已经进了候选（= 正显示的那条）
    A2.writePick('oll', '20', "R U R'");             // 添加时页面就是把它设成当前显示的那条
    const box = mk2('div'), btn = mk2('button'), span = mk2('span'), idx = mk2('b');
    span.textContent = "R U R'";
    idx.className = 'idx';
    btn.appendChild(idx); btn.appendChild(span); box.appendChild(btn);
    box.querySelectorAll = sel => (sel === 'button' ? [btn] : (sel === 'span, code' ? [span] : []));
    btn.querySelectorAll = sel => (sel === 'span' || sel === 'span, code' ? [span] : []);
    btn.querySelector = sel => (sel === 'b.idx' ? idx : null);
    let reloaded = false;
    ctx2.window.location = { reload() { reloaded = true; } };
    A2.decoratePanel(box, { page: 'oll', id: '20', views: 1, esc: t => t, imgOf: () => 'x.png',
                            pick() {}, rebuild() {}, close() {} });
    const rows = box.children.filter(c => c.className.indexOf('custom-item') === 0);
    ok('选中的自定义公式：候选那一行藏掉，按自定义条目摆一条（带 cur），样式和别的自定义一致',
      btn.style.display === 'none' && rows.length === 1 &&
      rows[0].className.indexOf('cur') > 0 &&
      /class="tag">view 2</.test(rows[0].innerHTML || '') &&
      /class="del"/.test(rows[0].innerHTML || ''),
      btn.style.display + ' / ' + rows.length + ' 条自定义: ' + (rows[0].innerHTML || '').slice(0, 60));

    /* 用户报过的坑：自定义公式正好和库里的 2 号一样时，候选那一行**不能**被藏掉
       （以前只按文本比，面板里就少了 2 号）。库里有的，候选留着，只补 view 标签 + ✕。 */
    {
      const box2 = mk2('div'), btn2 = mk2('button'), span2 = mk2('span');
      span2.textContent = "R U R'";
      btn2.appendChild(span2); box2.appendChild(btn2);
      box2.querySelectorAll = sel => (sel === 'button' ? [btn2] : (sel === 'span, code' ? [span2] : []));
      btn2.querySelectorAll = sel => (sel === 'span' || sel === 'span, code' ? [span2] : []);
      btn2.querySelector = () => null;
      A2.mountTools('oll', { ids: () => true, find: () => 2 });      // 这一页：库里**有**这条（挂在 v2）
      A2.decoratePanel(box2, { page: 'oll', id: '20', views: 1, esc: t => t, imgOf: () => 'x.png',
                               pick() {}, rebuild() {}, close() {} });
      const rows2 = box2.children.filter(c => c.className.indexOf('custom-item') === 0);
      ok('自定义/导入匹配上库里某条时：候选那一行留着，且和直接选中一样（不加 view、不加 ✕）',
        btn2.style.display !== 'none' && !/ is-custom/.test(' ' + btn2.className) &&
        !btn2.children.some(c => c.className === 'tag' || c.className === 'del') &&
        rows2.length === 0,
        btn2.className + ' / 子节点 ' + btn2.children.length + ' / 自定义条目 ' + rows2.length);
    }

    // 删掉「正显示的那条」自定义：选中也要撤掉（回默认），别在存档里留一条死公式
    (rows[0]._on.click || []).forEach(f => f({ target: { className: 'del' },
                                               preventDefault() {}, stopPropagation() {} }));
    ok('删掉当前选中的自定义公式：cube-pick 清掉并刷新（表格回默认、练习页也不会再拿它练）',
      A2.customs('oll', '20').length === 0 && A2.readPick('oll', '20') === '' && reloaded,
      JSON.stringify({ customs: A2.customs('oll', '20'), pick: A2.readPick('oll', '20'), reloaded }));
  }

  /* 一键「清空自定义公式」：自定义全删；正选中那条自定义的行撤回默认；库里那条的选中不动 */
  {
    const st6 = {};
    const fake6 = { get length() { return Object.keys(st6).length; },
                    key: i => Object.keys(st6)[i],
                    getItem: k => (k in st6 ? st6[k] : null),
                    setItem: (k, v) => { st6[k] = String(v); },
                    removeItem: k => { delete st6[k]; } };
    const ctx6 = { console, localStorage: fake6, window: { localStorage: fake6 },
                   document: { querySelectorAll: () => [] } };
    ctx6.globalThis = ctx6;
    vm.createContext(ctx6);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'algpicks.js'), 'utf8'), ctx6);
    const A4 = ctx6.AlgPicks;
    A4.addCustom('oll', '15', '自定义A', 1); A4.writePick('oll', '15', '自定义A');
    A4.addCustom('oll', '16', '自定义B', 2);
    A4.writePick('oll', '17', 'R U');
    const r = A4.clearCustoms('oll');
    ok('清空自定义公式：自定义删光、正选中它的那行回默认、库里那条的选中不受影响',
      r.removed === 2 && r.reset === 1 && A4.customs('oll', '15').length === 0 &&
      A4.customs('oll', '16').length === 0 && A4.readPick('oll', '15') === '' &&
      A4.readPick('oll', '17') === 'R U',
      JSON.stringify({ r, left: Object.keys(st6) }));
  }

  ok('三个图标键的 id 与图标都在模块里（内联 SVG，不是字符）',
    /'algreset'/.test(fs.readFileSync(path.join(ROOT, 'js', 'algpicks.js'), 'utf8')) &&
    /ICON = \{/.test(fs.readFileSync(path.join(ROOT, 'js', 'algpicks.js'), 'utf8')) &&
    /reset: '<svg/.test(fs.readFileSync(path.join(ROOT, 'js', 'algpicks.js'), 'utf8')));
}

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
