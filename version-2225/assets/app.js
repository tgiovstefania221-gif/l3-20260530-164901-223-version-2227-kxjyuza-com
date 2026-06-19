(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-filter-search]');
    var selects = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.video-card'));
    var count = filterRoot.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var incomingQuery = params.get('q');

    if (incomingQuery && searchInput) {
      searchInput.value = incomingQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var activeFilters = {};
      var visible = 0;

      selects.forEach(function (select) {
        if (select.value) {
          activeFilters[select.getAttribute('data-filter-select')] = normalize(select.value);
        }
      });

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));

        var matched = !query || haystack.indexOf(query) !== -1;

        Object.keys(activeFilters).forEach(function (key) {
          if (normalize(card.getAttribute('data-' + key)) !== activeFilters[key]) {
            matched = false;
          }
        });

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();

function initMoviePlayer(videoSelector, overlaySelector, source) {
  var video = document.querySelector(videoSelector);
  var overlay = document.querySelector(overlaySelector);
  var started = false;
  var hlsInstance = null;

  if (!video || !overlay || !source) {
    return;
  }

  function playVideo() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function start() {
    if (started) {
      playVideo();
      return;
    }

    started = true;
    overlay.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      return;
    }

    video.src = source;
    playVideo();
  }

  overlay.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (!started) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
