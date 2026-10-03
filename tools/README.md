# tools/ — 公式校验

`f2l.html` / `oll.html` / `pll.html` 里的公式来自知乎「小狼啊小狼」的 CFOP 系列。
公式本身对，不等于页面没错 —— 有两类问题光靠肉眼看不出来：

- **朝向对不上**（OLL/PLL）：公式没错，但图上的摆法比它要求的摆法差一步 AUF，
  照着图把魔方摆好、直接做那条公式就会做错。必须算。
- **槽位对不上**（F2L）：公式确实能插进某个槽位，但插的不是它旁边那张图画的那个局面。

这套脚本就是干这个的。

## 用法

```bash
python3 tools/verify.py                  # 校验三个页面
python3 tools/verify.py --find 7  oll     # OLL 7 朝向对不上时，去公式库里搜能用的写法
python3 tools/verify.py --find T  pll     # PLL 用字母编号（Aa..Z）
```

输出示例：

```
=== f2l.html （结构校验，不用图） ===
  40 条公式，40 个互不相同的局面，全部通过 ✓

=== oll.html ===
  04  差 3 步 AUF
       图   111 111 010  011111011011
       公式 111 111 010  000000000101
  57 条，5 条有问题
```

需要 `pillow`（只用于读 OLL/PLL 的图；F2L 部分不用图）。


## 原理（OLL / PLL：跟图逐格比对）

1. 用 `cubesim` 把公式**逆运算作用在复原魔方上** —— 得到的就是这条公式所解的局面。
2. 用 `signature` 从图里读出签名：OLL 是「顶面 9 格 + 侧边 12 条划线」，
   PLL 是「12 条侧面色带」。
3. 比对。**只有分毫不差才算通过**，差一步 AUF 也算对不上。

页面上**如果有备选公式**（`oll.html` 还保留这种「主式 + 备选行」的排法），也一并校验：
每条都带着"先转几下的 AUF 标注"，校验时会先做那个 AUF、再做公式，确认能解开图上的局面。

PLL 现在不排单独的备选表了：写法（含单手）都收在 `data/pll.json` 里，
页面上用行尾的**展开键**换，由 `tools/pll_db.py --check` 逐条核（见下）。

## 原理（F2L：不用图，只看公式的结构）

F2L 的图和 OLL/PLL 不是一回事：OLL/PLL 的图是"做完公式后顶面长什么样"，读图即可；
F2L 的图是"公式要解的那个局面"，同一个局面换个 AUF 摆法就能画出好几种样子，
而且图上只有十几个贴纸有颜色（其余是灰底），拿图反推对应关系噪声太大。
（顺带一提，页面表头写着「红 F」「绿 F」—— b 那一列的图是按绿面朝前画的，
和 a 列不是同一个机位，这正是按固定机位读图会读歪的原因。）

所以 F2L 改用一个不需要图的判据：

> `A` 是某个槽位的合法 F2L 插入公式 **当且仅当**
> `S = A⁻¹(r(复原))` 里「下两层除该槽位外全部完好，且恰好只有这一个槽位被破坏」。

道理：F2L 插入公式干的事，就是把某个槽位的一角一棱从顶层归位，同时不碰十字和
另外三个槽位。反过来做，就只应该翻出那一个槽位。纯顶层公式（一个槽位都没动）
和写错到动了别的槽位的公式，都会被这一条挡掉。

再用三条独立判据兜底：

| 判据 | 查什么 | 能抓到的错 |
|---|---|---|
| 镜像 | 每行的 a/b 必须严格互为镜像 | 单边抄错、a/b 互换 |
| 唯一 | 所有公式算出的局面两两不同 | 复制粘贴、串行 |
| 分节朝向 | 「白色朝上」节里角块白贴纸必须真的朝 U | 公式放错小节 |
| 漏读护栏 | 页面声明了编号的行必须都读到公式 | 单元格格式变了导致少验几条 |

`07` / `08` / `09` 是**只有左格、没有右格**的单图形行（`b`、`bf` 为 `null`），
镜像判据对它们无从可对，只验结构；`07` 的左格里有两条并列写法，逐条验。

镜像判据要先补一个坑：在 x=0 平面照镜子时 **R/L 两个颜色也会互换**，
不互换得到的是一个"不存在的魔方"（R 色贴在 L 面上），任何动作序列都变不出来，
于是所有动作的镜像都查不到。补上颜色对换后得到的表符合物理：
`R→L'`、`U→U'`、`F→F'`、`M→M`、`x→x`、`y→y'`。

### 这套判据查不到什么

**查不出「整行对调」**。把两行的 a、b 公式成对换到另一行上，四条判据全都会通过 ——
因为每一行内部仍然自洽，公式本身也仍然合法。要判定"第 N 行画的是不是第 N 个局面"，
只能拿图或原始表来对，而图读不准（见上）。所以这里判「公式对不对」，
不判「编号配得对不对」。

另外，结构判据只保证公式插的是**某个**槽位、且插对了；它不保证插的是图里那个局面。
例如把 04a 的式子填到 14a 的位置上，结构判据照样判 OK —— 因为那确实是一条合法的
FR 槽插入公式。这种错要靠镜像判据（a/b 不再互为镜像）来抓。

## 两个必须注意的坑

**带 `x'` / `y` 的公式，净效果是一个整体旋转。** 所以它解的局面不是 `A⁻¹(复原)`，
而是 `A⁻¹(r(复原))`，其中 `r` 是公式的净旋转 —— 可以从**中心块**读出来
（面转永远不动中心块）。不修正的话，一大半带旋转的 PLL 会被误判成「对不上」。

**给公式库建索引时不能把 4 个 AUF 旋转都收进去。** 那样会匹配到「同一个算法
转过 90°」的版本，看着吻合，实际仍需手动 AUF。`verify.py --find` 只认旋转 0。

## 顺带能查出的问题

- **图的局面非法**：PLL 合法局面的 12 条色带必然 B/L/R/F 各 3 条。
  只交换两条棱（单一对换）在三阶上奇偶性不允许 —— 这种图任何公式都解不了。
  （`pll-09` 初版就是这样，重出后才找到公式。）
- **公式有笔误**：算不出合法局面就说明公式写错了。
  （原表 OLL 07 的 `R' U' R U' R U'2 R` 少一个撇号，补成 `R' U' R U' R' U2 R` 才对。）

## 文件

| | |
|---|---|
| `cubesim.py` | 三阶模拟器：贴纸「坐标 + 法向」模型，转动时旋转受影响小块 |
| `signature.py` | 从导出的图里按比例取样，读出签名（OLL 是顶面 9 格 + 侧边 12 划线，PLL 是 12 条色带） |
| `verify.py` | 主校验脚本（F2L 结构校验 + `--find` 搜索；OLL/PLL 交给各自的库校验） |
| `pll_db.py` | PLL 公式库（`data/pll.json`）的构建 / 校验 / 合并 |
| `oll_db.py` | OLL 公式库（`data/oll.json`）的构建（按 `U^k` 展开 / 去重画面）/ 校验 |
| `oll2_db.py` / `pbl2_db.py` | 二阶 OLL / PBL 库（`data/oll2.json` / `data/pbl2.json`）的 bootstrap 与校验 |
| `emit_pages.py` | 把四个库发布成 `js/plldata.js` + `js/olldata.js` + `js/oll2data.js` + `js/pbl2data.js` + `js/alglist.js`（生成物，勿手改） |
| `formula_images.py` | 出 `img/pll/…` 的角度图（彩色 + 无色昼夜两版）；也提供 OLL 复用的 `paint_net` |
| `pll_geometry.js` | 角度图的箭头/色带置换（改渲染前先读它） |
| `oll_geometry.js` | OLL 俯视图几何：`sig` → 朝向数组 → `cube.js` 的 `buildOll` |
| `oll_images.py` | 出 `img/oll/…` 的图（每个去重画面昼夜两版） |
| `oll2_geometry.js` / `oll2_images.py` | 二阶 OLL：`Cube.buildOll2` 的四格俯视图 + 昼夜两版 |
| `pbl2_geometry.js` / `pbl2_images.py` | 二阶 PBL：`Cube.buildPbl2` 的两层网格 + 双头箭头（256×197） |
| `data/oll.js` `data/pll.js` | 第三方公式库，取自 [Logiqx/cubing-algs](https://github.com/Logiqx/cubing-algs)，仅用于「找不到朝向吻合的写法时」搜索替代 |

## PLL 公式库（data/pll.json）

PLL 的公式、配图、签名都在 `data/pll.json`（`cases → views → algs`），页面不再各存一份：

```bash
python3 tools/pll_db.py --check                 # 全量校验：图签名、角度序列、公式与角度是不是同一个局面
python3 tools/pll_db.py --merge                 # 同一角度下「同一条公式」合并（忽略括号、R'2 ≡ R2）
python3 tools/pll_db.py --build                 # 从页面 / 第三方库重建（一次性 bootstrap；页面字面量没了就跑不动）
python3 tools/emit_pages.py                     # 改完库必须重跑：plldata.js + olldata.js + alglist.js
python3 tools/formula_images.py [--only <编号>]  # 出图（PIL 4× 超采样 → LANCZOS → FASTOCTREE 64 色调色板）
```

判据（`--check`）：①公式是纯顶层公式；②签名能复原**或**箭头模式与本角度逐项一致
（等价判据只比箭头，配色只看相对位置）；③每个角度的彩色图签名 == 库里的 `sig`；
④角度序列 == 按箭头去重的结果（H=1、E/Na/Nb/Z=2、其余 4）。
`img/pll/pll-<编号>-v<角度>[-nc|-nc-night]-256x256.png`，共 73 个角度 × 3 版 = 219 张。

### 单手（OH）：从 jperm 导入

```bash
python3 tools/import_ohpll.py            # 只看计划
python3 tools/import_ohpll.py --apply    # 落盘（之后重跑 emit_pages.py）
```

源数据是抓下来的 `tools/data/jperm-oh-pll.json`（`https://jperm.net/algs/oh/pll` 的 `/lib/ohpll.js`，
21 情况 / 46 条）。规则：先按 `alg_key` 指纹**查重**（命中就把已有写法补上 `OH`，不新增重复条目）；
不认识的新写法按 `pll_db.check` 的判据核一遍 —— **jperm 有 12 条省了末尾的 AUF**
（他们的 Jb 就比库里那条少一个 `U'`），所以会按 无 / `U` / `U'` / `U2` 后缀试，
取第一个「照图摆好直接能用」的；补完 AUF 后常常正好和库里已有的写法对上，于是合并。
最后一条规则：**带 `M` 层的一律只算双手**（单手做 M 不现实）—— 脚本会把这类写法的 `OH` 摘掉、补上 `2H`
（`H` 的 `M2 U' M2 U2 M2 U' M2`、`Z` 的 `y M' U' M2 U' M2 U' M' U2 M2`）。
jperm 的 `H` 那条 `x' R r U2 R' r' u U' R2 U D` 没进来（`u U'` = 中层转，不是纯 PLL）。

## OLL 公式库（data/oll.json）

OLL 的公式、配图、签名在 `data/oll.json`（同样是 `cases → views → algs`）：每个 case 按 `U^k`
转出来的画面**按签名去重**（对称的情况少于 4 个，全库 215 个画面），写法都挂在基准画面 `view 0` 上；
另外带 `groups` 分组和每个画面的 `img-day` / `img-night`：

```bash
python3 tools/oll_db.py --check                 # 全量校验：画面序列、每个画面的 day/night 图签名、公式、四个分组
python3 tools/oll_db.py --build                 # 按 U^k 展开 / 去重画面（公式从现有库取，可反复跑）
python3 tools/oll_images.py [--only <编号>]     # 出 img/oll/oll-<编号>-v<角度>-day|night-256x256.png
```

出图走的是**编辑器的 OLL 俯视图**：`tools/oll_geometry.js` 把库里的 `sig`
（顶面 9 位 + 侧边 12 位）反推成朝向数组 → `cube.js` 的 `buildOll` 出几何 →
`formula_images.py` 的 `paint_net` 上色。签名采样点和 `buildOll` 的候选划线中心**分毫不差**
（`PAD=0.4342`），所以 sig ↔ 模型是唯一确定的，出完再用 `signature.py` 读回来对 `sig` 自检。
两版只差顶面色：day = 紫 `#7E6FC7`、night = 黄 `HEX.yellow`，描边都用 dark 那套浅色。
判据（`--check`）：①画面序列 == 基准局面按 `U^k` 去重算出来的；②每个画面的 day/night 两版图都存在、签名 == `sig`；
③每条写法是合法 OLL、签名正好是基准画面的（AUF 0）、且只挂在基准画面上；
④四个分组（十字 7 / 单点 8 / 一字 15 / 拐角 27）覆盖 1..57。全库 57 情况 / 215 画面 / 430 张图。

## 二阶两个库（data/oll2.json / data/pbl2.json）

二阶 OLL 存的是四个角的朝向（`sig` = 4 个 `u/b/f/l/r`），按 `U^k` 去重后有 26 个画面（h 只有 2 个），
每个画面昼夜两版；**写法挂在自己所属的画面上**（antisune 的 `R' U' R U' R' U2 R` 挂 v3、sune 的 `L U L' U L U2 L'` 挂 v2），页面上换过去时图也切到那个画面；二阶 PBL 没有颜色签名，存两层各 4 个角的置换（`state`），
**是固定视角：`cases → algs`，没有 `views` 这层**，一个情况就一张图。
两页的行、图、公式都由库生成，页面里只留渲染脚本：

```bash
python3 tools/oll2_db.py --check              # 7 个情况 / 26 画面 / 9 条公式：画面序列 + 图 ↔ 公式 ↔ sig
                                              # 写法编号（algs[].no）在 case 内唯一、跨画面连续 1..n
python3 tools/oll2_db.py --build              # 按 U^k 展开 / 去重画面
python3 tools/pbl2_db.py --check              # 5 个情况（固定视角，没有 views）：公式的置换 ↔ state ↔ 编号（Adj / Diag）
python3 tools/oll2_images.py [--only <情况>]  # 出 img/oll2/<情况>-v<角度>-day|night-256x256.png
python3 tools/pbl2_images.py [--only <情况>]  # 出 img/pbl2/<情况>_day|night-256x197.png（PBL 不做旋转图）
```

两个 `--build` 现在都从**现有库**取公式（页面已经没有静态表格了），可以反复跑；
二阶 OLL 的 `--build` 会按 `U^k` 重排画面，二阶 PBL 的只重建那一个基准画面。
两页的行尾都有**展开键**（和 PLL / OLL 同一套）：候选就是这个情况的所有写法 ——
现在库里每个情况只有一条，所以键是灰的；往库的 `algs` 里加写法后重跑 `emit_pages.py` 就自动亮。

## 教程步骤图（tutorial_geometry.js + tutorial_paint.py + tutorial_images.py）

`tutorial/` 里那几张图是**从模拟器局面生成**的，别手改：

```bash
python3 tools/tutorial_images.py          # 出全部图（可跟图名只出某一张）
```

三段流水线：

1. `tutorial_images.py` —— 定义教学局面（从复原态直接改某面的贴纸：不关心的格子
   填 `X`，渲染时自然变成 gray，和 f2l/oll 那批图一个约定；要看白面就用
   `CubeSim.apply(st,'x2')` 整体转过来）；
2. `tutorial_geometry.js`（node）—— 局面 → U/F/R 三面状态 → cube.js 的多边形几何（JSON）。
   面映射用的是给计算器拍照时和 DOM 逐格对拍过的那份变换（U 上、F 左前、R 右前）；
3. `tutorial_paint.py` —— PIL 4 倍超采样画 256px、256 色调色板 PNG（教程图没跟着降到 64 色）。

> 为什么不直接让 cube.js 出 SVG 再栅格化：环境里 ImageMagick 的内置 SVG 渲染器
> 画这种图会糊成一团，所以改成「出几何、自己画」。
