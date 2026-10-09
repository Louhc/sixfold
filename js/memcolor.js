/* MemColor —— 练习页「记颜色相对位置」的纯逻辑（普通 <script>，全局 MemColor，没有 DOM 依赖）
 *
 * 六个面的颜色由两个信息定死：**哪个颜色在底** + **哪个颜色在前**，其余四面（含手性）推出来。
 * 本站手性沿用 js/cube.js 的默认配色：顶黄 / 左红 / 右绿 —— 也就是
 * **白底、绿在前时，红在左**（红-橙、白-黄、蓝-绿 三对是对面，固定不变）。
 *
 * 题目分三类（可勾选）：
 *   which     绿在前时，蓝在哪一面？          （前/后/左/右）
 *   side      蓝的左边是什么颜色？            （绕着竖轴看：前→左→后→右，与朝向无关）
 *   tf        绿在前时 —— 「左面是红」对不对？（对/错）
 * 「X 的对面是什么颜色」这一类**已经去掉**（用户要求：太简单）。
 *
 * 用法：
 *   var q = MemColor.question(Math.random, { types: ['which', 'side'] });
 *   q.lines    -> ['白底 · 绿在前', '蓝的左边是什么颜色？']
 *   q.choices  -> [{ key: 'red', label: '红', color: '#C00000' }, …]
 *   q.answer   -> 'red'
 *   MemColor.check(q, 'red') === true
 */
var MemColor = (function () {
  'use strict';

  var ZH = { white: '白', yellow: '黄', red: '红', orange: '橙', green: '绿', blue: '蓝' };
  var HEX = {
    white: '#FFFFFF', yellow: '#FFE600', red: '#C00000',
    orange: '#FF8C00', green: '#00B050', blue: '#0070C0'
  };
  var OPP = {
    white: 'yellow', yellow: 'white', red: 'orange',
    orange: 'red', green: 'blue', blue: 'green'
  };
  var ORDER = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];
  var FACES = ['U', 'D', 'F', 'B', 'L', 'R'];
  var FACE_ZH = { U: '上', D: '下', F: '前', B: '后', L: '左', R: '右' };
  var SIDE_FACES = ['F', 'L', 'B', 'R'];       // 从上看顺时针：前 → 右 → 后 → 左（下面按「看的人」定义左邻）

  /* 标准坐标系（右手系）里的方向向量：x 右、y 上、z 前。
     本站默认（顶黄 / 前绿 / 左红 / 右橙）就落在这上面：白 -y、黄 +y、绿 +z、蓝 -z、红 -x、橙 +x。 */
  var VEC = {
    white: [0, -1, 0], yellow: [0, 1, 0],
    green: [0, 0, 1], blue: [0, 0, -1],
    red: [-1, 0, 0], orange: [1, 0, 0]
  };

  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function colorAt(v) {
    for (var i = 0; i < ORDER.length; i++) {
      var w = VEC[ORDER[i]];
      if (w[0] === v[0] && w[1] === v[1] && w[2] === v[2]) return ORDER[i];
    }
    return null;
  }

  /* 朝向 → { U,D,F,B,L,R: 颜色 }。bottom 与 front 不能是对面。 */
  function scheme(opt) {
    var bottom = (opt && opt.bottom) || 'white';
    var front = (opt && opt.front) || 'green';
    /* 前不能就是底、也不能是底的对面对（这两种推不出坐标系） */
    if (!VEC[bottom] || !VEC[front] || front === bottom || OPP[bottom] === front) return null;
    var left = colorAt(cross(VEC[bottom], VEC[front]));   // 底 × 前 = 左（本站手性）
    return {
      U: OPP[bottom], D: bottom,
      F: front, B: OPP[front],
      L: left, R: OPP[left]
    };
  }

  /* 「从看的人那边」绕着竖轴的左邻 / 右邻：前 →(左) 左 →(左) 后 →(左) 右 →(左) 前
     手性：白底·绿在前时，绿的左边是红（左面）。 */
  function neighbour(map, color, dir) {
    var cyc = ['F', 'L', 'B', 'R'].map(function (f) { return map[f]; });
    var i = cyc.indexOf(color);
    if (i < 0) return null;
    var k = (dir === 'right') ? (i + 3) % 4 : (i + 1) % 4;
    return cyc[k];
  }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length) % arr.length]; }
  function otherColors(c) {
    return ORDER.filter(function (x) { return x !== c; });
  }
  /* 选项：去掉被问的那个颜色，再去掉**底面**（用户自己选的）和**顶面**（底的对面对）——
     这两个颜色是已知的，放进选项等于送分（用户要求）。 */
  function choicesOf(ask, bottom) {
    var top = OPP[bottom];
    return ORDER.filter(function (c) { return c !== ask && c !== bottom && c !== top; });
  }

  var TYPES = ['which', 'side', 'tf'];      // 没有 opposite（问对面太简单，用户要求去掉）

  /* 出一题。rng 传 Math.random 即可（测试里传定值/伪随机）。 */
  function question(rng, opt) {
    rng = rng || Math.random;
    var types = (opt && opt.types && opt.types.length) ? opt.types : TYPES;
    var bottom = (opt && opt.bottom) || 'white';
    var fronts = ORDER.filter(function (c) { return c !== bottom && c !== OPP[bottom]; });
    var front = (opt && opt.front) || pick(rng, fronts);
    var map = scheme({ bottom: bottom, front: front });
    var type = pick(rng, types);
    var q, zh = ZH;

    if (type === 'which') {
      /* 只问侧面颜色、只在 前/后/左/右 里选（底面是自己选的、顶面是推出来的，都不问） */
      var y = pick(rng, SIDE_FACES.filter(function (f) { return f !== 'F'; })
        .map(function (f) { return map[f]; }));
      var face = null;
      FACES.forEach(function (f) { if (map[f] === y) face = f; });
      q = {
        type: type,
        ask: y, face: face, dir: 'which',
        setup: { bottom: bottom, front: front },
        /* 一句话说完：前面是什么、问的是什么（「白底」不重复 —— 底是用户自己选的） */
        lines: [zh[front] + '在前时，' + zh[y] + '在哪一面？'],
        choices: SIDE_FACES.map(function (f) { return { key: f, label: FACE_ZH[f] }; }),
        answer: face,
        why: '底面定了上下的颜色，前面定了左右，其余两面就是对面对。'
      };
      return q;
    }

    if (type === 'side') {
      var dir = rng() < 0.5 ? 'left' : 'right';
      var cyc = ['F', 'L', 'B', 'R'].map(function (f) { return map[f]; });
      var base = pick(rng, cyc);
      var want = neighbour(map, base, dir);
      q = {
        type: type,
        ask: base, dir: dir,
        setup: { bottom: bottom, front: front },
        /* 「X 在前时」在这里也是多余的：左右邻是四个侧面之间**固定**的关系，
           和哪个颜色在前面无关（换个朝向问同一对颜色，答案还是它）。 */
        lines: [zh[base] + '的' + (dir === 'left' ? '左边' : '右边') + '是什么颜色？'],
        choices: choicesOf(base, bottom).map(function (c) {
          return { key: c, label: zh[c], color: HEX[c] };
        }),
        answer: want,
        why: '绕着竖轴相邻四个面的顺序是 前 → 左 → 后 → 右。'
      };
      return q;
    }

    /* tf：给一个陈述，判对错 */
    var x = pick(rng, ORDER);
    var faceOf = null, dirOf = 'left';
    var sideFaces = ['L', 'B', 'R'];      // 不拿「前面」出题：那是废话
    var sf = pick(rng, sideFaces);
    faceOf = sf;
    var truth = rng() < 0.5;
    var claim = map[sf];
    if (!truth) {
      // 造一个假陈述：换成它的左/右邻
      dirOf = rng() < 0.5 ? 'left' : 'right';
      claim = neighbour(map, map[sf], dirOf);
    }
    q = {
      type: 'tf',
      /* 测试和「为什么」都用得上原始信息：说的是哪一面、说的是哪个颜色、对错 */
      face: sf, faceColor: map[sf], claim: claim, truth: truth,
      setup: { bottom: bottom, front: front },
      lines: [zh[front] + '在前时，「' + FACE_ZH[sf] + '面是' + zh[claim] + '」—— 对不对？'],
      choices: [{ key: 'yes', label: '对' }, { key: 'no', label: '错' }],
      answer: truth ? 'yes' : 'no',
      why: FACE_ZH[sf] + '面其实是' + zh[map[sf]] + '（绕着竖轴：前 → 左 → 后 → 右）。'
    };
    return q;
  }

  function check(q, pickKey) { return !!q && pickKey === q.answer; }

  return {
    ZH: ZH, HEX: HEX, OPP: OPP, ORDER: ORDER, FACES: FACES, FACE_ZH: FACE_ZH,
    TYPES: TYPES, scheme: scheme, neighbour: neighbour, choicesOf: choicesOf,
    question: question, check: check
  };
})();
