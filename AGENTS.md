# AGENTS

## 0. 一句话

**Sixfold**：三阶 / 二阶 CFOP 的网页工具（公式页、计算器、计时器、练习、教程）。纯 `HTML/CSS/JS`，
**没有构建、没有依赖、没有 ESM**，直接 `file://` 打开就能用。界面中文。

- 本地路径：`/home/louhc/pyworkspace/sixfold`
- 远端：`git@github.com:Louhc/sixfold.git`，分支 `main`

## 1. 硬性约定（先看这条）

1. **没听到「提交 / 上传」就不要 `git commit` / `git push`。** 工作区长期是一堆 staged 改动，这是正常的。
2. 页面是 `file://` 打开的：**不能 `fetch` JSON**、不能用 `import`/`type=module`。
   共享代码一律普通 `<script>`（UMD 风格全局变量）。
3. **主题色只写在 `theme.css` 的 CSS 变量里**，页面里不写死颜色（`--accent` / `--line` / `--panel` / `--chip` / `--muted` / `--accent-text`）。
4. 命名/文件移动后 **全仓 grep 引用**（`README.md`、`index.html`、`tutorial-*.html`、`calc.html`、`test/*`、`tools/*` 都可能有）。

## 2. 目录

| 位置 | 是什么 |
|---|---|
| `index.html` `f2l.html` `oll.html` `pll.html` `oh-pll.html` `oh-oll.html` `oll2.html` `pbl2.html` | 公式页 |
| `calc.html` `timer.html` `practice.html` `editor.html` `tutorial-*.html` | 计算器 / 计时器 / 练习 / 编辑器 / 教程 |
| `js/nav.js` `css/nav.css` `css/theme.css` `js/cube.js` `js/cubesim.js` `js/cubesim4.js` `js/timer.js` `js/alglist.js` | 共享脚本与样式 |
| **`data/pll.json`** / **`data/oll.json`** / **`data/oll2.json`** / **`data/pbl2.json`** / **`data/f2l.json`** | **公式数据库（唯一数据源）**：PLL 21、OLL 57（带 `groups` 分组 + `img-day`/`img-night`）、二阶 OLL 7、二阶 PBL 5（**固定视角，没有 `views`**；存两层置换 `state`）、F2L 39（**固定视角 + 分节**：`sections` 管三节与每行左右两格，`cases` 管一情况一图多条写法，**不做转体**） |
| `js/plldata.js` / `js/olldata.js` / `js/oll2data.js` / `js/pbl2data.js` / `js/f2ldata.js` / `js/alglist.js` | **生成物**，不要手改（`tools/emit_pages.py` 产出；`alglist` 七个键全部来自库） |
| `tools/data/*.js` | 导入的第三方公式库（`pll.js` / `oll.js`），不是我们的数据 |
| `tools/data/jperm-*.json` | 从 jperm 抓下来的清单：`jperm-oh-pll.json`（单手 PLL，21/46）、`jperm-pll.json`（双手 PLL，21/55）、`jperm-oll.json`（OLL，57/98）、`jperm-oh-oll.json`（单手 OLL，57/91）—— `tools/import_jperm.py` 的输入 |
| `img/pll/…` | PLL 生成的角度图（213 张 = 71 角度 × 3 版；Na/Nb 只留基准画面） |
| `img/oll/…` | OLL 的图（215 个去重画面 × 昼夜两版 = 430 张，`tools/oll_images.py` 走编辑器几何产出） |
| `img/oll2/…` | 二阶 OLL 的图（26 个去重画面 × 昼夜两版 = 52 张 256×256，`tools/oll2_images.py` 产出） |
| `img/pbl2/…` | 二阶 PBL 的图（5 种情况 × 昼夜两版 = 10 张 256×197，**不做旋转图**，`tools/pbl2_images.py` 产出） |
| `img/f2l/…` | F2L 的图（39 张 256×258，一情况一张、固定视角；暂未接生成器） |
| `tools/*.py` `tools/*.js` | 生成与校验工具 |
| `test/*.js` | node 测试（见 §8） |

## 3. 公式数据库

`data/pll.json` / `data/oll.json` 三层：`cases → views → algs`

```json
{"set":"pll","v":1,"cases":[{
  "id":"Aa","no":1,"name":"Aa-Perm","prob":"…","descEn":"…",
  "views":[{"view":0,"frame":"","sig":"…","img":"img/pll/pll-Aa-v0-256x256.png",
            "img-nc-day":"…","img-nc-night":"…",
            "algs":[{"no":1,"alg":"x' R2 D2 (R' U' R) D2 (R' U R')","moves":[…],"n":9,
                     "uses":["2H","OH"],"verified":"…","tags":["preferred"]}]}]}]}
```

- `view` = 同一情况按 `U^k` 转出来的**画面**（0..3，按签名/箭头去重，对称情况只有 1/2 个；
  PLL / 二阶 OLL 都是这样，**写法挂在自己所属的画面上**（比如二阶 OLL 的 `antisune` v3 挂着
  `R' U' R U' R' U2 R`、`sune` v2 挂着 `L U L' U L U2 L'`；**三阶 OLL 也一样** ——
  开头带 `y`/`y'` 的写法天然属于别的画面，比如 jperm 的 `y' F R U R' U' F' f R U R' U' f'` 归到 **v1**）；
  **二阶 PBL 是固定视角：`cases` 下面没有 `views` 这一层**，`state` / 图 / 写法直接挂在 case 上）
- `sig` = PLL 是 12 条侧面色带的读数，OLL 是 `[顶面 9 格, 侧边 12 划线]`（`tools/signature.py` 的采样约定），
  二阶 OLL 是四个角的朝向（`u/b/f/l/r`）；二阶 PBL 没有颜色签名，存的是两层各 4 个角的置换 `state`。
  **只用来渲染/校验，不是身份**
- `uses` = `["2H"]` / `["OH"]` / `["2H","OH"]`（共享公式两个都要标）。**OLL 库里两种都有**：
  双手页（`oll.html`）只显示 `2H` 的，单手页（`oh-oll.html`）只显示 `OH` 的（一个情况一条 OH 都没有时才回退双手）
- `tags` = `["preferred"]`（双手首选）/ `["ohpll-preferred"]`（**单手 PLL 首选**：单手页与 `alglist.ohpll` 里排最前、
  默认显示）/ `["oholl-preferred"]`（**单手 OLL 首选**：`oh-oll.html` 与 `alglist.oholl` 默认显示的那条）
- `algs[].no` = **写法在 case 内的编号**：同一个 case 里不同写法编号一定不同、连续 1..n
  （**跨画面连号**：E 的 view 0 是 1/2/3、view 1 那条就是 4 —— `pll_db.check` 盯着这条）
  （按画面顺序 → 画面内顺序排；展开面板上显示的就是它，所以能用「Ga 的 2 号」这种说法指代）
- OLL 另外有 `groups`（页面四个分组）和每 case 的 `group`，图字段是 `img-day` / `img-night`
- 工具：
  - `python3 tools/pll_db.py --build` —— 从页面与第三方库重建库（**只能在页面还留着 `SECTIONS` 字面量时跑一次**，是 bootstrap）
  - `python3 tools/oll_db.py --build` —— 按 `U^k` 展开 / 去重画面（公式从现有库取，可反复跑）
  - `python3 tools/pll_db.py --check` / `tools/oll_db.py --check` —— 全量校验（见 §8）
  - `python3 tools/pll_db.py --merge` —— 同一角度下"同一条公式"合并（忽略括号、`R'2`≡`R2`）
  - `python3 tools/emit_pages.py` —— 发布 `plldata.js` + `olldata.js` + `alglist.js`（改完库**必须**重跑）
  - `python3 tools/formula_images.py [--only <编号>]` —— 生成 `img/pll/…`
  - `python3 tools/oll_images.py [--only <编号>]` —— 生成 `img/oll/…`（`tools/oll_geometry.js` 走 `cube.js` 的 OLL 俯视图）
  - `python3 tools/import_jperm.py [--set oh,2h,oll] [--apply]` —— 把 jperm 的清单并进库（**一次性导入**，
    不是常规管线；按 `alg_key` 查重合并、必要时补 AUF、开头带 y 的化到画面里去，见 §4.4 / §4.7）
  - `python3 tools/f2l_db.py --build` —— 从 `f2l.html` 的 `SECTIONS` 字面量 bootstrap 出 F2L 库（**一次性**）
  - `python3 tools/f2l_db.py --check` —— F2L 库校验（结构 + 编号 + 图存在且 256×258；见 §8）
  - `python3 tools/oll2_db.py --check` / `tools/pbl2_db.py --check` —— 二阶两库校验（见 §8）
  - `python3 tools/oll2_db.py --build` —— 按 `U^k` 展开 / 去重画面；`tools/pbl2_db.py --build` —— 重建单画面
  - `python3 tools/oll2_images.py` / `tools/pbl2_images.py [--only <编号>]` —— 生成 `img/oll2/…` / `img/pbl2/…`
    （`oll2_geometry.js` 用 `Cube.buildOll2`、`pbl2_geometry.js` 用 `Cube.buildPbl2`，PBL 是非正方形画布 256×197）

## 4. 语义约定（最容易搞错的地方）

1. **view 不是整体转体**：是"同一个情况换个画面"= 顶层 `U^k`。整体 `y/y'/z` 会把情况转出标准视角，得到垃圾。
2. **色带和箭头用两套置换**：色带用本角度的状态置换（要和 `sig` 对上）；箭头用被顶层槽位映射 σ 共轭过的置换
   （这样画出来才是"这个角度的图"）。改动渲染前先读 `tools/pll_geometry.js`。
3. **等价判据：只比箭头**（用户明确拍板）。两组箭头模式只要旋转后一致，就视为同一个情况；
   "配色只看相对位置"= 和看箭头是一回事。所以校验是
   **「签名能复原」** 或 **「箭头模式与本角度逐项一致」**，二者之一即通过。
   （反过来的情形也有：**颜色的相对位置一样、箭头画出来不一样** —— Na/Nb 的两种画面就是，
   按用户拍板算同一种画面，只留基准画面，见第 5 条。）
4. **公式不带 AUF**；只有 `Na` / `Nb` 那两条保留自带的首个 `U`/`U'`（去掉就解不出任何标准角度）。
   **写法也不带开头的整体转体 `y` / `y'` / `y2`**：开头带 y 的写法是有语义的，但那正说明它属于**另一个画面** ——
   画面已经表达了这次转体，公式里再写一遍是多余的（用户拍板）。导入/清理时 `strip_lead_y()` 会去掉它、
   把写法搬到对应的画面去；**去掉之后哪个画面都对不上的，直接丢掉**（jperm 的 Z `y M' U' M2 U' M2 U' M' U2 M2`
   就是这样没的）。`pll_db.check` / `oll_db.check` 会盯着这条。
5. 图上角度的落位（规律，不是特例）：`F → 角度3`、`Ja → 角度2`、`Z → 角度1`。
   **`Na` / `Nb` 只留基准画面**（用户拍板）：它们的两种画面**箭头画出来不一样，但颜色的相对位置一样** ——
   判「是不是同一个画面」看的就是颜色的相对位置（箭头只是画出来的效果）。原来挂在另一种画面上的写法
   搬到基准画面时补一个 AUF（Na 那三条：末尾 `U'` ×2、开头 `U` ×1，见 `verified` 字段），
   `pll_db.check` 盯着「Na/Nb 必须只有 1 个画面」。
6. 单手（OH）写法：**每个情况都有自己的单手写法**（21/21，回退分支还留着但用不到），
   一共 55 条（`data/pll.json` 87 条写法里带 `OH` 的）。**带 `M` 层的一律只算双手**（单手做 M 不现实，
   用户拍板：`H` 的 `M2 U' M2 U2 M2 U' M2`、`Z` 的 `y M' U' M2 U' M2 U' M' U2 M2` 都只标 `2H`）。
   首选（OH 页与 `alglist.ohpll` 默认显示的那条）
   是标了 `tags:["ohpll-preferred"]` 的；用户逐条定过的是：
   - `Ga`：`R2 u R' U R' U' R u' R2 y z U' R U`（首选）；另有 `R2 U R' U R' U' R U' R2 D U' R' U R u' U`、
     `z U2 r U' R U' R' U r' U2 x' U' R U`（挂在 **v2**）。
     2 号 `(R2 u) (R' U R' U' R u' R2) y' (R' U R)` 合并重复项后是 `["2H","OH"]`。
   - `Gb`：`(R' U' R) y (R2 u) (R' U R U') (R u' R'2)`（**`["2H","OH"]`** + 首选 ——
     它同时也是双手写法，2H 不能抹掉）；1 号 `(R' d' F) (R2 u) (R' U) (R U' R u' R2)` 只有 `["2H"]`。
   - `Gc`：`R2 u' R U' R U R' D x' U2 r U' r'`（首选）；**1 号现在也是 `["2H","OH"]`**（jperm 也把它当单手），
     2 号 `(R2 u' R U' R) (U R' u R2) y (R U' R')` 合并重复项后同样带 OH。
   - `Gd`：1 号、2 号都带 OH（`["2H","OH"]`；2 号是合并同一条重复项后取并集）。
   - 其余情况的首选来自原来那份单手清单；**jperm 的 OH PLL 已经并进来**（见下），作为各情况的备选。
7. **jperm 的清单**用 `python3 tools/import_jperm.py [--set oh,2h,oll] [--apply]` 并进库：
   - `oh`（`/algs/oh/pll`，21 情况 / 46 条）、`2h`（`/algs/pll`，21 / 55）→ `data/pll.json`；
   - `oll`（`/algs/oll`，**57 情况 / 98 条**）→ `data/oll.json`：按 `alg_key` 查重（23 条已有）、
     新增 75 条（62 → **137 条**）；**开头带 `y`/`y'` 的写法去掉 y、按去掉后的写法归到 v1/v2/v3**，
     不往 v0 硬塞 `U`，也不留开头的 y（用户拍板）；`oll_db.py --check` 逐条核「签名 == 它所在画面的 sig」。
   - `oholl`（`/algs/oh/oll`，**57 情况 / 91 条**）→ `data/oll.json`：65 条和库里已有的一模一样（于是补上 `OH`
     标签，变成 `["2H","OH"]`）、新增 25 条（137 → **162 条**）；每个情况的第一条打 `tags:["oholl-preferred"]`
     （单手 OLL 页默认显示的那条）。**用户另外指定过**（基本都是「前面加 `z`，按 z 转到新朝向」——
     完整规则：**`L→U`、`U→R`、`R→D`、`D→L`、`F`/`B` 不变（撇号照搬），宽转 `l`→`u`、`r`→`d`，最前面加 `z`**；
     这就是「绕 F-B 轴转一下、把公式用新朝向重写一遍」，落点仍在同一个画面 —— 所以左右手系各得其所：
     `l` 系公式变成 `u` 系、`r` 系公式变成 `d` 系）：
     - **5 号**：2 号（`l' U2 L U L' U l`）换成 **`z u' R2 U R U' R u`**（L→U、U→R，宽转 `l`→`u`，撇号照搬），
       并作为单手首选；`uses` 保持 `2H+OH`。
     - **7 号**：加上 **8 号 2 号（`r' U' R U' R' U2 r`）的镜像的 z 变换** `z u R U' R U R2 u'`
       （镜像 = R↔L；再套带翻的 L→U' / U→R'、宽转 l→u'），作为单手首选 —— 这一条**只算单手**（`uses=["OH"]`）。
     - **28 号**：1 号（`(r' U' R U) M' (U' R' U R)`）**不动**（仍然是 `2H` 首选）；
       另加一条把 `M'` 展开成 `R' r` 的写法 **`(r' U' R U) R' r (U' R' U R)`**
       （`M' = R' r`，两条作用在同一个局面上结果完全相同）作为单手首选 —— 这一条**只算单手**（`uses=["OH"]`）。
     - **9 号**：加上 **10 号 2 号（`R U R' U R' F R F' R U2 R'`）的镜像的 z 变换**
       **`z U' R' U R' U F' U' F U' R2 U`** 作单手首选（挂在 **v3**，因为算出来就落在那个画面）
       —— 只算单手（`uses=["OH"]`；原来那条单手首选只是摘掉标签）。
     - **11 号**：加上 **12 号唯一那条单手写法（`r R2 U' R U' R' U2 R U' r' R`）的镜像的 z 变换**
       **`z u' U2 R U' R U R2 U' R u U'`** 作单手首选 —— 只算单手（`uses=["OH"]`；原单手首选只是摘掉标签）。
     - **29 号**：加上 **30 号唯一那条单手写法（`F U (R U2 R' U') R U2 R' U' F'`）的镜像的 z 变换**
       **`z F' R' U' R2 U R U' R2 U R F`** 作单手首选（镜像 = R↔L 并翻方向，再套上面的 z 规则）
       —— 只算单手（`uses=["OH"]`；原来那条单手首选只是摘掉标签）。
     - **42 号**：与 29 号同一套 —— 加上 **41 号唯一那条单手写法（`(R U R') (U R U2 R') F (R U R' U') F'`）
       的镜像的 z 变换** **`z U' R' U R' U' R2 U F' U' R' U R F`** 作单手首选 —— 只算单手
       （`uses=["OH"]`；原来那条单手首选只是摘掉标签）。
     - **47 号**：1 号 `F' (L' U' L U) (L' U' L U) F` **撤掉 `OH`**（只剩 `2H`，仍是双手首选）；
       另加它的 z 变换 **`z F' U' R' U R U' R' U R F`** 作单手首选 —— 只算单手（`uses=["OH"]`）。
     - **49 号**：1 号 `(l U') (l'2 U l2 U l'2) (U' l)` 仍作双手首选；另加它的 z 变换
       **`z u R' u'2 R u2 R u'2 R' u`** 作单手首选 —— 只算单手（`uses=["OH"]`）。
     - **50 号**：**只**把 1 号 `(r' U) (r2 U' r2 U' r2) (U r')` 设为单手首选
       （它本来就是双手首选，于是两个首选都在它身上；没有新加写法）。
     - **54 号**：1 号 `(l U) (L' U L U') (L' U L U2) l'` 仍作双手首选；另加它的 z 变换
       **`z u R U' R U R' U' R U R2 u'`** 作单手首选 —— 只算单手（`uses=["OH"]`）。
     - **52 号**：加一条 **`R' U' R U' R' U F' U F R`**（落在 52 号 v0），
       同时当**双手首选 + 单手首选**（`uses=["2H","OH"]`）——原来那两条首选只是摘掉标签、写法留着。
     - **36 号**：1 号 `(R U'2 R'2 F2) (r U' R U'2) r' F` 加上 `OH`（变成 `2H+OH`），
       并作为单手首选（原来那条单手首选只是摘掉标签、写法留着）。
     - **38 号**：1 号 `(L' U'2 L2 F'2) (l' U L' U2) l F'` 本身仍是 `2H` 首选；
       另加它做 **z 变换** 后的写法 **`z U' R'2 U2 F'2 u' R U' R2 u F'`**
       （L→U、U→R、F 不变，宽转 `l`→`u`，撇号照搬，前面加 `z`）作为单手首选 —— 这一条**只算单手**（`uses=["OH"]`）。
     - **39 号**：加上 **40 号 1 号（`(R' F) (R U R' U') F' (U R)`）的镜像的 z 变换**
       `z U F' U' R' U R F R' U'`（镜像正好就是 39 号 1 号；再套「L→U、U→R、F 不变，撇号照搬」+ `z`），
       作为单手首选 —— 这一条**只算单手**（`uses=["OH"]`，用户指定；原单手首选只是摘掉标签、写法留着）。
     - **14 号**：单手首选换成 **13 号那条的镜像**
     `z F' R' U' R U2 F U' R' U' R U` —— 做法是「最前面加一个 `z`，把 R↔U / L↔D 互换并翻方向」
     （`F U R U' R2 F' R U R U' R'` 就是 13 号那条，镜像后正好解 14 号）。
     **还清过 15 号**：去掉 3 号（`l' U' l L' U' L U l' U l`，L 版），并把 1 / 2 号合并成一条 ——
     `(r' U' r) (R' U' R U) (r' U r)` 与 jperm 的 `r' U' R' r U' R U r' U r` 本质上是一回事
     （同一情况、同一个 AUF，只是 `r R'` / `R' r` 的写法不同）；合并后这条同时是双手首选 + 单手首选。
     **还动过 8 号**：去掉 3 号（`l' U' L U' L' U2 l`），并把 15 号 1 号公式的**逆**
     `(r' U' r) (U' R' U R) (r' U r)`（倒序 + 逐步取反）加到 8 号 v0 —— 8 和 15 是互逆的两个情况，
     所以 15 号那条的逆正好解 8 号；这条同时标 `2H` + `OH`（用户指定）。
     之后又把去掉的那条**改写成 z 开头**加回 **v2**：`z u' R' U R' U' R2 u` —— 规则是
     「L→U、U→R（撇号照搬），宽转 `l`→`u`」，前面加 `z`；它和原来那条落在同一个画面（8 号 v2），
     同样标 `2H` + `OH`。
   `pll` 那边两份（oh + 2h）合计把库从 46 条加到 **86 条**（其中带 `OH` 的 54 条。
   用户逐条清过 F：删掉那条和单手首选只差一个 `R'` 的（原 4 号），
   又把原 1 号里多出来的一对互相抵消的 `F' F` 约掉、和 2 号合并成了一条），
   该补 AUF 的按末尾 / 开头补上、开头带 y 的按上面第 4 条化到画面里去。
   下面这段是 OH PLL 那套的细节：
   按 `alg_key` 查重（7 条和库里已有的同一条合并，其中 5 条顺带补上 `OH`）、32 条新增；
   **12 条要在末尾补一个 AUF 才「照图摆好直接能用」**（jperm 那边省了，比如他们的 Jb 就比我们少一个 `U'`），
   补完之后往往正好和库里已有的写法对上、于是合并；**带 `M` 的条目导入后会自动改成只算双手**（脚本第 5 条规则）。
   jperm 的 `H` 那条 `x' R r U2 R' r' u U' R2 U D`
   **没进来**：里面 `u U'` 是中层转（E'），在我们模型里不是纯 PLL 公式。脚本可重复跑（再跑全是 dup，不写盘）。

## 5. 图片

- PLL 命名：`img/pll/pll-<编号>-v<角度>[-nc|-nc-night]-256x256.png`
  - `pll-Aa-v0-256x256.png` 彩色
  - `-nc-` 无色（只有描边 + 箭头，深色描边）
  - `-nc-night-` 无色夜版（**描边白色**、箭头黄 `#FFE600`）
- 二阶 OLL 命名：`img/oll2/<情况>-v<角度>-day|night-256x256.png`（角度是去重后的画面序号，h 只有 2 个）
- 二阶 PBL 命名：`img/pbl2/<情况>_day|night-256x197.png`（只有基准画面；两层网格 + 双头箭头，没有配色；**不做旋转图**）
  （情况名就是库里的 id：`h/pi/antisune/sune/l/t/u`、`dd/ad/aa/a/d`）
- OLL 命名：`img/oll/oll-<编号>-v<角度>-day|night-256x256.png`（编号补零成两位；角度是去重后的画面序号）
  - `day` 紫顶 `#7E6FC7`、`night` 黄顶 `HEX.yellow`；两版只差顶面色，都用 dark 那套浅色描边
  - 几何走编辑器的 OLL 俯视图（`cube.js` 的 `buildOll`）：`tools/oll_geometry.js` 把 `sig` 反推成
    朝向数组 → 出几何 → `formula_images.py` 的 `paint_net` 上色（**没有箭头**，`cfg` 里也没有 `arrow/head`）
- 生成管线：PIL 4× 超采样 → `LANCZOS` 缩放 → `quantize(colors=64, method=Image.FASTOCTREE)` → palette PNG
  （`paint_net(..., colors=64)`；这些图就几块纯色 + 抗锯齿过渡，64 色比 256 色小两成，签名/颜色读数不变）。
  **RGBA 只能用 `FASTOCTREE`**（别的 method 会直接报错）。
- 描边/箭头宽度都跟着编辑器配置（`cube.js` 的 `PLL_CFG` / `OLL_CFG`），改配置要重生成图。

## 6. 六个公式页的交互约定（PLL / OH-PLL / OLL / OH-OLL / 二阶 OLL / 二阶 PBL 同一套）

- **首屏一条公式**：CSS 兜底（`td.f br{display:none}` + `code ~ code{display:none}`）+ 脚本按选中项重建单元格。
- **展开键在最右一列**（`col.pick` 46px + `td.pickCell`），图标是三行"圆点 + 圆头条"的内联 SVG。
- **无边框**（`border:0`、悬停只提亮变主色）；**每个展开键都能点**（用户要求：只有一条写法也点得开 ——
  面板最后一行是「自定义…」，可以在那儿自己填一条）。`.off` 那套只留给历史存档 / 兜底，脚本里不再有
  「只有一条写法就 return」那段（`test/links.js` 会扫七个页，钉住这一条）。
- **一律用 `<button type="button">`**，不要 `href="#"` —— 脚本一旦没挂上，`href="#"` 会让它表现得像"回到顶部"。
- **面板**：每条候选 = 缩略图 + **编号（`.pickbox .idx`）** + 公式文本。编号取自库里 `algs[].no`
  （`noOf(id, alg)`；case 内唯一，不同写法不同号），不是面板里的顺序号
  （PLL 还会在后面挂 `2H`/`OH` 标签）；`position:absolute` + 文档坐标（跟页面滚）；下方放不下就翻到按钮上方（加 `.up`）；
  点别处（捕获阶段）/ `Esc` / 窗口缩放收回；**滚动不收回**。
  **再点同一个展开键收起**（捕获阶段的 `closeIfOutside` 必须先跳过「正在展开的那个键」，
  否则它先把 `open` 清掉，键的处理就变成重新打开）；展开时键加 `.on`（底色 + 主色）；
  开合用 `opacity/visibility/transform` 过渡（**不要用 `display:none` 切换** —— 那样没法过渡）。
- **打印**：那一列整列不印（`td.pickCell` 隐藏 + `col.pick{width:0}`，否则留个空列）；
  页头那三个图标键也要一起藏（`.toolbtn` 要写进 `@media print` 的隐藏名单，用户报过「打印出来多了几个键」）；
  另外 **`nav.js` 会在打印时把 `img` 里带 `night` 的那版临时换成 `day`**（`data-theme` / 配色不动），
  打完（`afterprint`）再放回去 —— 打出来的 PDF 一定是白天版；代价是打印对话框开着时屏幕也显示白天版。
  映射写在 `printAsDay` 的 `dayOf()`：PLL 无色夜 `-nc-night-` → `-nc-`，其余 `-night-` → `-day-`。
  并且打印键 / `Ctrl+P` 会先把 lazy 的图催成 eager、`decode()` 完再 `window.print()`
  —— 不这么做，屏幕外的图根本没加载，纸上是空框。
- **恢复存档要先校验**：`cube-pick:<页>:<编号>` 里可能留着旧数据（某条后来被撤了 `OH`、或整条删了），
  只有「这一页现在能显示的写法」才恢复（`usable(id, alg)`：双手页只认 `2H`、单手页认 `OH`（没有就回退 `2H`）、
  OLL / 二阶 OLL / PBL 认本 case 的写法）—— 否则单手页会把一条非 OH 公式当默认显示出来（踩过）。
- **候选**：面板列出这个情况的**全部**写法，**包括这一行正在显示的那条**（它带 `.cur` 高亮 ——
  用户要求：列表里要看得见当前用的是哪条）；比较用 `algKey()`（忽略括号与空白），
  **去重的写和读要用同一个键**；数据优先取库，行内写法兜底（库没加载也能用）。
  候选按"它属于哪个画面"配图（`viewOfAlg()`）。**展开键一律能点**（不再按「有没有别的写法」判亮灰 ——
  只有一条写法也点得开，面板最后一行是「自定义…」）。
- **切主题 / 恢复存档时的配图**：必须按"这一行现在那条写法"反查画面（`viewOfAlg(id, code)`），
  **不能只按下标取 `views[0]`** —— 二阶 OLL 踩过：选了 v3 的写法，一切昼夜就被打回基准画面。
- **二阶两页也接了这套**（`oll2.html` / `pbl2.html`）：三列（图 / 公式 / 展开键）、**没有「图 / 公式」表头行**，
  候选从 `data/oll2.json` / `data/pbl2.json` 读；库里现在每个情况只有一条写法，但**键照样能点**
  （可以点开加自定义公式），以后往库里加写法、重跑 `emit_pages.py` 就多出候选。
  持久化键是 `cube-pick:oll2:<编号>` / `cube-pick:pbl2:<编号>`。
- **OH-OLL / OH-PLL** 两页左边也挂了目录（`<nav class="side" aria-label="单手公式目录">`：
  OH-OLL · 57 种 / OH-PLL · 21 种，当前那页高亮），位置 / 窄屏收起 / 打印不印和「三阶公式」「二阶公式」
  那两条**逐字一样**（`left:max(14px, calc(50% - 616px))` + `@media (max-width:1240px)`，正文都是 880 宽）。
- **OH-OLL**（`oh-oll.html`）：**单手页**，和 `oh-pll.html` 同一套 —— 每个情况显示标了 `OH` 的写法
  （`oholl-preferred` 排最前），一个情况一条 OH 都没有时才回退双手那条；展开键里换的是这个情况的**其它单手写法**；
  存档键 `cube-pick:oh-oll:<编号>`。这一页和 `oh-pll.html` 合成导航条上的「单手公式」一组
  （分组记忆键 `cube-last:oh-oll.html`，两页都写它）。**反向也成立**：`oll.html` 是双手页，
  首屏 / 候选 / 存档校验只认 `2H` 的写法（库里现在也有 `OH` 专属的）。
- **F2L**（`f2l.html`）：**不做转体** —— 一个情况一张固定视角的图，没有画面层；表格是「两列情况」
  （每格 = 图 + 公式 + 展开键），页面把 `data/f2l.json` 的 `sections` + `cases` 铺出来。
  **首屏一格只显示第一条写法**，其余在展开键里换（`cube-pick:f2l:<编号>`；库里 `02a` 有三条、`07` 两条，
  别的只有一条，但每个键都能点）。写法上带 `uses` 的（比如 02a 那两条是 `2H` + `OH`）**只存在库里**，
  **候选行不显示这个标签**（用户要求：展开公式后面不要挂 2H/OH —— 那是 PLL 页的习惯，F2L 页面保持干净）。
- **计算器（`calc.html`）/ 练习页**：二阶 / 三阶 / 四阶**各有一份自己的现场** ——
  局面、历史、步骤条、输入框都分开存（`ORDERS`），切阶数只是把这一份收起来、把那一份摆出来。
  历史是**一条从 `histBase` 开始的链**（回溯 = 从 `histBase` 把 0..i 条重做一遍）：
  一般是复原态，但从公式表点 ↗ 跳过来时 `histBase` 是「公式要解的局面」（跳转先做一遍公式的逆摆出来）
  —— 这样点历史 + 回到开头看到的是那个局面，而不是「从复原态执行这条公式」（用户报过）。
  存档 `calc-state-v1` 也是三份一起存（`orders` + 顶层的 `dur` / `skip`，`frames` 由 `base` + `steps` 重算）。
- **每个公式页表头都有三个图标键**（都在打印键左边，纯图标 + `title`/`aria-label`）：
  `#algimport` 导入 CSV · `#algexport` 导出 CSV · `#algreset` 恢复默认公式 ·
  `#algclear` 清空自定义公式（四个）——四个收在一条 `.apbar` flex 行里，顺序：
  清空 / 恢复 / 导出 / 导入；桌面这条行绝对定位（`top:16px;right:116px` = 打印键那 80+28 再留 8px 间隙），
  **窄屏（`max-width:900px`）整条挪到「打印 / 主题」下面当第二排**（`top:52px;right:16px` 右对齐，
  `header` 加 `padding-bottom:78px` 让地方，`.opts` 显示颜色开关推到 `top:96px`）——
  几个键平铺在最右边会压住中间的标题，掉到标题下面又会把标题挤走，**贴到打印键下面**这两个问题都没有
  （用户定稿）。
  ⚠ 这条媒体查询在模块**注入的 `<style>` 里**，所以 **`mountTools()` 一开头就必须调 `css()`** ——
  以前只有打开「自定义…」弹窗才注入，结果窄屏规则一直没生效（按键一直压着标题，查了好几轮才找到）。
  ⚠ **页面原有的 `#printbtn` / `#themebtn` 不要搬进这条行**：它们在页面 CSS 里是绝对定位
  （`.printbtn{right:80px}` / `.themebtn{right:16px}`），搬进去会脱出 flex 行、叠到「显示颜色」开关上
  （试过一次，撤了）；它们本来贴在右上角，也不会压标题。
  逻辑全在 **`js/algpicks.js`**（普通 `<script>`，七个页各引一次、各调一行 `AlgPicks.mountTools('<页>', {...})`）——
  **这个 `<script>` 必须排在页面自己的脚本之前**：页面那句 `mountTools` 有 `typeof` 保护，
  顺序反了会被静默跳过，表现就是「这一页没有那几个按键」（`oh-pll.html` 踩过，`test/links.js` 现在盯着顺序）：
  - 存档：`cube-pick:<页>:<情况>`（这一行选中的那条，沿用原键）+ `cube-custom:<页>:<情况>`
    （自定义公式 `[{alg, view}]` —— 自定义的 view 是用户挑的，不检查对错）；
  - CSV 四列 `页,情况,公式,view`（view 留空按 0）：导入**按表头认列**（分隔符 `,` / `;` / 制表符都认 ——
    Excel 中文区域就存分号）；没表头时按列数猜（四列 = `页,情况,公式,view`，两列 = `情况,公式`）；
    **匹配顺序（用户定稿）**：① 库里**有**这条（只按 `algKey` 比，忽略括号空白，**不看 view**）→
    和直接点候选一样：选中它、用**库里那条的原文与画面**，**绝不新增自定义**（CSV 里 view 写得不一样也一样）；
    ② 库里没有、但**已存在的自定义**是同一条 → 算匹配成功，把那条自定义的写法与 view 更新成 CSV 里的，
    不新增第二条；③ 两边都没有 → 新增一条自定义公式。
    **每条都写 `cube-pick`**（设成「这一行显示的那条」—— 只存自定义不设选中，表格还是显示默认那条，
    用户会以为「只多了一条自定义条目、公式没换上」）；存的就是上面①库里原文 / ②③那条文本；
    `decoratePanel` 里的 `syncText()` 会让候选行与选中保持一致；
    同一个情况有多行时**最后一行生效**；导完刷新页面；
    **别的页导出的行，只要这一页有同一个情况也收**（计数里说明）；一条都没匹配上时**不刷新**，
    提示直接说明「这份 CSV 有几行、几行没找到情况」—— 反馈走 `sessionStorage['algpicks-msg']`，
    刷新后在 `mountTools` 里弹（当场 toast 会被刷新冲掉，用户会以为「没生效」）；
  - 「恢复默认」只清**当前这一页选中的写法**（按 `cube-pick:<页>:` 前缀扫键），
    **自己加的自定义公式一定留着**（用户要求：恢复默认只是「回到库里那条」，不是把用户写的东西删掉）；
  - 「清空自定义公式」= `clearCustoms(page)`：把这一页 `cube-custom:<页>:*` 全删掉；
    **哪一行正选中的就是被删掉的那条自定义，连选中一起撤**（表格回库里的默认公式），
    其余行（选的是库里写法）不动；条数写进刷新后的提示里；
  - ⚠ 弹窗里的画面图是页面给的 `imgOf(view, alg)` 取的（弹窗里 **alg 传空串**）——
    页面这个函数**必须把 view 用上**：`oh-pll.html` 以前写成只按 alg 反查（`IMG(id, alg)`），
    弹窗里没有 alg 就全退回 `views[0]`，于是「所有 view 的图都一样」（用户报过）；
    现在 `IMG(id, alg, view)` 优先按 view 下标取，`imgOf` 把 view 传下去。F2L / 二阶 PBL 本来就没有
    view 层（`views` 只有 1 个），弹窗里只有一张图是对的；
  - 展开面板最后一行是**「自定义…」**：点开一个**弹窗**，在里面**点一张画面图**选 view（不是下拉文字）、
    再填公式、点「添加」（回车也行；Esc / 点遮罩 / 取消关掉）—— 不检查对错。
    **添加完立刻就是这一行显示的那条**（`writePick` + 页面的 `pick()`），不用再去面板里点一下；
    **删掉的如果是正显示的那条，就撤掉选中并刷新**（回到库里的默认公式）—— 不然 `cube-pick` 里留一条
    已经不存在的写法，练习页会拿它去练。
    加过的自定义公式当普通候选摆在面板里（可选、右边 `✕` 删掉），存档记 `{alg, view}`；
    这一行的布局：只有公式那一格伸缩（`.alg`），`view` 标签 `margin-left:auto` 往前顶，**`✕` 贴在最右边**；
    **这一行正显示的那条如果是自定义公式**，先问一句「库里到底有没有这条」（`FIND[<页>]` =
    `mountTools` 传进来的 `find`）：
    - 库里**没有**（真自定义）→ 把页面凑出来的那一行候选藏掉（`display:none`），
      改在下面按**自定义条目**模板摆一条（带 `.cur`）—— 两处同一套模板，样式才一致；
    - 库里**有**（比如用户的自定义正好和 `2 号` 一样的文本，或 CSV 导入时匹配上的那条）→
      **候选那一行留着，而且什么都不加**：就当「直接选中了库里那条」，只留页面自己的 `.cur` 高亮，
      不挂 `view` 标签、不挂 `✕`（用户要求：和直接点候选长得一模一样）；
      底下那条同文本的自定义条目也不再重复摆（只按文本比就把它一起藏掉是错的 —— 面板会凭空少一条，用户报过）；
    其余自定义（没被选中的、文本和库里某条一样的、已经有好几条的）**一律摆在下面** ——
    以前「候选里出现过就不摆」那道挡会把用户自己的东西挡掉：已有的自定义看不见、
    新导入的那条也像是「没导进来」（用户报过）；只有「正显示 + 库里也有同一条」那一种才由候选行代表；
    页面的 `usable()` / `viewOfAlg()` 都要先问一句 `AlgPicks.customView()`，否则自定义公式刷新后不被恢复、配图也回 v0。
- **练习页（`practice.html`）练的就是公式页里当前展示的那条**：`casesOf()` 先读 `cube-pick:<页>:<情况>`，
  自定义公式再从 `cube-custom` 里取它自己挑的画面 —— 题图也跟着这个画面走（写死 v0 会和公式对不上）。
- 页面里读库要写 **`typeof PLL_DB !== 'undefined' && PLL_DB.cases`**，不要写 `window.PLL_DB`（测试桩里 `window ≠ global`）。
- 页面里调用 `window.addEventListener` 要加保护（测试桩的 `window` 是简化对象）。

## 7. 持久化键（localStorage）

| 键 | 含义 |
|---|---|
| `cube-pick:pll:<编号>` | PLL 页这一行选中的写法（存公式文本） |
| `cube-pick:oh-pll:<编号>` | OH-PLL 页同上 |
| `cube-pick:oh-oll:<编号>` | OH-OLL 页同上 |
| `cube-pick:oll:<编号>` | OLL 页同上 |
| `cube-pick:oll2:<编号>` | 二阶 OLL 页同上 |
| `cube-pick:pbl2:<编号>` | 二阶 PBL 页同上 |
| `cube-pick:f2l:<编号>` | F2L 页这一格选中的写法（存公式文本；库里的写法被删掉后不再恢复） |
| `pll-color-v1` / `ohpll-color-v1` | 显示颜色开关（`'0'` = 关） |
| `cube-custom:<页>:<情况>` | 这一页这个情况的自定义公式 `[{alg, view}]`（`js/algpicks.js`；**「恢复默认」不会清它**，要删就在面板里点 `✕`） |
| `cube-theme` | `light` / `dark` |

## 8. 测试与校验

```bash
node test/links.js        # 页面结构、导航、图片引用、公式页交互、打印换图（~721 条）
node test/cubesim.js      # 三阶模拟器 + 计算器桩测试（~555 条）
node test/cubesim4.js     # 四阶（32）
node test/timer.js        # 计时器（72）
node test/interaction.js  # 交互（262）
node test/pll.js          # PLL 页数据/图片（40）
node test/lightbox.js     # 看图（33）
python3 tools/pll_db.py --check   # PLL 库全量校验（21 情况 / 87 条公式）
python3 tools/oll_db.py --check   # OLL 库全量校验（57 情况 / 215 画面 / 169 条公式：双手 + 单手）
python3 tools/oll2_db.py --check  # 二阶 OLL 库（7 情况 / 26 画面 / 9 条公式）
python3 tools/pbl2_db.py --check  # 二阶 PBL 库（5 情况 / 5 条公式）
python3 tools/f2l_db.py --check   # F2L 库（39 情况 / 42 条写法；02a 三条、07 两条；不做转体）
python3 tools/verify.py           # 页面对库/对图的整体校验（F2L 语义 + 五个库 + 单手 PLL / 单手 OLL + 教程）
```

**PLL 库校验的判据**：每条公式①纯顶层公式、不带开头的 `y`/`y'`/`y2`；②签名能复原**或**箭头模式与本角度逐项一致；
每个角度③图存在且彩色图签名 == 库里的 `sig`；④角度序列 == 按箭头去重的结果（H=1；E/Z=2；**Na/Nb=1** —— 两种画面颜色的相对位置一样，只留基准画面；其余 4）。
**OLL 库校验**：①画面序列 == 基准局面按 `U^k` 去重算出来的（对称的少于 4 个）；②每个画面的 day/night 两版图签名都 == 该画面的 `sig`；
③每条写法是合法 OLL、签名正好等于**它所在那个画面**的（AUF 0；开头带 y/y' 的写法归到自己那个画面，不去 v0 硬塞 AUF）；
④四个分组覆盖 1..57。
**二阶两个库**：`oll2_db` 同 OLL 那套（26 画面 / 7 情况 / 9 条公式，写法按画面挂）；`pbl2_db` 是固定视角（`cases → algs`，没有 `views`），
核 state ↔ 公式 ↔ 编号（Adj / Diag）+ 图存在且 256×197。
**F2L 库**：**不做转体**（库里、情况里都不许有 `views`/`frame`）；39 个情况编号 1..39 连续、id 不重复、
每情况至少一条写法（写法编号 case 内连续）；`sections` 的三节 + 每行左右两格正好覆盖全部情况（07/08/09 是单图形行）；
每个情况的图存在且 256×258。语义（公式落在 FR/FL 槽、a/b 互为镜像、局面互不相同、「白色朝上」节的白贴纸真朝 U）
仍由 `verify.py` 的 `check_f2l` 从库里读出来核 —— 注意「局面互不相同」只针对**不同情况**：
同一个情况的多条写法当然解同一个局面，`check_f2l` 里按 id 去重（以前没去重，给 02a 加第二条写法就会误报「重复」）。

## 9. 踩过的坑（别再踩）

1. **`window.PLL_DB` vs 裸 `PLL_DB`**：测试桩里是两回事，页面里要用 `typeof` 保护的裸名。
2. **测试桩要跑全部内联脚本**（别只 `pop()` 最后一块），并先 `vm.runInContext(plldata.js)`。
3. **断言要读库，不要再静态抠页面里的 `SECTIONS` 字面量**：`pll.html` / `oh-pll.html` / `oll.html`
   的行、图、候选都由 `data/pll.json` / `data/oll.json` 生成（页面里只剩 `var SECTIONS = (function …`）。
   `links.js` / `cubesim.js` 里这一类断言已经改成读库。
   `oll_db.py --build` / `pll_db.py --build` / `f2l_db.py --build` 是**一次性 bootstrap**（要页面还留着字面量）。
4. **不要用正则批量改测试文件**（翻过两次车）：用精确字符串替换，并且**每条都断言命中**，没命中就打印出来。
5. `R'2` ≡ `R2`、`U'2` ≡ `U2'`；比较公式要忽略括号与空白。
6. 图片生成器里**参数名别叫 `line`**（内部有个同名局部函数会遮蔽它，当时排查了很久）。
7. 改图片命名/目录后，`links.js` 里有体积、张数、存在性三类断言要跟着改（当前 `img/pll` 213 张、其中无色 142 张；
   `img/oll/` 430 张 = 215 画面 × 2；`img/oll2/` 52 张 = 26 画面 × 2；`img/pbl2/` 10 张）。
19. **同一情况里不许有两条「同一条公式」**：项目自己的等价规则是 `R'2` ≡ `R2`、忽略括号与空白
    （见第 5 条），按这个规则一比，导入 jperm 之后就留下了一堆**重复写法** —— 用户报的 OLL 55
    1 / 2 号就是（`(R U'2 R'2 U') (R U' R' U2) (F R F')` 与 `R U2 R2 U' R U' R' U2 F R F'`，
    只差记号）。一次性清干净了 **14 组**：PLL 的 `Ab / Ga / Gb / Gc / Gd / H / Ra / Ua / Z`、
    OLL 的 `8 / 18 / 22 / 50 / 55`（PLL 95 → 86 条、OLL 167 → 162 条）。合并规则：保留编号靠前那条的写法、
    把 `X'2` 统一写成 `X2`；**`uses` 和 `tags` 取并集** —— 所以 Ga / Gc / Gd 的 2 号、Gc 的 1 号
    现在带 `OH`（同一条在 jperm 的单手清单里也出现过，之前「只有 2H」的结论是基于当时以为它们不是同一条）。
    `test/links.js` 的 `[23]` 会把五个库按这条规则全扫一遍，不允许再有重复。
8. **无色的夜晚箭头不是逐像素 `#FFE600`**：调色板量化会差几级（E/F/H 落到 `255,231,0`）。
   数颜色要按**色相**判（紫 235~290 / 黄 40~70，S>0.2），两边对称才逐张对得上。
9. **`display:none` 不能做开合动画**（展开键面板曾经就是）；用 `opacity/visibility/transform`。
   再点展开键收起时，document 捕获阶段的 close 必须跳过「正在展开的那个键」。
10. **去重的写和读要用同一个键**：`oh-pll.html` 的候选曾经写 `seen[algKey(alg)]` 却查 `seen[alg]`，
    Ga–Gd 这种一行两条写法的展开后就是两个一模一样的候选。
11. **打印时图是 lazy 的**：屏幕外的图根本没加载，纸上就是空框 —— 打印键 / `Ctrl+P` 必须先
    `loading=eager` + `decode()` 等完再 `window.print()`（`nav.js` 的 `printWithImages`）。
    打印用的白天版靠**临时换 `src`**：打印前换成 `-day-`（PLL 无色夜是去掉 `-night`），打完放回。
    `content:url()` 换图、以及「插一个只在打印里显示的克隆」，都试过、在浏览器里稳定不了，已撤。
13. **切主题别把用户选的画面打回去**：`sync*Imgs` / 恢复存档要按当前那条写法反查画面
    （`viewOfAlg(id, code)`），只按下标取 `views[0]` 就会「换了 v3 的写法、一切昼夜又变回 v0」（二阶 OLL 踩过）。
15. **Python 里 `-` 比 `|` 先算**：`set(a) | {'2H'} - {'OH'}` 是 `a | ({'2H'} - {'OH'})`，
    不会把 `OH` 去掉（导入 jperm 时把「带 M 的改成 2H」写错过一次，加括号才对）。
14. **存档里的写法不一定还能用**：改动库（撤 `OH` 标签、删写法）之后，老存档里的那条仍会被恢复 ——
    恢复前必须过一遍 `usable(id, alg)`（这一页现在能不能显示它），否则单手页 Ga 那种「默认显示一条非 OH 公式」会复现。
20. **每种阶数各存一份现场，别把历史拼成一条**：`calc.html` 原来三阶 / 二阶共用一份局面和历史，
    于是从公式表点 ↗ 跳到二阶后，点历史会拿三阶那条从复原态重放（用户报过）。
    现在 `ORDERS` 一阶一份，**历史的起点也一起存**（`histBase`）—— 回溯是从起点重做，
    起点错了看到的就是「从复原态执行这条公式」。`test/cubesim.js` 的 `[11g]` 末尾钉住了这一整条。
21. **抄页面时打印规则要一起抄**：`oh-pll.html` 是从 `pll.html` 抄的，页头那个 `<div class="opts">`
    （「显示颜色」开关）漏进了 `@media print` 的隐藏名单，打印出来纸上多一个开关（用户报过）。
    抄完对照两边 `@media print` 里的那一行：`.themebtn,.printbtn,.opts,nav.side,.toolbtn{display:none}`
    （`oll2` / `pbl2` 是 `.side` 不是 `nav.side`；**新加的表头按键一定要顺手加进这一行**）。
    `test/links.js` 的 `[21b]` 会扫所有带 `.opts` 的页面。
17. **复制页面时改了 `data-*` 名字，别忘了 `dataset.*` 的读法**：`oh-oll.html` 是从 `oll.html` 抄的，
    把图上的 `data-oll` 改成 `data-oholl` 之后，切主题那段里 `im.dataset.oll` 还是老名字 ——
    于是「按这一行现在的写法反查画面」拿到 `undefined`，一昼夜就把图换坏。
    抄完一页要顺着 diff 把**页面专属的那几处**都改掉：`data-*` + `dataset.*`、存档键 `cube-pick:<页>:<编号>`、
    分组记忆键 `cube-last:<这组第一页>`、以及「双手 / 单手」这类筛选规则。
16. **`calc.html` 的 `badMoves` 别把所有阶数都禁 M**：判断「这一阶有没有这种转法」的规则，
    曾经写成 `d ? false : 'MES'.indexOf(c) >= 0` —— 对**所有**阶数生效，于是三阶模式里贴一条
    带 M 的公式（比如 `M2 U' M U2 M' U' M2`）也被拒；而报错文案只在「二阶 / 其它」之间分，
    就显示成「四阶没有 M 这种转法」，让人以为是自己没切回三阶（用户报过）。
    正确规则：**只有二阶 / 四阶没有中层转**（三阶有 M/E/S；宽转 r/u/f 三阶也有）。
    现在报这种错时，如果三阶其实跑得了，会再挂一个「切回三阶执行」的按钮（切阶数会重置局面，
    所以必须用户点，不自动切）。
18. **别拿字符当图标**：`calc.html` 的正向 / 反向 / 步骤栏四个键原来是 `↻ ↺ ⏮ ◀ ▶ ⏭`
    这几个**字符** —— 手机浏览器的字体常把这类符号换成彩色 emoji 或另一套字形（大小、颜色、粗细全变），
    于是同一个键在手机上跟电脑上长得不一样（用户报过）。**图标一律内联 SVG**
    （形状 `fill:none` + `stroke:currentColor`，尺寸写在 CSS 里，颜色跟着按钮走）。
    顺带：`button{-webkit-appearance:none;appearance:none}` + `html{-webkit-tap-highlight-color:transparent}`
    —— 不然 iOS 会给按钮套原生圆角 / 蓝底 / 点按高亮，跟桌面又不是一套。
    `test/links.js` 的 `[22]` 会扫所有页面的按钮，钉住这两条。
12. **OLL 的 `sig` 就是编辑器模型本身**：`signature.read_oll` 的 12 个采样点和 `Cube.buildOll`
    的候选划线中心**分毫不差**（PAD=0.4342）。所以「sig → 朝向数组」是唯一确定的；
    公式里开头的整体转体（`x'`）要交给 `cubesim.case_of` 归一，别自己去转局面。