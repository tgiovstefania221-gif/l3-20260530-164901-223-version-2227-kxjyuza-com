(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-go-slide]'));
    if (slides.length === 0) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-go-slide') || 0));
        start();
      });
    });

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function setupLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function setupVideoPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-video-start]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var shell = button.closest('.video-shell');
        var video = shell ? shell.querySelector('video') : null;
        if (!video) {
          return;
        }
        var src = video.getAttribute('data-src');
        if (!src) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            video.play();
          }, { once: true });
        } else {
          video.src = src;
          video.play();
        }

        button.classList.add('hidden');
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchResults(results) {
    var wrap = document.getElementById('globalSearchResults');
    var info = document.getElementById('searchResultInfo');
    if (!wrap || !info) {
      return;
    }

    info.textContent = '共找到 ' + results.length + ' 部影片。';
    wrap.innerHTML = results.slice(0, 200).map(function (movie) {
      return '' +
        '<article class="movie-card">' +
          '<a class="card-cover" href="details/' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
            '<img class="movie-cover" src="' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="play-dot">▶</span>' +
          '</a>' +
          '<div class="card-body">' +
            '<h3><a href="details/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
            '<div class="meta-row">' +
              '<span class="badge-region">' + escapeHtml(movie.region) + '</span>' +
              '<span class="badge-year">' + escapeHtml(movie.year) + '</span>' +
            '</div>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="card-foot">' +
              '<span>' + escapeHtml(movie.type) + '</span>' +
              '<span>' + escapeHtml(movie.genre) + '</span>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  function setupGlobalSearch() {
    var input = document.getElementById('globalSearchInput');
    if (!input || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        renderSearchResults(window.MOVIE_SEARCH_INDEX.slice(0, 120));
        document.getElementById('searchResultInfo').textContent = '默认展示最新 120 部影片。';
        return;
      }

      var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return movie.searchText.indexOf(query) !== -1;
      });
      renderSearchResults(results);
    });
  }

  ready(function () {
    setupHero();
    setupLocalFilters();
    setupVideoPlayers();
    setupGlobalSearch();
  });
})();
