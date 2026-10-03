/* 二阶 OLL 图的几何：把「四个角的朝向」变成编辑器的 2×2 俯视图（cube.js 的 buildOll2）。
 *
 * 和 oll_geometry.js 同一条路子：图本来就是编辑器那个视图导出来的，坐标系和
 * tools/oll2_db.py 读图时假定的四宫格一致。差别只有两点：
 *   · 格子表是 2×2（OLL2_FACES），没有中心格；
 *   · 输入不是顶面 9 位 + 侧边 12 位，而是四个角各自的朝向（u/b/f/l/r），
 *     顺序 = 左上 / 右上 / 左下 / 右下（左后 / 右后 / 左前 / 右前）。
 *
 * 用法:
 *   node tools/oll2_geometry.js --sig <ubfl> --out geom.json [--theme light|dark] [--scheme violet|yellow]
 * 输出: { size, cfg, cells[], bars[]（带 color/w/alpha）, style{line,stroke}, oll, sig }
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Cube = require(path.join(ROOT, 'js', 'cube.js'));

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const sig = arg('--sig'), out = arg('--out');
if (!sig || !out) {
  console.error('用法: node tools/oll2_geometry.js --sig <ubfl> --out geom.json [--theme light|dark] [--scheme violet|yellow]');
  process.exit(2);
}
if (!/^[ubflr]{4}$/.test(sig)) {
  console.error('sig 必须是 4 个 u/b/f/l/r：' + sig);
  process.exit(2);
}

const TILES = [[0, 0], [0, 1], [1, 0], [1, 1]];      // 左上 / 右上 / 左下 / 右下
const FACE = { u: 'U', b: 'B', f: 'F', l: 'L', r: 'R' };

const oll = [[0, 0], [0, 0]];
const bad = [];
TILES.forEach(([r, c], i) => {
  const faces = Cube.OLL2_FACES[r][c];
  const idx = faces.indexOf(FACE[sig[i]]);
  if (idx < 0) bad.push(sig[i] + ' 不是 (' + r + ',' + c + ') 能朝向的面：' + faces.join('/'));
  else oll[r][c] = idx;
});
if (bad.length) { bad.forEach(b => console.error('  ✗ ' + b)); process.exit(1); }

const theme = arg('--theme') || 'light';
const scheme = arg('--scheme') || 'violet';
const built = Cube.buildOll2(oll, { theme: theme, scheme: scheme });

/* 自检：从几何倒着读一遍四个角的朝向，必须和输入一模一样 */
const got = TILES.map(([r, c]) => {
  const cell = built.cells.find(x => x.row === r && x.col === c);
  if (!cell) return '?';
  if (cell.on) return 'u';
  const bar = built.bars.find(b => b.row === r && b.col === c && b.selected);
  const face = bar ? bar.face : null;
  return { U: 'u', B: 'b', F: 'f', L: 'l', R: 'r' }[face] || '?';
}).join('');
if (got !== sig) {
  console.error('  ✗ 几何倒读 ' + got + ' ≠ 输入 ' + sig);
  process.exit(1);
}

/* 划线颜色 / 粗细 / 透明度：和编辑器的 toOll2Svg 一致（选中的粗一点、浓一点） */
const bars = built.bars.map(b => Object.assign({}, b, {
  color: b.selected ? built.pal.on : built.pal.ghost,
  w: b.selected ? built.cfg.bar : built.cfg.barGhost,
  alpha: b.selected ? built.cfg.barOn : built.cfg.barDim,
}));

fs.writeFileSync(out, JSON.stringify({
  size: built.size, cfg: built.cfg, oll: oll, sig: sig,
  style: { line: built.pal.line, stroke: built.cfg.line },
  cells: built.cells, bars: bars
}));
console.log('%s: oll %s | cells %d | bars %d | %s/%s',
            path.basename(out), JSON.stringify(oll), built.cells.length, bars.length, theme, scheme);
