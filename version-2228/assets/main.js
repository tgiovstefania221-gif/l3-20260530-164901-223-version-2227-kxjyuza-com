(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-nav-button]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        if (slides.length) {
            showSlide(0);
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    showSlide(dotIndex);
                });
            });
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        Array.prototype.slice.call(document.querySelectorAll('[data-search-redirect]')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = form.getAttribute('data-search-redirect') || './search.html';
                window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
            });
        });

        var filterRoot = document.querySelector('[data-filter-root]');
        if (!filterRoot) {
            return;
        }

        var searchInput = filterRoot.querySelector('[data-filter-input]');
        var categorySelect = filterRoot.querySelector('[data-filter-category]');
        var typeSelect = filterRoot.querySelector('[data-filter-type]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var sortSelect = filterRoot.querySelector('[data-filter-sort]');
        var grid = filterRoot.querySelector('[data-card-grid]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && searchInput) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var category = normalize(categorySelect && categorySelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-tags'));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesCategory = !category || category === 'all' || normalize(card.getAttribute('data-category')) === category;
                var matchesType = !type || type === 'all' || normalize(card.getAttribute('data-type')) === type;
                var matchesYear = !year || year === 'all' || normalize(card.getAttribute('data-year')) === year;
                card.classList.toggle('is-hidden-by-filter', !(matchesKeyword && matchesCategory && matchesType && matchesYear));
            });
        }

        function applySort() {
            if (!sortSelect || !grid) {
                return;
            }
            var mode = sortSelect.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === 'year') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                if (mode === 'score') {
                    return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                }
                if (mode === 'heat') {
                    return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
                }
                return Number(a.getAttribute('data-index')) - Number(b.getAttribute('data-index'));
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        [searchInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                applySort();
                applyFilters();
            });
        }

        applySort();
        applyFilters();
    });
}());
