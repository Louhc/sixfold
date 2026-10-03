/* PLL 图的几何：把「局面」变成编辑器的 PLL 展开网（cube.js 的 buildPll）。
 *
 * 为什么走编辑器的路径：公式页那些图（pll / oll / oll2 / pbl2）本来就是编辑器
 * 那几个视图导出来的 —— cube.js 里 buildPll / buildOll / buildOll2 / buildPbl2
 * 的坐标系和 signature.py 取样时假定的格子尺寸、留白完全对得上（PAD=0.4342）。
 * 所以「按 sig / 角度重新生成图」= 造出局面 → 这里出几何 → PIL 上色。
 *
 * 用法:
 *   node tools/pll_geometry.js --state st.json --out geom.json [--nc] [--arrow violet|yellow]
 *     --state  cubesim.js 的局面（键是 "x,y,z|nx,ny,nz"，和 tutorial_geometry.js 同一格式）
 *     --turn   这个角度相对基准画面转了几步（0..3，等价于顶层转 U^k 步）。
 *              色带用「本角度的置换」（这样才和 sig 一致），箭头要用「转过之后的画面」：
 *              块的目标位（家）也跟着转，所以箭头那份置换要按顶层旋转共轭一次。
 *     --nc     无色版（格子不填色，只留描边；侧面色带也不画）
 *     --arrow  箭头配色：violet（深紫，默认，白天那套）/ yellow（黄，夜晚无色那套）
 * 输出: { perm, size, cells[], bars[], arrows[], style{line,arrow,nc}, cfg }
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Cube = require(path.join(ROOT, 'js', 'cube.js'));
const S = require(path.join(ROOT, 'js', 'cubesim.js'));

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const has = k => process.argv.indexOf(k) >= 0;
const FACES = { U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], B: [0, 0, -1], R: [1, 0, 0], L: [-1, 0, 0] };

const stateFile = arg('--state'), out = arg('--out');
if (!stateFile || !out) {
  console.error("用法: node tools/pll_geometry.js --state st.json --out geom.json [--nc] [--arrow violet|yellow]");
  process.exit(2);
}
const st = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

/* 局面 -> 置换：槽位 i 上是「哪一块」。块的身份靠贴纸颜色集合认（顶层朝向是正的，
   所以一块的三种颜色就是它家的三种颜色）。 */
const key = arr => arr.slice().sort().join('');
const homeKey = h => key(['U'].concat(h.faces));
function permOf(state) {
  const sticker = (pos, face) => state[pos.join(',') + '|' + face.join(',')];
  return Cube.PLL_SLOTS.map(sl => {
    const pos = [sl.col - 1, 1, sl.row - 1];
    const k = key(['U'].concat(sl.faces).map(f => sticker(pos, FACES[f])));
    return Cube.PLL_SLOTS.findIndex(h => homeKey(h) === k);
  });
}
const permBase = permOf(st);
if (permBase.some(v => v < 0)) { console.error('认不出是哪个置换：' + permBase.join(',')); process.exit(1); }

/* 顶层转 k 步对「槽位」的置换：sigma[j] = 槽位 j 上的块搬到哪。 */
const turn = parseInt(arg('--turn') || '0', 10) || 0;
let sigma = Cube.PLL_SLOTS.map((_, i) => i);
if (turn) {
  const alg = ['', 'U', 'U2', "U'"][turn % 4];
  const cameFrom = permOf(S.apply(S.solved(), alg));      // 槽位 i 上的块原来在哪个槽位
  if (cameFrom.some(v => v < 0)) { console.error('turn 认不出：' + alg); process.exit(1); }
  sigma = [];
  cameFrom.forEach((j, i) => { sigma[j] = i; });
}
/* 两份置换：
   permBase —— 把本角度的置换还原成基准（块 -> 它的家，按画面转过之前算）
   permArrow —— 箭头用：基准箭头整体转 k 步，画出来才是「同一个 case 转了 90°」 */
const permBase2 = [];
for (let j = 0; j < 8; j++) permBase2[j] = permBase[sigma[j]];
const permArrow = [];
for (let j = 0; j < 8; j++) permArrow[sigma[j]] = sigma[permBase2[j]];
const perm = permBase;

const nc = has('--nc');
const arrowKey = arg('--arrow') || 'violet';
const built = Cube.buildPll(perm, { showColors: !nc });
const arrowGeom = turn ? Cube.buildPll(permArrow, { showColors: !nc }).arrows : built.arrows;
const arrowColor = Cube.pllArrowColorOf(arrowKey) || (Cube.PLL_ARROW_COLORS[0] || {}).on;

fs.writeFileSync(out, JSON.stringify({
  perm: perm, size: built.size || null, cfg: built.cfg,
  style: { line: (built.cfg.paint || {}).line, arrow: arrowColor, nc: nc },
  turn: turn, cells: built.cells, bars: built.bars || [], arrows: arrowGeom || []
}));
console.log('%s: perm %s | cells %d | bars %d | arrows %d%s',
            path.basename(out), perm.join(','), built.cells.length,
            (built.bars || []).length, (built.arrows || []).length, nc ? ' | 无色' : '');
