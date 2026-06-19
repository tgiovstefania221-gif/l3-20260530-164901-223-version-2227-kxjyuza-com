(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function() {
        var video = document.getElementById("videoPlayer");
        var overlay = document.getElementById("playOverlay");
        if (!video || !overlay) {
            return;
        }
        var source = video.querySelector("source");
        var url = source ? source.getAttribute("src") : "";
        var attached = false;
        var instance = null;

        function attach() {
            if (attached || !url) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                instance.loadSource(url);
                instance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function playVideo() {
            attach();
            overlay.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function() {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", playVideo);
        video.addEventListener("play", function() {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function() {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
        video.addEventListener("click", function() {
            if (video.paused) {
                playVideo();
            }
        });
        window.addEventListener("beforeunload", function() {
            if (instance && typeof instance.destroy === "function") {
                instance.destroy();
            }
        });
    });
})();
