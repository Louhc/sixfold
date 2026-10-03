/* OLL 图的几何：把「签名」变成编辑器的 OLL 俯视图（cube.js 的 buildOll）。
 *
 * 和 pll_geometry.js 同一条路子：公式页那些图本来就是编辑器那几个视图导出来的，
 * cube.js 里 buildOll 的坐标系和 signature.py 取样时假定的格子尺寸、留白完全一致
 * （cell=1 gap=0.17 pad=0.13*board）—— 所以「按 sig 重新生成图」= 反推朝向 → 这里出几何 → PIL 上色。
 *
 * OLL 的签名就是这套模型的直接读数：
 *   顶面 9 格 = 每格朝没朝上（on/off）；
 *   侧边 12 划线的顺序是 B3 L3 R3 F3，正好对应这些格子：
 *     B: (0,0)(0,1)(0,2) / L: (0,0)(1,0)(2,0) / R: (0,2)(1,2)(2,2) / F: (2,0)(2,1)(2,2)
 *   某一位是 1，就说明那一格的 U 色贴纸从那个侧面露出来 —— 也就是它的朝向 = 那个面。
 *   每个「没朝上」的块恰好有一条 1（OLL 模型的性质），所以 sig → 朝向数组是唯一确定的。
 *
 * 用法:
 *   node tools/oll_geometry.js --sig <顶面9位>,<侧边12位> --out geom.json
 *        [--theme light|dark] [--scheme violet|yellow]
 * 输出: { size, cfg, cells[], bars[]（带 color）, style{line,stroke}, oll, sig }
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Cube = require(path.join(ROOT, 'js', 'cube.js'));

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const sigArg = arg('--sig'), out = arg('--out');
if (!sigArg || !out) {
  console.error('用法: node tools/oll_geometry.js --sig <顶面9>,<侧边12> --out geom.json [--theme light|dark] [--scheme violet|yellow]');
  process.exit(2);
}
const parts = sigArg.split(',');
if (parts.length !== 2 || parts[0].length !== 9 || parts[1].length !== 12) {
  console.error('sig 必须是「9 位,12 位」：' + sigArg);
  process.exit(2);
}
const [top, bars] = parts;
if (!/^[01]{9}$/.test(top) || !/^[01]{12}$/.test(bars)) {
  console.error('sig 只能由 0/1 组成：' + sigArg);
  process.exit(2);
}

/* 12 条划线 -> (行, 列, 面)，顺序和 signature.bar_pt / cubesim.sig 一致（B L R F 各 3 条） */
const SAMPLE = [];
for (let i = 0; i < 3; i++) SAMPLE.push([0, i, 'B']);
for (let i = 0; i < 3; i++) SAMPLE.push([i, 0, 'L']);
for (let i = 0; i < 3; i++) SAMPLE.push([i, 2, 'R']);
for (let i = 0; i < 3; i++) SAMPLE.push([2, i, 'F']);

/* 签名 -> 朝向数组：oll[r][c] = 「U 色贴纸朝向 OLL_FACES[r][c] 里的第几个面」（0 = 朝上） */
const oll = Cube.ollAll(true);
let bad = [];
if (top[4] !== '1') bad.push('中心格必须朝上');
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    const r = i, c = j;
    if (r === 1 && c === 1) continue;
    const faces = Cube.OLL_FACES[r][c];
    const on = top[r * 3 + c] === '1';
    let idx = 0;
    for (let k = 1; k < faces.length; k++) {
      const pos = SAMPLE.findIndex(s => s[0] === r && s[1] === c && s[2] === faces[k]);
      if (pos >= 0 && bars[pos] === '1') idx = k;
    }
    if (on !== (idx === 0)) bad.push('(' + r + ',' + c + ') 顶面 ' + top[r * 3 + c] + ' 与划线不一致');
    oll[r][c] = idx;
  }
}

const theme = arg('--theme') || 'dark';
const scheme = arg('--scheme') || 'violet';
const built = Cube.buildOll(oll, { theme: theme, scheme: scheme });

/* 自检：从几何倒着读一遍签名，必须和输入一模一样（图 = sig 的自检在调色之后由 signature.py 再做一次） */
const gotTop = built.cells.map(c => (c.on ? '1' : '0')).join('');
const gotBars = SAMPLE.map(s => {
  const b = built.bars.find(x => x.row === s[0] && x.col === s[1] && x.face === s[2]);
  return b && b.selected ? '1' : '0';
}).join('');
if (gotTop !== top || gotBars !== bars) {
  bad.push('几何倒读 ' + gotTop + ',' + gotBars + ' ≠ 输入 ' + top + ',' + bars);
}
if (bad.length) { bad.forEach(b => console.error('  ✗ ' + b)); process.exit(1); }

/* 划线颜色 / 粗细 / 透明度：和编辑器的 toOllSvg 一致 ——
   选中的那条用方案色、粗一点、浓一点；其余候选条用浅灰、细一档、淡一点。 */
const barsOut = built.bars.map(b => Object.assign({}, b, {
  color: b.selected ? built.pal.on : built.pal.ghost,
  w: b.selected ? built.cfg.bar : built.cfg.barGhost,
  alpha: b.selected ? built.cfg.barOn : built.cfg.barDim,
}));

fs.writeFileSync(out, JSON.stringify({
  size: built.size, cfg: built.cfg, oll: oll, sig: [top, bars],
  style: { line: built.pal.line, stroke: built.cfg.line },
  cells: built.cells, bars: barsOut
}));
console.log('%s: oll %s | cells %d | bars %d | scheme %s',
            path.basename(out), JSON.stringify(oll.flat().join('')),
            built.cells.length, barsOut.length, scheme);
