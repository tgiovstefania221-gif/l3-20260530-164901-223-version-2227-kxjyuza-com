
(function () {
  function qs(root, sel) {
    return (root || document).querySelector(sel);
  }

  function qsa(root, sel) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function initMenu() {
    const btn = qs(document, "[data-menu-toggle]");
    const nav = qs(document, "[data-mobile-nav]");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initActiveNav() {
    const page = document.body.getAttribute("data-page");
    if (!page) return;
    qsa(document, ".desktop-nav a, .mobile-nav a").forEach(function (link) {
      const href = link.getAttribute("href") || "";
      if (
        (page === "home" && href === "index.html") ||
        (page === "categories" && href === "categories.html") ||
        (page === "ranking" && href === "ranking.html") ||
        (page === "about" && href === "about.html") ||
        (page === "support" && href === "support.html") ||
        (page === "copyright" && href === "copyright.html")
      ) {
        link.classList.add("is-active");
      }
    });
  }

  function initSearch() {
    qsa(document, "[data-search-input]").forEach(function (input) {
      const selector = input.getAttribute("data-search-input");
      const scope = selector ? qs(document, selector) : input.closest(".page");
      if (!scope) return;

      const cards = qsa(scope, "[data-card]");
      if (!cards.length) return;

      function apply() {
        const term = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          const text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
          const show = !term || text.indexOf(term) !== -1;
          card.style.display = show ? "" : "none";
        });
      }

      input.addEventListener("input", apply);
      apply();
    });
  }

  function initPlayer() {
    const shell = qs(document, "[data-player-shell]");
    if (!shell) return;

    const video = qs(shell, "[data-player]");
    const playBtn = qs(shell, "[data-play-button]");
    const reloadBtn = qs(shell, "[data-reload-button]");
    if (!video) return;

    const src = video.getAttribute("data-src");
    if (!src) return;

    function attach() {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        shell._hls = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    attach();

    if (playBtn) {
      playBtn.addEventListener("click", function () {
        const p = video.play();
        if (p && typeof p.catch === "function") {
          p.catch(function () {});
        }
      });
    }

    if (reloadBtn) {
      reloadBtn.addEventListener("click", function () {
        try {
          if (shell._hls) {
            shell._hls.destroy();
          }
        } catch (e) {}
        video.removeAttribute("src");
        attach();
        const p = video.play();
        if (p && typeof p.catch === "function") {
          p.catch(function () {});
        }
      });
    }
  }

  function initPermalink() {
    qsa(document, "[data-copy-link]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        const url = btn.getAttribute("data-copy-link") || location.href;
        try {
          await navigator.clipboard.writeText(url);
          btn.textContent = "已复制";
          setTimeout(function () {
            btn.textContent = "复制链接";
          }, 1200);
        } catch (e) {
          prompt("复制链接", url);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initActiveNav();
    initSearch();
    initPlayer();
    initPermalink();
  });
})();
