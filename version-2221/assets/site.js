(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (toggle && links) {
        toggle.addEventListener('click', function() {
            links.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function setSlide(next) {
            if (!slides.length) return;
            current = (next + slides.length) % slides.length;
            slides.forEach(function(slide, index) {
                slide.classList.toggle('is-active', index === current);
            });
            dots.forEach(function(dot, index) {
                dot.classList.toggle('is-active', index === current);
            });
        }

        function start() {
            timer = window.setInterval(function() {
                setSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                window.clearInterval(timer);
                setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));

    function runFilter() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var category = categoryFilter ? categoryFilter.value : '';
        items.forEach(function(item) {
            var text = (item.getAttribute('data-keywords') || item.textContent || '').toLowerCase();
            var itemCategory = item.getAttribute('data-category') || '';
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchCategory = !category || itemCategory === category;
            item.classList.toggle('is-hidden', !(matchKeyword && matchCategory));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', runFilter);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', runFilter);
    }
}());
