(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function() {
            var opened = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = 0;
        var timer;
        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid"));
        if (!grids.length) {
            return;
        }
        var search = document.querySelector(".movie-search");
        var selects = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
        var reset = document.querySelector(".filter-reset");
        var empty = document.querySelector(".empty-result");
        if (search && window.__initialSearch) {
            search.value = window.__initialSearch;
        }
        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }
        function matches(card, query) {
            var haystack = [
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre")
            ].join(" ").toLowerCase();
            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            for (var i = 0; i < selects.length; i += 1) {
                var select = selects[i];
                var value = normalize(select.value);
                var field = select.getAttribute("data-filter");
                if (value && normalize(card.getAttribute("data-" + field)) !== value) {
                    return false;
                }
            }
            return true;
        }
        function apply() {
            var query = normalize(search ? search.value : "");
            var visible = 0;
            grids.forEach(function(grid) {
                Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function(card) {
                    var ok = matches(card, query);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (search) {
            search.addEventListener("input", apply);
        }
        selects.forEach(function(select) {
            select.addEventListener("change", apply);
        });
        if (reset) {
            reset.addEventListener("click", function() {
                if (search) {
                    search.value = "";
                }
                selects.forEach(function(select) {
                    select.value = "";
                });
                apply();
            });
        }
        apply();
    }

    ready(function() {
        initMenu();
        initHero();
        initFilters();
    });
})();
