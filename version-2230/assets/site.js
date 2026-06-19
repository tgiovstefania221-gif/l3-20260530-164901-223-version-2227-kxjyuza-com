(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      var opened = mainNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('.hero-slider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.slider-dots button'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  function getCards() {
    return Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  }

  var searchInput = document.querySelector('.movie-search');
  var sortSelect = document.querySelector('.movie-sort');

  function applyFilterAndSort() {
    var cards = getCards();
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var grid = document.querySelector('.movie-grid');

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      card.classList.toggle('hidden-by-filter', query && text.indexOf(query) === -1);
    });

    if (grid && sortSelect) {
      var value = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (value === 'year-asc') {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }
        if (value === 'score-desc') {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        }
        if (value === 'title-asc') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilterAndSort);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilterAndSort);
  }

  var playButtons = Array.prototype.slice.call(document.querySelectorAll('.play-overlay'));
  playButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var playerCard = button.closest('.player-card');
      if (!playerCard) {
        return;
      }
      var video = playerCard.querySelector('video');
      var source = playerCard.getAttribute('data-src') || (video && video.getAttribute('data-src'));
      var status = playerCard.querySelector('.player-status');

      if (!video || !source) {
        if (status) {
          status.textContent = '当前播放源暂不可用';
        }
        return;
      }

      function startVideo() {
        button.classList.add('is-hidden');
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (status) {
              status.textContent = '请再次点击播放器开始播放';
            }
          });
        }
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        video._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, startVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && status) {
            status.textContent = '播放加载失败，请稍后重试';
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', startVideo, { once: true });
        video.load();
      } else {
        video.src = source;
        startVideo();
      }
    });
  });
})();
