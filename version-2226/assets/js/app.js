(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
                play();
            });
        });

        play();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-search-input]');
        var yearFilter = filterPanel.querySelector('[data-year-filter]');
        var regionFilter = filterPanel.querySelector('[data-region-filter]');
        var genreFilter = filterPanel.querySelector('[data-genre-filter]');
        var resultText = filterPanel.querySelector('[data-filter-result]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = normalize(yearFilter && yearFilter.value);
            var region = normalize(regionFilter && regionFilter.value);
            var genre = normalize(genreFilter && genreFilter.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
                var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
                var matchesGenre = !genre || normalize(card.getAttribute('data-genre')).indexOf(genre) !== -1;
                var isVisible = matchesKeyword && matchesYear && matchesRegion && matchesGenre;

                card.classList.toggle('hidden-by-filter', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (resultText) {
                resultText.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        [searchInput, yearFilter, regionFilter, genreFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function activatePlayer(player) {
        if (player.getAttribute('data-loaded') === '1') {
            return;
        }

        var source = player.getAttribute('data-video');
        var poster = player.getAttribute('data-poster');
        var video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        if (poster) {
            video.poster = poster;
        }

        player.innerHTML = '';
        player.appendChild(video);
        player.setAttribute('data-loaded', '1');

        if (window.Hls && window.Hls.isSupported() && source && source.indexOf('.m3u8') !== -1) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = source;
            video.play().catch(function () {});
        }
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        player.addEventListener('click', function () {
            activatePlayer(player);
        });
    });
})();
