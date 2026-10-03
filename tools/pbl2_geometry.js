/* 二阶 PBL 图的几何：把「两层的换角置换」变成编辑器的两层网格 + 箭头（cube.js 的 buildPbl2）。
 *
 * 和 pll_geometry.js 同一条路子：图本来就是编辑器那个视图导出来的，坐标系一致。
 * PBL 只有线稿 + 箭头，没有配色，所以这里只挑两套「画笔」：
 *   day   = 深色线稿 + 深紫箭头（浅色卡片上好看）
 *   night = 浅色线稿 + 黄箭头（深色卡片上才看得见）—— 和现有那批图一致
 *
 * 用法:
 *   node tools/pbl2_geometry.js --state <u0u1u2u3,d0d1d2d3> --tone day|night --out geom.json
 * 输出: { size, cfg, cells[], arrows[], style{line, stroke, arrow}, state }
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Cube = require(path.join(ROOT, 'js', 'cube.js'));

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const stArg = arg('--state'), out = arg('--out');
if (!stArg || !out) {
  console.error('用法: node tools/pbl2_geometry.js --state <u0u1u2u3,d0d1d2d3> --tone day|night --out geom.json');
  process.exit(2);
}
const parts = stArg.split(',');
if (parts.length !== 2 || !parts.every(s => /^[0-3]{4}$/.test(s))) {
  console.error('state 必须是「4 位,4 位」（每层一个 0..3 的置换）：' + stArg);
  process.exit(2);
}
const st = { u: parts[0].split('').map(Number), d: parts[1].split('').map(Number) };

// 画笔：和现有那批图一致（day 深线深紫箭头 / night 浅线黄箭头）
const PAINT = {
  day: { line: '#1A1A1A', ghost: '#6E7A8A', head: '#4C4263', text: '#FFFFFF', accent: '#C8D0DC' },
  night: { line: '#C8D0DC', ghost: '#6E7A8A', head: '#FFE600', text: '#FFFFFF', accent: '#C8D0DC' },
};
const tone = arg('--tone') || 'day';
const paint = PAINT[tone];
if (!paint) { console.error('--tone 只能是 day / night：' + tone); process.exit(2); }

const built = Cube.buildPbl2(st, { paint: paint });

// 自检：两层都不动就不该有箭头，动了就至少一根（互相换的两个角画成一根双头箭头）
const home = [0, 1, 2, 3].every(i => st.u[i] === i) && [0, 1, 2, 3].every(i => st.d[i] === i);
if (home && built.arrows.length) {
  console.error('  ✗ 两层都复原却画了 ' + built.arrows.length + ' 根箭头');
  process.exit(1);
}
if (!home && !built.arrows.length) {
  console.error('  ✗ 有角块不在家却没画出箭头');
  process.exit(1);
}

fs.writeFileSync(out, JSON.stringify({
  size: built.size, cfg: built.cfg, state: st, tone: tone,
  style: { line: paint.line, stroke: built.cfg.arrow * 0.9, arrow: paint.head },
  cells: built.cells, arrows: built.arrows
}));
console.log('%s: %s | cells %d | arrows %d | %s',
            path.basename(out), stArg, built.cells.length, built.arrows.length, tone);
