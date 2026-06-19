(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var streamUrl = player.getAttribute('data-stream');
            var hlsInstance = null;
            var bound = false;

            function bindStream() {
                if (!video || !streamUrl || bound) {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }

                bound = true;
            }

            function startPlayback() {
                bindStream();
                if (button) {
                    button.classList.add('is-hidden');
                }
                if (video) {
                    video.controls = true;
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener('click', startPlayback);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        startPlayback();
                    }
                });
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
            }

            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    });
}());
