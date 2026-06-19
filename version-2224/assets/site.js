// Static movie site interactions. Readable and intentionally not minified.
(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = queryAll('[data-hero-slide]', slider);
    var dots = queryAll('[data-hero-dot]', slider);
    var currentIndex = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === currentIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function initInlineFilters() {
    var inputs = queryAll('[data-filter-input]');

    inputs.forEach(function (input) {
      var section = input.closest('section') || document;
      var grid = section.querySelector('[data-filter-grid]');
      var result = section.querySelector('[data-filter-result]');

      if (!grid) {
        return;
      }

      var cards = queryAll('[data-card]', grid);

      function applyFilter() {
        var keyword = normalize(input.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search') || card.textContent);
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !matched);

          if (matched) {
            visibleCount += 1;
          }
        });

        if (result) {
          result.textContent = '显示 ' + visibleCount + ' 部影片';
        }
      }

      input.addEventListener('input', applyFilter);
      applyFilter();
    });
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');

    if (!page) {
      return;
    }

    var input = page.querySelector('[data-search-input]');
    var categoryFilter = page.querySelector('[data-category-filter]');
    var regionFilter = page.querySelector('[data-region-filter]');
    var yearFilter = page.querySelector('[data-year-filter]');
    var clearButton = page.querySelector('[data-clear-filters]');
    var result = page.querySelector('[data-search-result]');
    var cards = queryAll('[data-card]', page);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function applySearch() {
      var keyword = normalize(input && input.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var region = normalize(regionFilter && regionFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search') || card.textContent);
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visibleCount += 1;
        }
      });

      if (result) {
        result.textContent = '显示 ' + visibleCount + ' 部影片';
      }
    }

    [input, categoryFilter, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (categoryFilter) {
          categoryFilter.value = '';
        }
        if (regionFilter) {
          regionFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        applySearch();
      });
    }

    applySearch();
  }

  function initPlayers() {
    var players = queryAll('[data-player]');

    players.forEach(function (player) {
      var video = player.querySelector('video[data-src]');
      var shell = player.querySelector('.video-shell');
      var startButton = player.querySelector('[data-player-start]');
      var message = player.querySelector('[data-player-message]');
      var sourceButtons = queryAll('[data-source-button]', player);
      var hls = null;
      var loadedSource = '';

      if (!video) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }

        message.textContent = text;
        message.classList.add('is-visible');
      }

      function hideMessage() {
        if (message) {
          message.classList.remove('is-visible');
          message.textContent = '';
        }
      }

      function destroyHls() {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      }

      function loadSource(source) {
        if (!source || loadedSource === source) {
          return;
        }

        hideMessage();
        loadedSource = source;
        destroyHls();

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              showMessage('网络错误，正在尝试重新加载播放源。');
              hls.startLoad();
              return;
            }

            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              showMessage('媒体错误，正在尝试恢复播放。');
              hls.recoverMediaError();
              return;
            }

            showMessage('当前浏览器暂时无法播放该视频源。');
            destroyHls();
          });

          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }

        showMessage('当前浏览器不支持 HLS 播放，请使用支持 HLS 的浏览器或启用 hls.js。');
      }

      function playVideo() {
        var source = video.getAttribute('data-src');
        loadSource(source);

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            showMessage('浏览器阻止了自动播放，请再次点击视频播放。');
          });
        }
      }

      if (startButton) {
        startButton.addEventListener('click', playVideo);
      }

      video.addEventListener('play', function () {
        if (shell) {
          shell.classList.add('is-playing');
        }
      });

      video.addEventListener('pause', function () {
        if (shell) {
          shell.classList.remove('is-playing');
        }
      });

      video.addEventListener('error', function () {
        showMessage('视频加载失败，请尝试切换线路。');
      });

      sourceButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var source = button.getAttribute('data-src');

          sourceButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });

          video.setAttribute('data-src', source);
          loadedSource = '';
          loadSource(source);
          playVideo();
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initInlineFilters();
    initSearchPage();
    initPlayers();
  });
}());
