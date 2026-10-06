/* ==========================================================================
   AlgPicks —— 公式页的「我选了哪条 / 自定义公式 / CSV 导入导出 / 恢复默认」

   七个公式页共用这一份（普通 <script>，`file://` 直接可用，没有构建）。
   页面提供的信息只有三样：这一页叫什么（存档键前缀）、每个情况有几条写法、库里有哪些写法。

   存档键：
     cube-pick:<页>:<情况>    这一行选中的那条公式（公式文本，和以前一样）
     cube-custom:<页>:<情况>  这一页这个情况的自定义公式：[{alg, view}]
   自定义公式的 view 单独存 —— 库里的写法能靠比对反查画面，自定义的没有对应图，
   画面是用户自己挑的（允许和公式对不上，不检查正确性）。

   CSV：四列 `页,情况,公式,view`（view 留空按 0）。导入时**按表头认列**；
   没有表头就按「第 1 列 = 情况、最后 1 列 = 公式」兜底。
   导入的公式先和库里已有的比（忽略括号空白）：比中就相当于「在这一行选了它」，
   比不中就是自定义公式（当时选中的 view 一起存）。
   ========================================================================== */
var AlgPicks = (function () {
  var PICK = 'cube-pick:', CUSTOM = 'cube-custom:';
  var FIND = {};                 // 每页的「库里有没有这条」：<页> -> find(id, alg) -> 画面号 | null

  function store() { try { return window.localStorage; } catch (e) { return null; } }
  function get(k) { var s = store(); try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(k, v) { var s = store(); try { if (s) s.setItem(k, v); } catch (e) {} }
  function del(k) { var s = store(); try { if (s) s.removeItem(k); } catch (e) {} }

  function pickKey(page, id) { return PICK + page + ':' + id; }
  function custKey(page, id) { return CUSTOM + page + ':' + id; }

  /* 情况 id 里有冒号会串键（库里的 id 都没有，保险起见挡一道） */
  function safeId(id) { return String(id).replace(/:/g, '_'); }

  /* 库里有没有这条：返回 {view, alg}（alg = 库里那条的**原文**）或 null。
     页面给的 find 可能是老写法只回画面号（测试桩就是这样），这里统一成对象。 */
  function dbOf(page, id, alg, find) {
    var f = find || FIND[page];
    if (!f) return null;
    var v = f(id, alg);
    if (v === null || v === undefined) return null;
    return (typeof v === 'object') ? v : { view: v, alg: null };
  }
  function readPick(page, id) { return get(pickKey(page, safeId(id))) || ''; }
  function writePick(page, id, alg) {
    if (!alg) { del(pickKey(page, safeId(id))); return; }
    /* 存**调用方给的原样**：用户新加/新导入的写法获胜（比如这次带括号、库里没括号）。
       表里显示、面板候选显示都会跟着换成这一串（用户要求）。 */
    set(pickKey(page, safeId(id)), alg);
  }

  function customs(page, id) {
    var raw = get(custKey(page, safeId(id)));
    if (!raw) return [];
    try {
      var list = JSON.parse(raw);
      return Object.prototype.toString.call(list) === '[object Array]' ? list : [];
    } catch (e) { return []; }
  }
  function writeCustoms(page, id, list) {
    if (list && list.length) set(custKey(page, safeId(id)), JSON.stringify(list));
    else del(custKey(page, safeId(id)));
  }
  function addCustom(page, id, alg, view) {
    alg = String(alg || '').trim();
    if (!alg) return customs(page, id);
    var list = customs(page, id);
    for (var i = 0; i < list.length; i++) {
      if (algKey(list[i].alg) === algKey(alg)) {      // 同一条只留一条，顺手更新 view
        list[i].view = view;
        writeCustoms(page, id, list);
        return list;
      }
    }
    list.push({ alg: alg, view: view });
    writeCustoms(page, id, list);
    return list;
  }
  function removeCustom(page, id, index) {
    var list = customs(page, id);
    if (index >= 0 && index < list.length) list.splice(index, 1);
    writeCustoms(page, id, list);
    return list;
  }
  /* 自定义公式自己挑的画面（库里没有这条时用来配图 / 决定挂哪一页的画面） */
  function customView(page, id, alg) {
    var list = customs(page, id), k = algKey(alg);
    for (var i = 0; i < list.length; i++) if (algKey(list[i].alg) === k) return list[i].view;
    return null;
  }

  /* 比较用：忽略括号与空白（和公式页里的 algKey 同一套） */
  function algKey(a) { return String(a == null ? '' : a).replace(/[()\s]/g, ''); }

  /* 一键清空这一页的自定义公式：<页> 下所有 cube-custom 删掉；
     某一行**正选中的就是被清掉的那条**时，连选中一起撤（表格回库里的默认公式）。 */
  function clearCustoms(page) {
    var st = store();
    if (!st) return { removed: 0, reset: 0 };
    var headP = PICK + page + ':', headC = CUSTOM + page + ':';
    var keys = [], resetKeys = [];
    for (var i = 0; i < st.length; i++) {
      var k = st.key(i);
      if (!k || k.indexOf(headC) !== 0) continue;
      keys.push(k);
      var id = k.slice(headC.length), cur = get(headP + id);
      if (!cur) continue;
      var hit = customs(page, id).some(function (c) { return algKey(c.alg) === algKey(cur); });
      if (hit) resetKeys.push(headP + id);
    }
    keys.forEach(function (x) { del(x); });
    resetKeys.forEach(function (x) { del(x); });
    return { removed: keys.length, reset: resetKeys.length };
  }

  /* 恢复默认：只清这一页**选中的写法** —— 自定义公式**留着**（用户要求：自己加的公式别顺手删掉，
     恢复默认只是「回到库里那条」，自定义仍然摆在展开面板里可以再点）。
     按**键前缀**扫（不依赖页面把情况 id 传进来：传函数 / 传数组都出过岔子）。 */
  function resetPage(page) {
    var s = store();
    if (!s) return 0;
    var head = PICK + page + ':';
    var kill = [];
    for (var i = 0; i < s.length; i++) {
      var k = s.key(i);
      if (k && k.indexOf(head) === 0) kill.push(k);
    }
    kill.forEach(function (k) { del(k); });
    return kill.length;
  }

  var HEADWORD = /^(页|页面|page|情况|编号|名字|name|id|case|公式|alg|algorithm|公式文本|view|画面|角度)$/i;

  /* ---------- CSV ---------- */
  function q(v) {
    v = String(v === null || v === undefined ? '' : v);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  /* rows: [{id, alg, view, custom}] —— 一页一份，表头固定四列 */
  function csv(page, rows) {
    var out = ['页,情况,公式,view'];
    (rows || []).forEach(function (r) {
      out.push([q(page), q(r.id), q(r.alg), r.view === 0 || r.view ? r.view : ''].join(','));
    });
    return out.join('\n') + '\n';
  }
  /* 极简 CSV 解析：支持引号、字段内换行与 CRLF（够我们用，也不引依赖）。
     分隔符不写死逗号 —— Excel 在中文 / 欧洲区域会存成分号，从表格粘贴常是制表符。 */
  function delimiter(text) {
    var first = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/)[0] || '';
    if (first.indexOf('\t') >= 0) return '\t';
    if (first.indexOf(';') >= 0 && first.indexOf(',') < 0) return ';';
    return ',';
  }
  function parseCsv(text, delim) {
    delim = delim || delimiter(text);
    var s = String(text || '').replace(/^\uFEFF/, ''), rows = [], row = [], field = '', inQ = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (inQ) {
        if (c === '"') {
          if (s[i + 1] === '"') { field += '"'; i++; } else inQ = false;
        } else field += c;
      } else if (c === '"') inQ = true;
      else if (c === delim) { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && s[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.length > 1 || String(row[0]).trim() !== '') rows.push(row);
        row = [];
      } else field += c;
    }
    row.push(field);
    if (row.length > 1 || String(row[0]).trim() !== '') rows.push(row);
    return rows;
  }
  /* 表头认列；认不出就按「第 1 列 = 情况、最后 1 列 = 公式」 */
  function columns(rows) {
    if (!rows.length) return null;
    var head = rows[0].map(function (x) { return String(x).trim().toLowerCase(); });
    function find() {
      var want = [].slice.call(arguments), i;
      for (i = 0; i < head.length; i++) if (want.indexOf(head[i]) >= 0) return i;
      return -1;
    }
    var ci = find('情况', 'case', 'id', '编号', '名字', 'name');
    var ai = find('公式', 'alg', 'algorithm', '公式文本');
    if (ci < 0 || ai < 0) return null;
    return { page: find('页', 'page', '页面'), id: ci, alg: ai,
             view: find('view', '画面', '角度'), head: true, from: 1 };
  }
  function readCsv(text) {
    var rows = parseCsv(text);
    if (!rows.length) return [];
    var col = columns(rows);
    if (!col) {
      /* 没认出来（没表头 / 表头是乱码）：按列数猜 ——
         四列就当 页,情况,公式,view；否则当 情况,公式[,view]。 */
      var n = rows[0].length;
      if (n >= 4) col = { page: 0, id: 1, alg: 2, view: 3, head: false, from: 0 };
      else if (n === 3) {
        /* 三列不好认：末列是个 0..3 的小数字就当「情况,公式,view」，否则当「页,情况,公式」 */
        var last = String(rows[0][2] == null ? '' : rows[0][2]).trim();
        col = /^[0-3]$/.test(last) ? { page: -1, id: 0, alg: 1, view: 2, head: false, from: 0 }
                                  : { page: 0, id: 1, alg: 2, view: -1, head: false, from: 0 };
      } else col = { page: -1, id: 0, alg: 1, view: -1, head: false, from: 0 };
    }
    var out = [];
    for (var i = col.from; i < rows.length; i++) {
      var r = rows[i];
      var alg = String(r[col.alg] == null ? '' : r[col.alg]).trim();
      if (!alg) continue;
      var raw = col.view >= 0 ? String(r[col.view] == null ? '' : r[col.view]).trim() : '';
      var v = parseInt(raw, 10);
      out.push({ page: col.page >= 0 ? String(r[col.page] || '').trim() : '',
                 id: String(r[col.id] == null ? '' : r[col.id]).trim(),
                 alg: alg, view: (v >= 0 && v < 4) ? v : 0,
                 viewGiven: raw !== '' });        // CSV 明确写了 view 才算「指定画面」
    }
    return out;
  }
  /* 导入：库里有同一条 → 当「选中它」；没有 → 当自定义。
     api = { page, ids(caseId 存在与否), find(caseId, alg) -> view|null, select(caseId, alg, view) } */
  function importCsv(text, api) {
    var rows = readCsv(text), got = 0, picked = 0, custom = 0, skipped = [], other = 0;
    rows.forEach(function (r) {
      /* 认不出来的那一行有时候其实是表头（GBK 的 CSV 表头会变乱码，columns() 就认不出）——
         这种别报成「没找到情况」，看着像用户写错了。 */
      if (HEADWORD.test(String(r.id)) || HEADWORD.test(String(r.page))) return;   // 表头不算数据
      var exists = !api.ids || api.ids(r.id);
      if (!exists) { skipped.push(r.id); return; }        // 这一页没有这个情况：跳过（报出来）
      if (r.page && api.page && r.page !== api.page) other++;             // 别的页但情况对得上：也收
      var db = dbOf(api.page, r.id, r.alg, api.find);
      /* 1) 库里**有**这条 → 和以前一样：选中它，用库里那条的原文与画面，**绝不新增自定义**。
            （以前这里还要求 view 也对得上，view 不一样就退化成自定义 —— 用户不要那个行为。） */
      if (db) {
        writePick(api.page, r.id, db.alg || r.alg);
        if (api.select) api.select(r.id, r.alg, db.view);
        picked++;
        got++;
        return;
      }
      /* 2) 库里没有，但已经有一条自定义是同一条（algKey）→ 也算匹配成功：更新它的写法与 view，不新增 */
      var mine = customs(api.page, r.id), ck = algKey(r.alg), ci = -1;
      for (var k = 0; k < mine.length; k++) if (algKey(mine[k].alg) === ck) { ci = k; break; }
      if (ci >= 0) {
        mine[ci].alg = r.alg;
        mine[ci].view = r.view;
        writeCustoms(api.page, r.id, mine);
        writePick(api.page, r.id, r.alg);
        if (api.select) api.select(r.id, r.alg, r.view);
        picked++;
        got++;
        return;
      }
      /* 3) 两边都没有 → 新增一条自定义公式 */
      addCustom(api.page, r.id, r.alg, r.view);
      writePick(api.page, r.id, r.alg);
      custom++;
      got++;
      if (api.select) api.select(r.id, r.alg, hit ? db.view : r.view);
      
    });
    return { got: got, picked: picked, custom: custom, skipped: skipped, other: other, rows: rows.length };
  }

  /* ---------- 表头那三个图标键 ---------- */
  var ICON = {
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.6 9.2h5.2"/>' +
           '<path d="M5.4 9.6a7.4 7.4 0 1 1-1 5"/><polyline points="4.4 5.4 4.6 9.2 8.4 9"/></svg>',
    export: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8v10.4"/>' +
            '<polyline points="7.8 10.2 12 14.4 16.2 10.2"/><path d="M4.6 15.4v3.2a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-3.2"/></svg>',
    clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.2h14"/>' +
           '<path d="M9.2 7.2V5.4a1.4 1.4 0 0 1 1.4-1.4h2.8a1.4 1.4 0 0 1 1.4 1.4v1.8"/>' +
           '<path d="M6.6 7.2l.9 11.2a1.6 1.6 0 0 0 1.6 1.5h5.8a1.6 1.6 0 0 0 1.6-1.5l.9-11.2"/>' +
           '<path d="M10.4 10.6v6M13.6 10.6v6"/></svg>',
    import: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14.2V3.8"/>' +
            '<polyline points="7.8 7.8 12 3.6 16.2 7.8"/><path d="M4.6 15.4v3.2a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-3.2"/></svg>'
  };
  /* 这一页现在每一行显示的是哪条（从表格 DOM 上读，页面不用再传一遍它的排序规则）：
     attr = 行上那个 data-xxx（oll / oholl / f2l…）。画面号用页面自己的 viewOfAlg，
     自定义公式则用它自己挑的那个画面。 */
  function domRows(attr, page) {
    var out = [], view = (typeof window !== 'undefined' && window.viewOfAlg) || null;
    if (typeof document === 'undefined' || !document.querySelectorAll) return out;
    var imgs = document.querySelectorAll('#app td.pic img[data-' + attr + ']');
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i], id = im.getAttribute ? im.getAttribute('data-' + attr) : '';
      var tr = null, n = im;
      while (n && n.tagName !== 'TR') n = n.parentNode;
      tr = n;
      if (!id || !tr || !tr.querySelector) continue;
      var code = tr.querySelector('td.f code');
      var alg = code ? String(code.textContent || '').trim() : '';
      if (!alg) continue;
      var v = customView(page, id, alg);
      if (v === null) v = view ? (view(id, alg) || 0) : 0;
      out.push({ id: id, alg: alg, view: v });
    }
    return out;
  }

  /* 重新按存档把这一页铺一遍：直接刷新最省事，也最不容易漏（表格、候选、配图全重来）。
     导入完 / 恢复默认后用。 */
  function reload() {
    try { window.location.reload(); } catch (e) {}
  }
  /* 提示「等我刷新完再弹」：刷新会把 DOM 一起换掉，当场 toast 等于白弹（用户就是因此觉得「没生效」）。
     刷新后在 mountTools 里取出来弹一次（sessionStorage 键 algpicks-msg）。 */
  function sayAfterReload(text) {
    try { window.sessionStorage.setItem('algpicks-msg', String(text)); } catch (e) {}
  }
  function takeMessage() {
    var t = null;
    try {
      t = window.sessionStorage.getItem('algpicks-msg');
      window.sessionStorage.removeItem('algpicks-msg');
    } catch (e) {}
    return t;
  }

  /* 插在打印键左边：三个 28×28 的图标键（打印键在 right:80px，这里往前排）
     api = { ids(id)->bool, rows()->[{id,alg,view}], onDone(text) } */
  function mountTools(page, api) {
    if (api && api.find) FIND[page] = api.find;
    var header = document.querySelector ? document.querySelector('header') : null;
    if (!header || !header.appendChild) return null;
    var mk = function (id, right, title, svg) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'toolbtn';
      b.id = id;
      b.title = title;
      b.setAttribute('aria-label', title);
      b.style.right = right + 'px';
      b.innerHTML = svg;
      header.appendChild(b);
      return b;
    };
    var bReset = mk('algreset', 188, '恢复默认公式', ICON.reset);
    var bExport = mk('algexport', 152, '导出 CSV', ICON.export);
    var bImport = mk('algimport', 116, '导入 CSV', ICON.import);
    var bClear = mk('algclear', 224, '清空自定义公式', ICON.clear);

    bClear.addEventListener('click', function () {
      var r = clearCustoms(page);
      if (!r.removed) { if (api.onDone) api.onDone('这一页没有自定义公式'); return; }
      sayAfterReload('已清空 ' + r.removed + ' 条自定义公式' +
                     (r.reset ? '，其中 ' + r.reset + ' 行回到库里默认公式' : ''));
      reload();
    });
    var left = takeMessage();                       // 上一次刷新前留下的话
    if (left && api.onDone) setTimeout(function () { api.onDone(left); }, 60);
    if (typeof document === 'undefined' || !document.createElement) return null;
    bReset.addEventListener('click', function () {
      var n = resetPage(page);
      sayAfterReload('已恢复默认公式：清掉这一页 ' + n + ' 条选择，自定义公式都留着');
      reload();
    });
    bExport.addEventListener('click', function () {
      var rows = api.rows ? api.rows() : [];
      var name = downloadCsv(page, rows);
      if (api.onDone) api.onDone('已导出 ' + rows.length + ' 条：' + name);
    });
    bImport.addEventListener('click', function () {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.csv,text/csv';
      inp.style.position = 'fixed';
      inp.style.left = '-9999px';
      document.body.appendChild(inp);
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        var fr = new FileReader();
        /* Excel（Windows 中文）另存 CSV 默认是 GBK：按 UTF-8 硬读会得到一堆 «???»，
           表头和中文情况名全对不上。按字节读，严格试 UTF-8，不行再试 GBK。 */
        var decode = function (buf) {
          if (typeof TextDecoder === 'undefined') return null;
          try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) {}
          try { return new TextDecoder('gbk').decode(buf); } catch (e) {}
          try { return new TextDecoder('utf-8').decode(buf); } catch (e) {}
          return null;
        };
        fr.onload = function () {
          var text = (typeof fr.result === 'string') ? String(fr.result)
                                                     : (decode(fr.result) || '');
          var res = importCsv(text, {
            page: page,
            ids: api.ids,
            // 库里有同一条就返回它的画面号（当「选中它」），没有就返回 null（当自定义）
            find: function (id, alg) { return api.find ? api.find(id, alg) : null; }
          });
          if (inp.remove) inp.remove();
          var msg = '导入 ' + res.got + ' 条：选中 ' + res.picked + '、自定义 ' + res.custom +
                    (res.other ? '（' + res.other + ' 条是别的页的，情况对得上也收了）' : '') +
                    (res.skipped.length ? '（' + res.skipped.length + ' 条没找到情况：' +
                     res.skipped.slice(0, 3).join('/') + '）' : '') +
                    (res.got ? '' : '；这份 CSV 一共 ' + res.rows + ' 行，一条都没匹配上 —— ' +
                     '表头要有「情况」「公式」两列（或四列 页,情况,公式,view）');
          sayAfterReload(msg);
          if (!res.got) { if (api.onDone) api.onDone(msg); return; }   // 一条都没进去就不刷新
          reload();
        };
        if (typeof TextDecoder !== 'undefined' && fr.readAsArrayBuffer) fr.readAsArrayBuffer(f);
        else fr.readAsText(f);
      });
      inp.click();
    });
    return { reset: bReset, export: bExport, import: bImport };
  }
  function downloadCsv(page, rows) {
    var text = csv(page, rows);
    var t = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    var name = 'sixfold-' + page + '-' + t.getFullYear() + p(t.getMonth() + 1) + p(t.getDate()) +
               '-' + p(t.getHours()) + p(t.getMinutes()) + p(t.getSeconds()) + '.csv';
    try {
      var blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      if (a.remove) a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    } catch (e) {
      if (window.prompt) window.prompt('复制这份 CSV：', text);
    }
    return name;
  }

  /* ---------- 展开面板里的「自定义」一行 ---------- */
  /* 面板每次重建：把自定义公式当普通候选摆在后面，末尾再摆一行输入 ——
     选画面 + 填公式 + 添加，都不检查正确性。 */
  function decoratePanel(box, opt) {
    var page = opt.page, id = opt.id, views = opt.views || 1;
    // 1) 已有的自定义公式：排在候选后面（点一下就用它；右侧 ✕ 删掉）
    /* 上面那几行候选里已经有这条公式的，下面别再摆一遍 —— 选中一条自定义公式之后，
       它会同时出现在候选里和自定义列表里，看着就是「两行同一个公式」（用户报过）。 */
    var have = {};
    if (box.querySelectorAll) {
      Array.prototype.forEach.call(box.querySelectorAll('span, code'), function (el) {
        var t = String(el.textContent || '').trim();
        if (t) have[algKey(t)] = 1;
      });
    }
    /* 这一行**正显示的那条**如果是自定义公式：候选里那一行直接藏掉，改在下面按自定义条目摆 ——
       只有走同一个模板，样式才和别的自定义完全一致（之前只在候选行上加标签，用户看着还是两样）。
       没被选中的自定义照旧：库里已经有同一条的就不再重复摆。 */
    var pickedText = readPick(page, id) || '';
    var picked = algKey(pickedText);
    var mine = customs(page, id), shownAsCandidate = {};
    syncText(picked, pickedText);
    function inDb(alg) {
      if (!FIND[page]) return false;
      var v = FIND[page](id, alg);
      return v !== null && v !== undefined;
    }
    function findBtn(k) {
      var found = null;
      Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
        if (found) return;
        Array.prototype.forEach.call(b.querySelectorAll('span, code'), function (sp) {
          if (!found && algKey(sp.textContent) === k) found = b;
        });
      });
      return found;
    }
    /* 选中的那一串和候选里那条**只差写法**（括号 / 空格）时，把候选行也换成选中的写法 ——
       用户要求：新写的这一串获胜，候选和展示要保持一致。 */
    function syncText(k, text) {
      if (!text) return;
      Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
        Array.prototype.forEach.call(b.querySelectorAll('span, code'), function (sp) {
          var t = sp.textContent || '';
          if (t && algKey(t) === k && t !== text && sp.tagName !== 'B') sp.textContent = text;
        });
      });
    }
    mine.forEach(function (c, i) {
      var k = algKey(c.alg);
      if (k !== picked) return;
      var btn = findBtn(k);
      var dbHas = inDb(c.alg);
      if (dbHas) {
        /* 库里本来就有这条（比如用户的自定义正好和「2 号」一样的文本，或者 CSV 导入时匹配上的）：
           **什么都不加** —— 就当「直接选中了库里那条」，只保留页面自己的 `.cur` 高亮，
           不挂 view 标签、也不挂 ✕（用户要求：要和直接点候选长得一模一样）。
           底下那条同文本的自定义条目同样不再重复摆。 */
        shownAsCandidate[k] = 1;
        return;
      }
      if (btn && btn.style) btn.style.display = 'none';   // 真自定义：藏掉凑出来的那行，下面摆
    });
    mine.forEach(function (c, i) {
      var k2 = algKey(c.alg);
      if (shownAsCandidate[k2]) return;   // 正显示的就是它、而库里也有同一条 → 候选那行代表了它
      /* 其余自定义**一律摆出来**（包括文本和库里某条一样的、以及已经有好几条的）——
         以前这里还按「候选里出现过就不摆」挡了一道，结果用户已有的自定义会看不见，
         新导入的自定义也容易被误判成「没导进来」（用户报过）。 */
      if (false) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'custom-item' + (algKey(c.alg) === picked ? ' cur' : '');
      b.innerHTML = (opt.imgOf ? '<img src="' + opt.imgOf(c.view, c.alg) + '" alt="">' : '') +
        '<b class="idx">\u81ea</b><span class="alg">' + opt.esc(c.alg) + '</span>' +
        '<span class="tag">view ' + c.view + '</span><span class="del" title="删掉">\u00d7</span>';
      b.addEventListener('click', function (e) {
        if (e.target && e.target.className === 'del') {
          e.preventDefault();
          e.stopPropagation();
          var wasCur = algKey(c.alg) === picked;
          removeCustom(page, id, i);
          if (wasCur) {
            /* 删掉的正是这一行显示的那条：选中也撤掉，回到库里的**默认公式**（第一行），
               然后刷新一次把这一行重画出来。不撤的话 cube-pick 里留着一条已经不存在的写法 ——
               表格虽然会退回默认，但练习页读的就是 cube-pick，会拿一条已删掉的公式去练（用户报过）。 */
            writePick(page, id, '');
            reload();
            return;
          }
          opt.rebuild();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        opt.pick(c.alg, c.view);
        opt.close();
      });
      box.appendChild(b);
    });
    // 2) 「自定义…」：点开一个弹窗，在弹窗里选画面（**点图**选，不是下拉文字）+ 填公式
    var open = document.createElement('button');
    open.type = 'button';
    open.className = 'custom-open';
    open.innerHTML = '<b class="idx">\uff0b</b><span>自定义\u2026</span>';
    open.title = '自己加一条公式';
    open.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openEditor(opt);
    });
    box.appendChild(open);
    return open;
  }

  /* ---------- 自定义公式弹窗 ---------- */
  function css() {
    if (typeof document === 'undefined' || !document.createElement) return;
    if (document.getElementById('algpicks-css')) return;
    var st = document.createElement('style');
    st.id = 'algpicks-css';
    st.textContent = [
      '.apmask{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.42);display:grid;place-items:center}',
      '.apdlg{background:var(--panel,#fff);color:var(--text,#111);border:1px solid var(--line,#ccc);',
      '  border-radius:12px;padding:16px 16px 12px;width:min(560px,92vw);max-height:88vh;overflow:auto;',
      '  box-shadow:0 18px 48px rgba(0,0,0,.28);font-size:13.5px}',
      '.apdlg h4{margin:0 0 4px;font-size:14.5px}',
      '.apdlg p{margin:0 0 10px;color:var(--muted,#666);font-size:12px}',
      '.apviews{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 12px}',
      '.apv{width:74px;padding:4px;border-radius:9px;border:1px solid var(--line,#ccc);background:var(--field,#f6f7f9);',
      '  cursor:pointer;display:grid;place-items:center;gap:2px;color:var(--muted,#666);font-size:11px}',
      '.apv:hover{border-color:var(--line-strong,#999)}',
      '.apv.on{border-color:var(--accent,#7a4a58);color:var(--accent-text,#7a4a58);background:var(--chip,#eef1f5)}',
      '.apv img{width:64px;height:64px;display:block;border-radius:6px}',
      '.apin{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid var(--line,#ccc);',
      '  background:var(--field,#f6f7f9);color:var(--text,#111);font:13.5px/1.4 ui-monospace,Menlo,Consolas,monospace}',
      '.apin:focus{outline:none;border-color:var(--accent,#7a4a58)}',
      '.apact{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}',
      '.apact button{padding:6px 12px;border-radius:8px;border:1px solid var(--line,#ccc);background:var(--field,#f6f7f9);',
      '  color:var(--text,#111);cursor:pointer;font-size:13px}',
      '.apact button.apok{background:var(--accent,#7a4a58);border-color:var(--accent,#7a4a58);color:var(--on-accent,#fff)}',
      // 面板里的自定义条目 / 打开键
      '.pickbox .custom-item,.pickbox .custom-open{display:flex;align-items:center;gap:8px;width:100%;',
      '  padding:6px 8px;border:0;border-top:1px dashed var(--line,#ccc);background:none;color:inherit;',
      '  text-align:left;cursor:pointer;font:inherit}',
      '.pickbox .custom-item img{width:34px;height:34px;border-radius:5px;flex:none}',
      // 只有公式那一格伸缩；view 标签靠右顶，✕ 贴在行的最右边
      '.pickbox .custom-item .alg,.pickbox .custom-open span{flex:1 1 auto;min-width:0;overflow:hidden;',
      '  text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,Menlo,Consolas,monospace}',
      '.pickbox .custom-item .tag{margin-left:auto;flex:none}',
      '.pickbox .custom-item .del{margin-left:2px}',
      '.pickbox .custom-open{color:var(--muted,#666)}',
      '.pickbox .custom-open:hover,.pickbox .custom-item:hover{background:var(--field-hover,#f0f2f5);color:var(--text,#111)}',
      '.pickbox .del{flex:none;padding:0 4px;color:var(--muted,#666);font-size:15px;line-height:1}',
      '.pickbox .del:hover{color:var(--accent-text,#7a4a58)}',
      // 自定义条目里的「自」：跟库里的编号同一格，颜色淡一点（一眼看出是自己加的）
      '.pickbox .custom-item.cur,.pickbox .custom-open.cur{background:var(--field-hover,#f0f2f5)}'
    ].join('');
    (document.head || document.body || document.documentElement).appendChild(st);
  }
  /* 弹窗：选画面（点图）+ 填公式；Esc / 点遮罩 / 取消 关掉，输入框回车 = 添加 */
  function openEditor(opt) {
    if (typeof document === 'undefined' || !document.createElement) return;
    css();
    var page = opt.page, id = opt.id, views = opt.views || 1, view = 0;
    var mask = document.createElement('div');
    mask.className = 'apmask';
    var dlg = document.createElement('div');
    dlg.className = 'apdlg';
    dlg.innerHTML = '<h4>自定义公式</h4><p>先点一张画面图（这条公式写在哪张图上），再填公式 —— 不检查对错。</p>';
    var pics = document.createElement('div');
    pics.className = 'apviews';
    var btns = [];
    for (var v = 0; v < views; v++) {
      (function (vv) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'apv' + (vv === 0 ? ' on' : '');
        var src = opt.imgOf ? opt.imgOf(vv, '') : '';
        b.innerHTML = (src ? '<img src="' + src + '" alt="">' : '') + '<span>view ' + vv + '</span>';
        b.addEventListener('click', function () {
          view = vv;
          btns.forEach(function (x, i) { x.className = 'apv' + (i === vv ? ' on' : ''); });
        });
        btns.push(b);
        pics.appendChild(b);
      })(v);
    }
    dlg.appendChild(pics);
    var inp = document.createElement('input');
    inp.className = 'apin';
    inp.type = 'text';
    inp.placeholder = '自定义公式，例如 R U R\' U\'';
    inp.setAttribute('aria-label', '自定义公式');
    dlg.appendChild(inp);
    var act = document.createElement('div');
    act.className = 'apact';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = '取消';
    var okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'apok';
    okBtn.textContent = '添加';
    act.appendChild(cancel); act.appendChild(okBtn);
    dlg.appendChild(act);
    mask.appendChild(dlg);
    var close = function () { if (mask.remove) mask.remove(); else if (mask.parentNode) mask.parentNode.removeChild(mask); };
    var commit = function () {
      var alg = String(inp.value || '').trim();
      if (!alg) { inp.focus(); return; }
      addCustom(page, id, alg, view);
      writePick(page, id, alg);          // 新加的立刻就是这一行显示的那条
      close();
      if (opt.pick) opt.pick(alg, view);  // 落到表格里（配图用它自己挑的那个 view）
      opt.rebuild();
    };
    cancel.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    okBtn.addEventListener('click', function (e) { e.stopPropagation(); commit(); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
    (document.body || document.documentElement).appendChild(mask);
    inp.focus();
    return mask;
  }

  return {
    algKey: algKey, readPick: readPick, writePick: writePick,
    customs: customs, addCustom: addCustom, removeCustom: removeCustom, customView: customView,
    resetPage: resetPage, clearCustoms: clearCustoms, csv: csv, readCsv: readCsv,
    importCsv: importCsv, domRows: domRows,
    mountTools: mountTools, downloadCsv: downloadCsv, decoratePanel: decoratePanel,
    openEditor: openEditor, ICON: ICON
  };
})();
