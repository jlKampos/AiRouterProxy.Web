// AiRouterProxy.Web — tiny progressive enhancement (no dependencies).
(function () {
  "use strict";

  // Footer current year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Site-wide proxy version: latest GitHub release of the AiRouterProxy repo.
  // Falls back to the static text already in the page (offline, API down, no JS).
  // "data-version" shows the tag as-is (v2.4.0); "data-version-trim" drops the
  // leading "v" (2.4.0, matching the /admin/health JSON).
  var verEls = document.querySelectorAll("[data-version],[data-version-trim]");
  if (verEls.length) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    fetch("https://api.github.com/repos/jlKampos/AiRouterProxy/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (rel) {
        if (rel && typeof rel.tag_name === "string" && rel.tag_name.length) {
          verEls.forEach(function (el) {
            var v = rel.tag_name;
            if (el.hasAttribute("data-version-trim") && v.charAt(0) === "v") v = v.slice(1);
            el.textContent = v;
          });
        }
      })
      .catch(function () { /* keep the static fallback */ })
      .finally(function () { clearTimeout(timer); });
  }

  // Reveal-on-scroll (respects prefers-reduced-motion)
  var els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  els.forEach(function (el) { io.observe(el); });
})();
