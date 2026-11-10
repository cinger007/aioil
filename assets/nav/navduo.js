/* =========================================================
   首页作业全景导航：二维作业链（默认）/ 三维作业场（点按钮后才加载）/ 阶段场景图（点上方阶段）
   - 三维作业场：岳远翔《石油勘探·智能图谱》（Three.js，field3d.js）
   - 二维作业链：petro-ai-atlas《沿井筒的作业旅程》（journey2d.js）；环节说明：焦来霖《井见》（navduo-data.js）
   - 阶段场景图：赵一硕课程全景图按五个阶段平移聚焦，带动态箭头与环节特效（course-outline.js）
   - 各视图共用同一个"当前环节"，点编号后在右侧卡片进入赵一硕站的环节页与案例。
   ========================================================= */
(function (g) {
  'use strict';
  var D = g.NAV_DUO_DATA;
  if (!D) return;
  var ST = D.stages, CH = D.chapters;

  var F3D = 'assets/nav/field3d.js?v=20261109-j1';
  var PHASE_IMG = 'assets/images/course-outline-wide.webp';
  var f3d = { state: 'idle', wait: [] };
  /* 三维场景脚本约 600 KB，只在用户第一次切到三维时才加载 */
  function loadField3d(done) {
    if (g.YFieldScene) { done(true); return; }
    f3d.wait.push(done);
    if (f3d.state === 'loading') return;
    f3d.state = 'loading';
    var el = document.createElement('script');
    el.src = F3D;
    el.onload = function () { f3d.state = 'idle'; var w = f3d.wait; f3d.wait = []; w.forEach(function (f) { f(!!g.YFieldScene); }); };
    el.onerror = function () { f3d.state = 'idle'; var w = f3d.wait; f3d.wait = []; w.forEach(function (f) { f(false); }); };
    document.head.appendChild(el);
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return n < 9 ? '0' + (n + 1) : '' + (n + 1); }

  function markup() {
    var strip = ST.map(function (s, i) {
      return '<button type="button" data-nd-stage="' + i + '" aria-pressed="false"><small>' + pad(i) + '</small>' + esc(s.name) + '</button>';
    }).join('');
    var chapters = CH.map(function (c, i) {
      return '<button type="button" data-nd-chapter="' + i + '"><small>' + esc(c.range) + '</small>' + esc(c.title) + '</button>';
    }).join('');
    return '<section class="nd" id="atlas-nav" data-mode="2d" aria-labelledby="nd-title">' +
      '<div class="atlas-width nd-inner">' +
      '<header class="nd-head"><div>' +
      '<p class="nd-eyebrow"><span class="nd-dot" aria-hidden="true"></span>作业全景导航 · 二维作业链与三维作业场</p>' +
      '<h2 id="nd-title">从地表到地下，点一个环节开始。</h2>' +
      '<p class="nd-lede">13 个作业环节分布在同一片油田里。二维作业链沿井筒把作业顺序走一遍，三维作业场看设施与地层的空间关系；点上方五个阶段，可看该阶段的作业场景图。点任意编号查看环节并进入案例。</p>' +
      '</div><div class="nd-switch" role="group" aria-label="切换导航视图">' +
      '<button type="button" data-nd-mode="2d" aria-pressed="true"><span>二维作业链</span><small>沿井筒的作业旅程</small></button>' +
      '<button type="button" data-nd-mode="3d" aria-pressed="false"><span>三维作业场</span><small>点击加载 · 可拖动旋转</small></button>' +
      '</div></header>' +
      '<div class="nd-frame">' +
      '<div class="nd-chapters" role="group" aria-label="按作业阶段查看"><button type="button" data-nd-overview class="is-on"><small>全景</small>13 个环节</button>' + chapters + '</div>' +
      '<div class="nd-views">' +
      '<div class="nd-view nd-view-3d" aria-hidden="true">' +
      '<div class="nd-3d-host" tabindex="0" role="application" aria-label="三维作业场：拖动旋转，滚轮缩放，方向键也可旋转">' +
      '<svg class="nd-leaders" aria-hidden="true"></svg><div class="nd-hotspots"></div>' +
      '<div class="nd-loading"><span></span>三维作业场加载中…</div></div>' +
      '<div class="nd-3d-top"><span class="nd-3d-tag"><i></i>地上 × 地下 · 三维作业场</span>' +
      '<div class="nd-3d-views" role="group" aria-label="镜头">' +
      '<button type="button" data-nd-cam="all" class="is-on">全景</button><button type="button" data-nd-cam="surface">地表设施</button><button type="button" data-nd-cam="underground">地下剖面</button>' +
      '<button type="button" data-nd-explode aria-pressed="false">分层展开</button></div></div>' +
      '<div class="nd-3d-tools"><button type="button" data-nd-zoom="1" aria-label="放大">＋</button><button type="button" data-nd-zoom="-1" aria-label="缩小">−</button><button type="button" data-nd-home aria-label="回到初始视角">⌂</button></div>' +
      '<div class="nd-3d-hint">拖动旋转 · 滚轮缩放 · 概念模型，非真实比例</div>' +
      '</div>' +
      '<div class="nd-view nd-view-2d" aria-hidden="false"><div class="nd-journey"></div></div>' +
      '<div class="nd-view nd-view-phase" aria-hidden="true"><div class="ndp-stage"></div>' +
      '<div class="ndp-caption"><b></b><span></span></div>' +
      '<div class="ndp-hint"><i></i>点图中环节查看说明 · 示意动画</div></div>' +
      '<aside class="nd-card" aria-live="polite"></aside>' +
      '</div>' +
      '<div class="nd-stages" role="group" aria-label="十三个作业环节">' + strip + '</div>' +
      '</div>' +
      '</div></section>';
  }

  function mount(root, ctx) {
    if (!root) return { destroy: function () {} };
    var A = ctx && ctx.atlas, C = ctx && ctx.cases;
    var $ = function (s) { return root.querySelector(s); };
    var all = function (s) { return [].slice.call(root.querySelectorAll(s)); };
    var reduce = g.matchMedia ? g.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var mode = '2d', phase = false, sel = -1, chapter = null, cam = 'all', exploded = false;
    var hover = false, focusIn = false, dead = false;
    var scene = null, sceneTried = false, labels = [];
    var host = $('.nd-3d-host'), hotspots = $('.nd-hotspots'), leaders = $('.nd-leaders');
    var J = g.NavJourney, journey = J ? J.mount($('.nd-journey'), {
      names: ST.map(function (s) { return s.name; }),
      onselect: function (i) { if (i < 0) { if (sel >= 0) select(sel); } else select(i); }
    }) : null;

    function view() { return phase ? 'phase' : mode; }
    function stageName(i) { return ST[i] ? ST[i].name : ''; }
    function sceneTitle(id) { var s = A && A.index && A.index.byScene[id]; return s ? s.name || s.title || '' : ''; }
    function caseLink(sceneId) {
      var c = C && C.byScene ? C.byScene(sceneId) : null;
      return '#/scene/' + sceneId + (c ? '?case=' + encodeURIComponent(c.id) + '&tab=bg' : '');
    }
    function stageCount(id) {
      var st = A && A.stages ? A.stages.filter(function (x) { return x.id === id; })[0] : null;
      return st ? st.scenes.length : 0;
    }
    function fieldNote(i) {
      var f = g.YFieldScene && g.YFieldScene.STATIONS && g.YFieldScene.STATIONS[i];
      return f ? '<p class="nd-card-field"><b>' + esc(f.concept) + '</b>' + esc(f.detail) + '</p>' : '';
    }

    function card() {
      var el = $('.nd-card');
      if (sel < 0) {
        var c = chapter != null ? CH[chapter] : null;
        el.innerHTML = c
          ? '<p class="nd-over">' + esc(c.range) + ' / ' + esc(c.full || c.title) + '</p><h3>' + esc(c.meaning) + '</h3>' +
            '<div class="nd-card-list">' + c.ids.map(function (id) {
              var i = ST.map(function (s) { return s.id; }).indexOf(id);
              return '<button type="button" data-nd-stage="' + i + '"><small>' + pad(i) + '</small>' + esc(stageName(i)) + '<span>' + stageCount(id) + ' 个场景</span></button>';
            }).join('') + '</div>'
          : '<p class="nd-over">全景 · 13 个环节 · 61 个场景</p><h3>地下有对象，地面有记录，方法有来处。</h3>' +
            '<p>点图上的编号或下方环节，看清这个环节观测什么、形成什么数据、智能方法在哪里介入。</p>' +
            '<ol class="nd-guide"><li><b>看作业</b>设备与地层怎样相连</li><li><b>看数据</b>观测怎样变成记录</li><li><b>进案例</b>改变条件，比较方法</li></ol>';
        return;
      }
      var s = ST[sel];
      el.innerHTML = '<p class="nd-over">' + pad(sel) + ' / ' + esc(s.name) + (view() === '2d' && J ? ' · ' + esc(J.PLACE[sel]) : '') + ' · ' + stageCount(s.id) + ' 个场景</p>' +
        '<h3>' + esc(s.question) + '</h3>' +
        (view() === '3d' && fieldNote(sel) ? fieldNote(sel) : '<p class="nd-card-motion">' + esc(s.explain) + '</p>') +
        '<dl><dt>观测与数据</dt><dd>' + esc((s.data || []).join(' · ')) + '</dd>' +
        '<dt>智能方法</dt><dd>' + esc(s.method) + '</dd><dt>读出什么</dt><dd>' + esc(s.output) + '</dd></dl>' +
        '<div class="nd-card-actions"><a class="nd-go" href="#/stage/' + esc(s.id) + '">进入' + esc(s.name) + '环节 →</a>' +
        (s.caseScene ? '<a class="nd-go-2" href="' + caseLink(s.caseScene) + '">代表案例：' + esc(sceneTitle(s.caseScene) || s.caseScene.toUpperCase()) + ' ↗</a>' : '') +
        '</div>';
    }

    function paint() {
      var v = view();
      root.dataset.mode = v;
      root.dataset.selected = sel < 0 ? 'none' : ST[sel].id;
      all('[data-nd-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(!phase && b.dataset.ndMode === mode)); });
      $('.nd-view-3d').setAttribute('aria-hidden', String(v !== '3d'));
      $('.nd-view-2d').setAttribute('aria-hidden', String(v !== '2d'));
      $('.nd-view-phase').setAttribute('aria-hidden', String(v !== 'phase'));
      all('[data-nd-stage]').forEach(function (b) {
        var on = Number(b.dataset.ndStage) === sel;
        b.classList.toggle('is-on', on);
        if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(on));
      });
      all('[data-nd-chapter]').forEach(function (b) {
        var i = Number(b.dataset.ndChapter);
        var on = sel < 0 ? chapter === i : ST[sel].chapter === i;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(phase && on));
      });
      $('[data-nd-overview]').classList.toggle('is-on', sel < 0 && chapter == null);
      paintPhase();
      all('[data-nd-cam]').forEach(function (b) { b.classList.toggle('is-on', b.dataset.ndCam === cam); });
      $('[data-nd-explode]').setAttribute('aria-pressed', String(exploded));
      card();
      if (journey) journey.set(sel);
      drawHotspots();
      if (scene) scene.wake();
      if (v === '3d') ensureScene();
    }

    /* ---------- 阶段场景图（赵一硕课程全景图，按阶段平移聚焦） ---------- */
    var CO = g.CourseOutline, ART = CO && CO.art, PH = CO && CO.phases;
    var pStage = $('.ndp-stage'), pBuilt = false, pSvgs = [];
    function buildPhase() {
      if (pBuilt || !ART) return;
      pBuilt = true;
      var ids = ST.map(function (s) { return s.id; });
      pStage.innerHTML = '<img class="ndp-img" src="' + PHASE_IMG + '" width="' + ART.W + '" height="' + ART.H + '" alt="五个作业阶段的场景图：油气勘探与资源发现、钻井施工与地层评价、井筒建造与投产准备、油气开采与生产增效、油气集输与炼化加工" decoding="async" draggable="false">' +
        '<div class="ndp-band" aria-hidden="true"></div>' + ART.motion() +
        ART.spots.map(function (s) {
          var i = ids.indexOf(s[0]);
          if (i < 0) return '';   /* 原图的"注井"没有单独环节 */
          return '<button type="button" class="ndp-spot" data-nd-stage="' + i + '" data-ndp-phase="' + s[1] + '" aria-label="' + esc(pad(i) + ' ' + ST[i].name) + '" style="left:' + s[2] / ART.W * 100 + '%;top:' + s[3] / ART.H * 100 + '%;width:' + s[4] / ART.W * 100 + '%;height:' + s[5] / ART.H * 100 + '%;--phase:' + PH[s[1]].color + '">' +
            ART.effect(s) + '<span class="ndp-tag"><b>' + pad(i) + '</b>' + esc(ST[i].name) + '</span></button>';
        }).join('');
      pSvgs = [].slice.call(pStage.querySelectorAll('svg'));
    }
    function paintPhase() {
      var on = view() === 'phase';
      if (on) buildPhase();
      pSvgs.forEach(function (svg) { var k = on && !reduce.matches ? 'unpauseAnimations' : 'pauseAnimations'; if (typeof svg[k] === 'function') svg[k](); });
      if (!pBuilt) return;
      var n = chapter == null ? 0 : chapter, p = PH[n];
      root.style.setProperty('--phase', p.color);
      [].forEach.call(pStage.querySelectorAll('[data-course-flow]'), function (f) { f.classList.toggle('is-dim', Number(f.dataset.courseFlow) !== n); });
      [].forEach.call(pStage.querySelectorAll('.ndp-spot'), function (b) { var cur = Number(b.dataset.ndpPhase) === n; b.classList.toggle('is-dim', !cur); b.tabIndex = cur ? 0 : -1; });
      var band = pStage.querySelector('.ndp-band');
      band.style.top = p.top / ART.H * 100 + '%';
      band.style.height = (p.bottom - p.top) / ART.H * 100 + '%';
      $('.ndp-caption b').textContent = '0' + (n + 1);
      $('.ndp-caption span').textContent = p.title + ' · ' + p.goal;
      placePhase();
    }
    function placePhase() {
      if (!pBuilt) return;
      var box = $('.nd-view-phase'), w = box.clientWidth, h = box.clientHeight;
      if (!w || !h) return;
      var p = PH[chapter == null ? 0 : chapter], S = w * ART.H / ART.W;
      var c = (p.top + p.bottom) / 2 / ART.H * S;
      var y = Math.max(0, Math.min(S - h, c - h / 2));
      pStage.style.transform = 'translateY(' + (-y).toFixed(1) + 'px)';
    }

    /* ---------- 三维作业场 ---------- */
    function sceneState() {
      return {
        selected: sel < 0 ? 0 : sel,
        motion: view() === '3d' && !reduce.matches && !dead,
        theme: 'dark', exploded: exploded, view: cam,
        effects: true, scanning: false, orbit: !hover && !focusIn
      };
    }
    var hotEls = null, lineEls = null;
    function buildHotspots() {
      var NS = 'http://www.w3.org/2000/svg';
      hotEls = []; lineEls = [];
      ST.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'nd-hot'; b.dataset.ndStage = i;
        b.style.setProperty('--c', (g.YFieldScene.STATIONS[i] || {}).color || '#8de4db');
        b.innerHTML = '<span>' + pad(i) + '</span><b>' + esc(s.name) + '</b>';
        b.setAttribute('aria-label', pad(i) + ' ' + s.name);
        hotspots.appendChild(b); hotEls.push(b);
        var path = document.createElementNS(NS, 'path'), dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', '2.4');
        leaders.appendChild(path); leaders.appendChild(dot); lineEls.push([path, dot]);
      });
    }
    function drawHotspots() {
      if (!labels.length) return;
      if (!hotEls) buildHotspots();
      leaders.setAttribute('viewBox', '0 0 ' + host.clientWidth + ' ' + host.clientHeight);
      labels.forEach(function (p) {
        var b = hotEls[p.index], l = lineEls[p.index];
        if (!b) return;
        b.hidden = !p.visible; l[0].style.display = l[1].style.display = p.visible ? '' : 'none';
        b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
        b.classList.toggle('is-on', p.index === sel);
        l[0].setAttribute('d', 'M' + p.anchorX + ' ' + p.anchorY + 'L' + p.x + ' ' + p.y);
        l[0].setAttribute('class', p.index === sel ? 'is-on' : '');
        l[1].setAttribute('cx', p.anchorX); l[1].setAttribute('cy', p.anchorY);
      });
    }
    function fail3d() {
      root.classList.add('nd-3d-failed');
      $('.nd-loading').innerHTML = '当前浏览器无法显示三维作业场，已切换到二维作业链。';
      if (mode === '3d') { mode = '2d'; paint(); }
    }
    function ensureScene() {
      if (scene || sceneTried || dead) return;
      if (!g.YFieldScene) {
        loadField3d(function (ok) {
          if (dead) return;
          if (!ok) { sceneTried = true; fail3d(); return; }
          if (view() === '3d') ensureScene();
        });
        return;
      }
      sceneTried = true;
      try {
        scene = g.YFieldScene.createFieldScene(host, {
          state: sceneState,
          labels: function () { return ST.map(function (s) { return s.name; }); },
          onproject: function (p) { labels = p; drawHotspots(); root.classList.add('nd-3d-ready'); },
          onselect: function (i) { select(i); }
        });
      } catch (e) { fail3d(); }
    }

    /* ---------- 交互 ---------- */
    function select(i) {
      sel = sel === i ? -1 : i;
      if (sel >= 0) chapter = ST[sel].chapter;
      paint();
      if (sel >= 0) {
        var b = root.querySelector('.nd-stages [data-nd-stage="' + sel + '"]'), strip = $('.nd-stages');
        if (b && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: b.offsetLeft - strip.clientWidth / 2 + b.clientWidth / 2, behavior: 'smooth' });
      }
    }
    function setMode(m) {
      if ((m === mode && !phase) || (m === '3d' && root.classList.contains('nd-3d-failed'))) return;
      mode = m; phase = false; paint();
    }
    function click(e) {
      var b = e.target.closest('button');
      if (!b || !root.contains(b)) return;
      if (b.dataset.ndStage != null) select(Number(b.dataset.ndStage));
      else if (b.dataset.ndMode) setMode(b.dataset.ndMode);
      else if (b.dataset.ndChapter != null) { sel = -1; chapter = Number(b.dataset.ndChapter); phase = true; paint(); }
      else if (b.hasAttribute('data-nd-overview')) { sel = -1; chapter = null; phase = false; paint(); }
      else if (b.dataset.ndCam) { cam = b.dataset.ndCam; paint(); }
      else if (b.hasAttribute('data-nd-explode')) { exploded = !exploded; paint(); }
      else if (b.dataset.ndZoom && scene) scene.zoom(Number(b.dataset.ndZoom) * 0.15);
      else if (b.hasAttribute('data-nd-home') && scene) { cam = 'all'; scene.reset(); paint(); }
    }
    function keydown(e) {
      var b = e.target.closest && e.target.closest('.nd-stages [data-nd-stage]');
      if (!b) return;
      var list = all('.nd-stages [data-nd-stage]'), i = list.indexOf(b), n = -1;
      if (e.key === 'ArrowRight') n = (i + 1) % list.length;
      if (e.key === 'ArrowLeft') n = (i + list.length - 1) % list.length;
      if (n >= 0) { e.preventDefault(); list[n].focus(); select(n); }
    }

    /* 鼠标或键盘在导航内时，三维场景暂停环绕旋转，方便点选 */
    function enter() { hover = true; if (scene) scene.wake(); }
    function leave() { hover = false; if (scene) scene.wake(); }
    function fin() { focusIn = true; }
    function fout(e) { if (!root.contains(e.relatedTarget)) focusIn = false; }
    var frame = $('.nd-frame');
    root.addEventListener('click', click);
    root.addEventListener('keydown', keydown);
    frame.addEventListener('pointerenter', enter);
    frame.addEventListener('pointerleave', leave);
    root.addEventListener('focusin', fin);
    root.addEventListener('focusout', fout);
    var resize = function () { drawHotspots(); placePhase(); };
    g.addEventListener('resize', resize);

    paint();

    return {
      destroy: function () {
        if (dead) return; dead = true;
        root.removeEventListener('click', click);
        root.removeEventListener('keydown', keydown);
        frame.removeEventListener('pointerenter', enter);
        frame.removeEventListener('pointerleave', leave);
        root.removeEventListener('focusin', fin);
        root.removeEventListener('focusout', fout);
        g.removeEventListener('resize', resize);
        if (scene) { try { scene.dispose(); } catch (e) { } scene = null; }
        if (journey) journey.destroy();
      },
      snapshot: function () { return { mode: view(), chapter: chapter, selected: sel, scene: !!scene, labels: labels.length }; },
      setMode: setMode, select: select
    };
  }

  g.NavDuo = { markup: markup, mount: mount };
})(window);
