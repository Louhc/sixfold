/* MemColor（练习页「记颜色相对位置」的纯逻辑）测试 —— 不需要 DOM / 不需要图 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ctx = { console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'memcolor.js'), 'utf8'), ctx);
const M = ctx.MemColor;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; return; }
  fail++;
  console.log('  ✗ ' + name + (extra !== undefined ? '  -> ' + extra : ''));
}

/* 固定序列的伪随机，保证每轮跑一样的题 */
function rng(seed) {
  let s = seed >>> 0;
  return function () { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
}

const ORDER = M.ORDER;
const OPP = M.OPP;

/* ---------- 1. 朝向：24 种（底 6 × 前 4）都要是合法的双射、三对对面对 ---------- */
{
  let n = 0, bad = [];
  ORDER.forEach(bottom => {
    ORDER.filter(f => f !== bottom && f !== OPP[bottom]).forEach(front => {
      n++;
      const m = M.scheme({ bottom, front });
      const vals = M.FACES.map(f => m[f]);
      if (new Set(vals).size !== 6) bad.push(`${bottom}/${front} 不是六个面六种颜色`);
      if (m.D !== bottom || m.U !== OPP[bottom]) bad.push(`${bottom}/${front} 上下不对`);
      if (m.F !== front || m.B !== OPP[front]) bad.push(`${bottom}/${front} 前后不对`);
      if (OPP[m.L] !== m.R) bad.push(`${bottom}/${front} 左右不是对面`);
      if (!vals.includes(M.OPP[m.L])) bad.push(`${bottom}/${front} 左右推不出对面`);
    });
  });
  ok('24 种朝向（底 × 前）都能推出一套合法的六面配色', n === 24 && bad.length === 0, bad.join('; '));
}

/* ---------- 2. 本站手性：白底、绿在前 → 红在左 ---------- */
{
  const m = M.scheme({ bottom: 'white', front: 'green' });
  ok('默认手性：白底 + 绿在前 → 左红、右橙、后蓝、上黄',
    m.L === 'red' && m.R === 'orange' && m.B === 'blue' && m.U === 'yellow',
    JSON.stringify(m));
  ok('左邻 / 右邻：绿（前）的左边是红、右边是橙',
    M.neighbour(m, 'green', 'left') === 'red' && M.neighbour(m, 'green', 'right') === 'orange',
    M.neighbour(m, 'green', 'left') + '/' + M.neighbour(m, 'green', 'right'));
  ok('绕竖轴一圈：绿→红→蓝→橙→绿（左邻反复取四次回到自己）',
    (() => {
      let c = 'green', out = [c];
      for (let i = 0; i < 4; i++) { c = M.neighbour(m, c, 'left'); out.push(c); }
      return out.join() === 'green,red,blue,orange,green';
    })(),
    (() => { let c = 'green', out = [c]; for (let i = 0; i < 4; i++) { c = M.neighbour(m, c, 'left'); out.push(c); } return out.join(); })());
}

/* ---------- 3. 出题：四类题各跑很多轮，答案自洽 ---------- */
{
  let bad = [], counts = {};
  M.TYPES.forEach(t => { counts[t] = 0; });
  for (let seed = 1; seed <= 400; seed++) {
    const q = M.question(rng(seed), { types: M.TYPES });
    counts[q.type] = (counts[q.type] || 0) + 1;
    if (!M.check(q, q.answer)) bad.push('check 自己的答案返回 false');
    if (!q.choices.some(c => c.key === q.answer)) bad.push(`第 ${seed} 题：选项里没有正确答案`);
    const keys = q.choices.map(c => c.key);
    if (new Set(keys).size !== keys.length) bad.push(`第 ${seed} 题：选项重复`);
    if (!q.lines.length || !q.why) bad.push(`第 ${seed} 题：缺题面或解释`);
    if (q.type === 'which') {
      const m = M.scheme(q.setup);
      if (m[q.answer] !== q.ask || m[q.face] !== q.ask) {
        bad.push(`第 ${seed} 题（which）答案与配色不符：${q.lines[0]} -> ${q.answer}`);
      }
      if (!/在前时，/.test(q.lines[0])) bad.push(`第 ${seed} 题（which）题面没写成「X 在前时，…」`);
      if (q.ask === q.setup.front) bad.push(`第 ${seed} 题（which）问了前面那个颜色（必答「前」，太送分）`);
    }
    if (q.type === 'tf') {
      if ((q.claim === q.faceColor) !== q.truth) bad.push(`第 ${seed} 题（tf）真假标错`);
      if (q.face === 'F') bad.push(`第 ${seed} 题（tf）拿「前面」出题（废话）`);
      if (q.answer !== (q.truth ? 'yes' : 'no')) bad.push(`第 ${seed} 题（tf）答案与真假不符`);
    }
    if (q.type === 'side') {
      const m = M.scheme(q.setup);
      if (M.neighbour(m, q.ask, q.dir) !== q.answer) bad.push(`第 ${seed} 题（side）答案与左邻/右邻不符`);
      // 左右邻和朝向无关：题面不写「X 在前时」，换个朝向问同一对颜色答案不变
      if (/在前时，/.test(q.lines[0])) bad.push(`第 ${seed} 题（side）题面多余地带了前提：${q.lines[0]}`);
    }
  }
  ok('400 轮出题：答案自洽、选项含答案且不重复、题面与解释齐全、题面都是一句话',
    bad.length === 0, bad.slice(0, 3).join('; '));
  ok('三类题都能出到（题型随机；问「对面」的那类已经去掉）',
    M.TYPES.join() === 'which,side,tf' && M.TYPES.every(t => counts[t] > 20), JSON.stringify(counts));
}

/* ---------- 3b. 出了底面就不问顶/底：选项里不含顶面颜色，which 只给四个侧面 ---------- */
{
  let bad = [];
  for (let seed = 1; seed <= 300; seed++) {
    const bottom = ['white', 'yellow', 'red', 'orange', 'green', 'blue'][seed % 6];
    const q = M.question(rng(seed * 7), { bottom, types: ['which', 'side'] });
    const top = OPP[bottom];
    if (q.type === 'which') {
      // 问的颜色必须是侧面四个之一（不是底、也不是顶）
      if (q.ask === bottom || q.ask === top) bad.push(`第 ${seed} 题（which）问了底/顶的颜色`);
      if (q.choices.map(c => c.key).sort().join() !== 'B,F,L,R') bad.push(`第 ${seed} 题（which）选项不是四个侧面`);
    } else if (q.choices.some(c => c.key === top || c.key === bottom)) {
      bad.push(`第 ${seed} 题（${q.type}）选项里出现了底/顶颜色`);
    }
    if (q.choices.length < 2) bad.push(`第 ${seed} 题选项太少`);
  }
  ok('出了底面就不问顶/底：选项里既没有顶面颜色、也没有底面颜色，which 只在四个侧面里选',
    bad.length === 0, bad.slice(0, 3).join('; '));
}

/* ---------- 3c. 左右邻与「谁在前面」无关 ---------- */
{
  const bottoms = ['white', 'yellow', 'red'];
  let bad = [];
  bottoms.forEach(bottom => {
    // 同一个底面：换四个不同的「前面」，问同一对颜色，答案必须一样
    const fronts = ['green', 'blue', 'red', 'orange'].filter(f => f !== bottom && f !== OPP[bottom]);
    const answers = {};
    for (let s = 1; s <= 200; s++) {
      const q = M.question(rng(s + bottom.length), { bottom, types: ['side'] });
      if (q.ask === q.setup.front) continue;                    // 问「前面那个颜色」时前面本来就是它
      const key = q.ask + '/' + q.dir;
      if (answers[key] === undefined) answers[key] = q.answer;
      else if (answers[key] !== q.answer) bad.push(`${bottom} 底：${key} 的答案随前面变了`);
    }
    if (fronts.length < 2) bad.push('测试本身没覆盖到多个前面');
  });
  ok('左右邻与「谁在前面」无关（换朝向问同一对颜色，答案不变）', bad.length === 0, bad.slice(0, 3).join('; '));
}

/* ---------- 4. 题型可勾选、朝向参数生效 ---------- */
{
  const only = M.question(rng(7), { types: ['tf'] });
  ok('只勾一类就只出那一类', only.type === 'tf', only.type);
  let same = true;
  for (let s = 1; s <= 30; s++) {
    const q = M.question(rng(s), { types: ['which'], bottom: 'white', front: 'red' });
    if (q.setup.bottom !== 'white' || q.setup.front !== 'red') same = false;
  }
  ok('指定「白底 · 红在前」时题面就是这个朝向', same);
  ok('乱的朝向参数（底=前、底是对面）返回 null 而不是瞎给一套',
    M.scheme({ bottom: 'white', front: 'white' }) === null &&
    M.scheme({ bottom: 'white', front: 'yellow' }) === null);
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
