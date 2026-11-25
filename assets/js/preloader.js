/* MelodyNest preloader: visible from first paint, always released. */
(function () {
  'use strict';
  var root = document.documentElement;
  var loader = document.getElementById('mn-preloader');
  if (!loader) { root.classList.remove('mn-loading'); return; }

  var MIN = 1100, MAX = 6000, start = Date.now(), done = false;
  var bar = loader.querySelector('.mn-loader-bar i');
  var pct = 12;
  if (bar) bar.style.width = pct + '%';
  var tick = window.setInterval(function () {
    pct = Math.min(88, pct + (92 - pct) * 0.12);
    if (bar) bar.style.width = pct + '%';
  }, 180);

  function release() {
    if (done) return; done = true;
    window.clearInterval(tick);
    if (bar) bar.style.width = '100%';
    var wait = Math.max(0, MIN - (Date.now() - start));
    window.setTimeout(function () {
      loader.classList.add('is-hidden');
      root.classList.remove('mn-loading');
      window.setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 600);
    }, wait);
  }

  if (document.readyState === 'complete') release();
  else window.addEventListener('load', release, { once: true });
  window.setTimeout(release, MAX); /* never trap the visitor */
})();
