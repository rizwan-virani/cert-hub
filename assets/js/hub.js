/* ===========================================================================
   THE CERTIFICATION LAUNCHPAD  ::  app shell, hash router, launcher, readiness, catalog.

   ROUTER NOTE: in-session navigation is hash-driven (so the browser Back button
   stays inside the app), BUT a fresh load / refresh always starts at the top of
   the hub — it does not restore the last section/sub-view from the URL hash.
   =========================================================================== */
(function () {
  "use strict";

  /* ---- tiny DOM helpers ---- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, kids) {
    var idm = tag.match(/#([\w-]+)/); if (idm) tag = tag.replace(/#[\w-]+/, "");
    var m = tag.split("."), node = document.createElement(m[0] || "div");
    if (m.length > 1) node.className = m.slice(1).join(" ");
    if (idm) node.id = idm[1];
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k === "onclick") node.addEventListener("click", attrs[k]);
      else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  var SITES = window.SITES || [];
  var CERTS = window.CERTS || [];
  var dash = $("#dashboard"), view = $("#view"), pageTag = $("#pageTag");

  /* ---- resolve a site's URL: local dev (ports) vs. deployed (sibling dirs) ---- */
  function resolveSiteUrl(site) {
    var h = location.hostname;
    if (h === "localhost" || h === "127.0.0.1" || h === "") {
      return location.protocol + "//" + (h || "localhost") + ":" + site.port + "/";
    }
    return "../" + site.slug + "/"; // e.g. user.github.io/cert-hub/ -> user.github.io/<slug>/
  }

  /* ---- lightweight toast ---- */
  var toastTimer = null;
  function toast(msg) {
    var t = $("#hubToast"); if (!t) { t = el("div#hubToast.hub-toast"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  /* =========================================================================
     THEME  (mirrors the exam sites: data-theme on <html>, persisted locally)
     ========================================================================= */
  var Theme = (function () {
    var KEY = "certhub.theme";
    function current() { return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"; }
    function apply(t) { if (t === "light") document.documentElement.setAttribute("data-theme", "light"); else document.documentElement.removeAttribute("data-theme"); }
    var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
    apply(saved === "light" ? "light" : "dark");
    function build() {
      var b = el("button.theme-fab#themeFab", { type: "button", "aria-label": "Toggle light or dark theme" });
      function label() { b.textContent = current() === "light" ? "◑ Dark" : "◐ Light"; }
      label();
      b.addEventListener("click", function () {
        var next = current() === "light" ? "dark" : "light";
        apply(next); try { localStorage.setItem(KEY, next); } catch (e) {} label();
      });
      document.body.appendChild(b);
    }
    return { build: build };
  })();

  /* =========================================================================
     HERO STATS
     ========================================================================= */
  function renderHeroStats() {
    var q = 0, pbq = 0, labs = 0;
    SITES.forEach(function (s) {
      q += (s.counts && s.counts.questions) || 0;
      pbq += (s.counts && s.counts.pbqs) || 0;
      labs += (s.counts && s.counts.labs) || 0;
    });
    $("#stQ").textContent = q.toLocaleString() + "+";
    $("#stPbq").textContent = pbq.toLocaleString() + "+";
    $("#stLabs").textContent = labs.toLocaleString() + "+";
  }

  /* =========================================================================
     READINESS CACHE  +  cross-origin bridge to each exam site.
     ========================================================================= */
  var Readiness = (function () {
    var cache = {};
    function get(key) {
      if (cache[key] !== undefined) return cache[key];
      try { var raw = localStorage.getItem(key); cache[key] = raw ? JSON.parse(raw) : null; } catch (e) { cache[key] = null; }
      return cache[key];
    }
    function set(key, val) { cache[key] = val; }
    function clearAll() { cache = {}; }
    return { get: get, set: set, clearAll: clearAll };
  })();

  /* Generic broadcast to every site via a hidden iframe + postMessage.
     opts: { reqType, respType, payload(site)->msg, onReply(slug,data), onDone(map), timeoutMs } */
  function bridgeBroadcast(opts) {
    var host = el("div", { style: "position:absolute;width:0;height:0;overflow:hidden;left:-9999px" });
    document.body.appendChild(host);
    var results = {};
    function handler(e) {
      var d = e.data; if (!d || d.type !== opts.respType) return;
      results[d.slug] = d; if (opts.onReply) opts.onReply(d.slug, d);
    }
    window.addEventListener("message", handler);
    SITES.forEach(function (s) {
      var f = document.createElement("iframe");
      f.src = resolveSiteUrl(s) + "?hub=" + encodeURIComponent(opts.reqType);
      f.addEventListener("load", function () {
        try { f.contentWindow.postMessage(opts.payload ? opts.payload(s) : { type: opts.reqType, slug: s.slug }, "*"); } catch (e) {}
      });
      host.appendChild(f);
    });
    setTimeout(function () {
      window.removeEventListener("message", handler); host.remove();
      if (opts.onDone) opts.onDone(results);
    }, opts.timeoutMs || 6000);
  }

  function pollReadiness() {
    bridgeBroadcast({
      reqType: "examProgress:request", respType: "examProgress:v1",
      onReply: function (slug, d) {
        if (!d.payload) return;
        var site = SITES.filter(function (s) { return s.slug === slug; })[0];
        if (site) { Readiness.set(site.progressKey, d.payload); renderReadinessBand(); renderLauncher(); }
      }
    });
  }

  /* =========================================================================
     LAUNCHER GRID  ::  one card per study platform.
     ========================================================================= */
  var currentFilter = "all", currentSearch = "";

  function countLine(c) {
    if (!c) return "";
    var parts = [];
    if (c.domains) parts.push(c.domains + " domains");
    if (c.questions) parts.push(c.questions + " Q");
    if (c.cards) parts.push(c.cards + " cards");
    if (c.pbqs) parts.push(c.pbqs + " PBQs");
    if (c.labs) parts.push(c.labs + " labs");
    return parts.join(" · ");
  }

  function launcherCard(site) {
    var url = resolveSiteUrl(site);
    var prog = Readiness.get(site.progressKey);
    var card = el("article.launch-card", { style: "--accent:" + site.accent });
    card.appendChild(el("div.lc-top", null, [
      el("span.lc-badge", { text: site.abbr, style: "background:" + site.accent }),
      el("span.lc-vendor", { text: site.vendor }),
      site.flagship ? el("span.lc-flag", { text: "★ Most popular" }) : null
    ]));
    card.appendChild(el("h3.lc-name", { text: site.name }));
    card.appendChild(el("div.lc-code", { text: site.examCode + "  ·  " + site.track }));
    if (site.prereq) card.appendChild(el("div.lc-prereq", { text: "Recommended first: " + site.prereq }));
    card.appendChild(el("p.lc-blurb", { text: site.blurb }));
    card.appendChild(el("div.lc-counts", { text: countLine(site.counts) }));
    card.appendChild(el("div.lc-hours", null, [
      el("span", { html: "⏱ <b>" + (site.studyHours || "—") + "</b> avg study time" }),
      site.objectivesUrl ? el("a.lc-obj", { href: site.objectivesUrl, target: "_blank", rel: "noopener noreferrer", text: "Exam objectives ↗" }) : null
    ]));

    if (prog) {
      var pct = Math.round((prog.readiness && prog.readiness.score || 0) * 100);
      card.appendChild(el("div.lc-progress", null, [
        el("div.lc-bar", null, [el("span", { style: "width:" + pct + "%;background:" + site.accent })]),
        el("small", { text: pct + "% ready · " + (prog.readiness && prog.readiness.label || "in progress") })
      ]));
    }
    card.appendChild(el("div.lc-actions", null, [
      el("a.btn.primary", { href: url, text: prog ? "Resume →" : "Launch →" })
    ]));
    return card;
  }

  function renderLauncher() {
    var grid = $("#launcherGrid");
    grid.innerHTML = "";
    var q = currentSearch.trim().toLowerCase();
    var list = SITES.filter(function (s) {
      if (currentFilter !== "all" && s.track !== currentFilter) return false;
      if (q && (s.name + " " + s.examCode + " " + s.abbr + " " + (s.short || "")).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).slice().sort(function (a, b) { return (a.level - b.level) || a.track.localeCompare(b.track); });
    if (!list.length) { grid.appendChild(el("p.muted", { text: "No exams match that search." })); return; }
    list.forEach(function (s) { grid.appendChild(launcherCard(s)); });
  }

  function wireExplorerControls() {
    $all("#explorerControls .chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        $all("#explorerControls .chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        currentFilter = chip.getAttribute("data-filter");
        renderLauncher();
      });
    });
    $("#explorerSearch").addEventListener("input", function (e) { currentSearch = e.target.value; renderLauncher(); });
    $("#openCatalog").addEventListener("click", function () { go("#/catalog"); });
  }

  /* =========================================================================
     READINESS BAND  ::  larger tiles, full exam names, prominent percentage,
     plus a Backup / Restore / Clear toolbar (data safety for local storage).
     ========================================================================= */
  function renderReadinessBand() {
    var grid = $("#readinessGrid");
    grid.innerHTML = "";
    var any = SITES.some(function (s) { return Readiness.get(s.progressKey); });
    var bar = $("#readinessTools"); if (bar) bar.hidden = !any;
    if (!any) {
      grid.appendChild(el("div.readiness-empty", null, [
        el("p", { html: "<b>Nothing here yet — and that's fine.</b> Pick any exam below and start studying. " +
          "Your readiness ring, weakest domains, and study streak appear here automatically as you go." }),
        el("a.btn.primary", { href: "#/", text: "Choose your first exam ↓", onclick: function (e) { e.preventDefault(); go("#/explorer"); } })
      ]));
      return;
    }
    SITES.forEach(function (s) {
      var p = Readiness.get(s.progressKey);
      var pct = p ? Math.round((p.readiness && p.readiness.score || 0) * 100) : 0;
      var tile = el("a.r-tile" + (p ? "" : " idle"), { href: resolveSiteUrl(s), style: "--accent:" + s.accent });
      tile.appendChild(ring(pct, s.accent));
      tile.appendChild(el("div.r-meta", null, [
        el("b.r-name", { text: s.short || s.name }),
        el("span.r-stat", { text: p ? (pct + "% · " + (p.readiness && p.readiness.label || "")) : "Not started" })
      ]));
      grid.appendChild(tile);
    });
  }

  function ring(pct, color) {
    var r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 64 64"); svg.setAttribute("class", "ring");
    function circle(cls, dash) {
      var ci = document.createElementNS(ns, "circle");
      ci.setAttribute("cx", 32); ci.setAttribute("cy", 32); ci.setAttribute("r", r); ci.setAttribute("class", cls);
      if (dash != null) { ci.setAttribute("stroke-dasharray", c.toFixed(1)); ci.setAttribute("stroke-dashoffset", off.toFixed(1)); ci.setAttribute("stroke", color); }
      return ci;
    }
    svg.appendChild(circle("ring-bg"));
    svg.appendChild(circle("ring-fg", off));
    var t = document.createElementNS(ns, "text");
    t.setAttribute("x", 32); t.setAttribute("y", 37); t.setAttribute("class", "ring-num");
    t.textContent = pct + "%";
    svg.appendChild(t);
    return svg;
  }

  /* ---- Backup / Restore / Clear (cross-origin via the bridge) ---- */
  function backupProgress() {
    toast("Gathering your progress from every exam…");
    bridgeBroadcast({
      reqType: "examProgress:export", respType: "examProgress:dump", timeoutMs: 6000,
      onDone: function (results) {
        var bundle = { app: "certification-launchpad", version: 1, exported: new Date().toISOString(), sites: {} };
        var n = 0;
        Object.keys(results).forEach(function (slug) { if (results[slug] && results[slug].data) { bundle.sites[slug] = results[slug].data; n++; } });
        if (!n) { toast("No saved progress found to back up yet."); return; }
        var blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
        var a = el("a", { href: URL.createObjectURL(blob), download: "certification-launchpad-progress.json" });
        document.body.appendChild(a); a.click(); a.remove();
        toast("Backed up progress for " + n + " exam" + (n === 1 ? "" : "s") + ".");
      }
    });
  }

  function restoreProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var bundle; try { bundle = JSON.parse(reader.result); } catch (e) { toast("That file isn't a valid backup."); return; }
      if (!bundle || !bundle.sites) { toast("That file isn't a Certification Launchpad backup."); return; }
      toast("Restoring your progress…");
      bridgeBroadcast({
        reqType: "examProgress:import", respType: "examProgress:imported", timeoutMs: 6000,
        payload: function (s) { return { type: "examProgress:import", slug: s.slug, data: bundle.sites[s.slug] || null }; },
        onDone: function (results) {
          var n = Object.keys(results).length;
          toast("Restored progress to " + n + " exam" + (n === 1 ? "" : "s") + ". Refreshing…");
          Readiness.clearAll(); renderReadinessBand(); renderLauncher(); pollReadiness();
        }
      });
    };
    reader.readAsText(file);
  }

  function clearAllProgress() {
    if (!window.confirm("Clear ALL saved progress on every exam in this browser? This wipes your readiness, quiz history, and flashcard schedules and cannot be undone. Consider backing up first.")) return;
    toast("Clearing progress on every exam…");
    bridgeBroadcast({
      reqType: "examProgress:clear", respType: "examProgress:cleared", timeoutMs: 6000,
      onDone: function (results) {
        Readiness.clearAll(); renderReadinessBand(); renderLauncher();
        toast("Cleared progress on " + Object.keys(results).length + " exams. Fresh start!");
      }
    });
  }

  function wireReadinessTools() {
    var b = $("#rtBackup"), r = $("#rtRestore"), c = $("#rtClear"), f = $("#rtFile");
    if (b) b.addEventListener("click", backupProgress);
    if (r && f) { r.addEventListener("click", function () { f.click(); }); f.addEventListener("change", function () { if (f.files[0]) restoreProgress(f.files[0]); f.value = ""; }); }
    if (c) c.addEventListener("click", clearAllProgress);
  }

  /* =========================================================================
     CATALOG VIEW  ::  the broad reference (full-screen #view).
     ========================================================================= */
  function renderCatalog() {
    view.innerHTML = "";
    view.appendChild(crumb("Certification reference catalog"));
    view.appendChild(el("div.band-head", null, [
      el("h2", { text: "Industry Certification Reference" }),
      el("p.muted", { text: CERTS.length + " certifications across multiple vendors — costs, blueprints, DoD 8140 mapping, and salary/role insights. (For exams with a full study platform, launch it from the Explorer.)" })
    ]));
    var grid = el("div.catalog-grid");
    CERTS.forEach(function (c) {
      var hasSite = SITES.filter(function (s) { return c.examCode.indexOf(s.examCode) !== -1; })[0];
      grid.appendChild(el("button.cat-card", { onclick: function () { go("#/cert/" + c.id); } }, [
        el("div.cc-top", null, [el("span.cc-abbr", { text: c.abbr }), el("span.cc-diff", { text: c.difficulty })]),
        el("h4", { text: c.name }),
        el("div.cc-code", { text: c.examCode + " · " + c.vendor }),
        hasSite ? el("span.cc-haslab", { text: "▸ Study platform available" }) : null
      ]));
    });
    view.appendChild(grid);
    view.appendChild(backBar());
  }

  function renderCertDetail(id) {
    var c = CERTS.filter(function (x) { return x.id === id; })[0];
    view.innerHTML = "";
    if (!c) { view.appendChild(crumb("Not found")); view.appendChild(el("p.muted", { text: "Unknown certification." })); return; }
    view.appendChild(crumb(c.name, "#/catalog"));
    var site = SITES.filter(function (s) { return c.examCode.indexOf(s.examCode) !== -1; })[0];
    view.appendChild(el("div.cert-detail-head", null, [
      el("span.cd-abbr", { text: c.abbr }),
      el("div", null, [el("h2", { text: c.name }), el("p.muted", { text: c.examCode + " · " + c.vendor + " · " + c.difficulty })]),
      site ? el("a.btn.primary", { href: resolveSiteUrl(site), text: "Launch study platform →" }) : null
    ]));
    var rows = [
      ["Cost", c.cost], ["Format", c.format], ["Duration", c.duration], ["Passing", c.passing],
      ["Validity", c.validity], ["Testing", c.testing], ["Domain weights", c.weights],
      ["Prerequisites", c.prereq], ["Performance-based questions", c.pbq], ["Renewal", c.renewal],
      ["DoD 8140", c.dod8140], ["Career & ROI", c.roi]
    ];
    var dl = el("div.cert-facts");
    rows.forEach(function (r) { if (r[1]) dl.appendChild(el("div.fact", null, [el("dt", { text: r[0] }), el("dd", { text: r[1] })])); });
    view.appendChild(dl);
    if (c.free || c.paid) {
      var res = el("div.cert-res");
      if (c.free) res.appendChild(el("div", null, [el("h4", { text: "Free resources" })].concat(c.free.map(function (x) { return el("p", { text: x }); }))));
      if (c.paid) res.appendChild(el("div", null, [el("h4", { text: "Paid resources" })].concat(c.paid.map(function (x) { return el("p", { text: x }); }))));
      view.appendChild(res);
    }
    view.appendChild(backBar("#/catalog"));
  }

  /* Note: the base CSS .crumb .back::before / .backbar .back.big::before already
     render a leading glyph, so the button TEXT must not include its own arrow. */
  function crumb(label, backHash) {
    return el("div.crumb", null, [
      el("button.back", { text: backHash ? "Back" : "Back to Hub", onclick: function () { backHash ? go(backHash) : go("#/"); } }),
      el("span.where", { text: label })
    ]);
  }
  function backBar(backHash) {
    return el("div.backbar", null, [
      el("button.back.big", { text: backHash ? "Back" : "Back to Hub", onclick: function () { backHash ? go(backHash) : go("#/"); } }),
      el("button.btn.ghost", { text: "Back to top ↑", onclick: function () { window.scrollTo({ top: 0, behavior: "smooth" }); } })
    ]);
  }

  /* =========================================================================
     FAQ  ::  rich bodies (HTML); includes the booking checklist.
     ========================================================================= */
  var FAQ = [
    ["Is this the real exam?", "No. Every question is original and written to teach the objectives. Using real or leaked exam content violates the candidate agreements of CompTIA and ISC2 — this resource never does that."],
    ["Do you store my data?", "No accounts, no servers, no tracking. All your progress lives in your own browser's local storage. Because of that, clearing your browser data clears your progress — use <b>Backup progress</b> in the readiness section to save a copy you can restore on another computer."],
    ["Is it really free?", "Yes. Every study platform here is free and open-source under a Creative Commons license. The certification exams themselves cost money — see the For Educators section about funding and academic discounts."],
    ["Which certification should I start with?", "If you're new to IT, start with A+ (Core 1 then Core 2), then Network+, then Security+. The Explorer is grouped by track and ordered to show that progression, with a “Recommended first” tag on advanced exams."],
    ["What browser do I need?", "Desktop or laptop Chrome is strongly recommended. The labs, terminal simulations, and drag-and-drop activities need a mouse and keyboard and may not work on mobile."],
    ["How do I book my exam once I'm ready?", "<ol class='faq-steps'>" +
      "<li><b>Create an account</b> on the vendor's portal (Pearson VUE for CompTIA, or the ISC2 portal).</li>" +
      "<li><b>Choose your format</b> — an in-person testing center or an online proctored exam at home.</li>" +
      "<li><b>Apply your voucher or academic-discount code</b> before checking out (see For Educators).</li>" +
      "<li><b>Review the ID requirements</b> for test day — usually two valid IDs, one government-issued with photo.</li>" +
      "<li><b>Confirm and schedule.</b> Book when your mock-exam scores consistently clear the cut line.</li></ol>"]
  ];
  function renderFaq() {
    var host = $("#faqList"); host.innerHTML = "";
    FAQ.forEach(function (qa) {
      host.appendChild(el("details.faq-item", null, [el("summary", { text: qa[0] }), el("div.faq-body", { html: qa[1] })]));
    });
  }

  /* =========================================================================
     ROUTER  ::  hash-driven in-session; refresh starts at the top.
     ========================================================================= */
  var SECTIONS = { "explorer": "explorer", "readiness": "readinessBand", "how-to-study": "how-to-study", "educators": "educators", "faq": "faq", "about": "about", "why": "why", "after": "after" };

  function go(hash) { if (location.hash === hash) { route(); return; } location.hash = hash; }
  function setTag(t) { if (pageTag) pageTag.textContent = (t || "DASHBOARD").toUpperCase(); }

  function showDashboard(scrollToId) {
    view.hidden = true; view.innerHTML = "";
    dash.hidden = false; setTag("DASHBOARD");
    if (scrollToId && $("#" + scrollToId)) $("#" + scrollToId).scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "auto" });
  }
  function showView(renderFn, tag) {
    dash.hidden = true; view.hidden = false; setTag(tag); renderFn(); window.scrollTo({ top: 0, behavior: "auto" });
  }

  function route() {
    var h = (location.hash || "#/").replace(/^#/, "");
    var certMatch = h.match(/^\/cert\/(.+)$/);
    if (h === "/catalog") showView(renderCatalog, "Catalog");
    else if (certMatch) showView(function () { renderCertDetail(certMatch[1]); }, "Certification");
    else if (h.indexOf("/") === 0 && SECTIONS[h.slice(1)]) showDashboard(SECTIONS[h.slice(1)]);
    else showDashboard();
    highlightNav(h);
  }

  function highlightNav(h) {
    $all("#hubnav a").forEach(function (a) {
      var target = a.getAttribute("href").replace(/^#/, "");
      a.classList.toggle("active", target === h || (h === "/" && target === "/"));
    });
  }

  /* =========================================================================
     INIT
     ========================================================================= */
  function init() {
    Theme.build();
    renderHeroStats();
    renderReadinessBand();
    renderLauncher();
    wireExplorerControls();
    wireReadinessTools();
    renderFaq();

    $("#homeBrand").addEventListener("click", function (e) { e.preventDefault(); go("#/"); });
    window.addEventListener("hashchange", route);

    /* Fresh load / refresh: always start at the top of the hub — strip any
       section/sub-view hash so a refresh doesn't drop you mid-page. */
    if (location.hash && location.hash !== "#/") {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    }
    showDashboard();
    highlightNav("/");

    pollReadiness();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
