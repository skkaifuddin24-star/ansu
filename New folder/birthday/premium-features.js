// premium-features.js
document.addEventListener('DOMContentLoaded', () => {

    // ---------------- 1. PAGE TRANSITION OVERLAY ----------------
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.innerHTML = '<i class="fa-solid fa-heart"></i>';
    document.body.appendChild(overlay);

    // Fade out overlay on load
    setTimeout(() => {
        overlay.classList.add('fade-out');
    }, 100);

    // Intercept clicks on links for smooth fade out transition
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        // Only intercept local relative HTML links, not anchors (#)
        if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#') && !link.getAttribute('href').startsWith('http')) {
            e.preventDefault();
            overlay.classList.remove('fade-out');
            
            // Save current music time before leaving
            if (window.bgMusic) {
                sessionStorage.setItem('bgMusicTime', window.bgMusic.currentTime);
                sessionStorage.setItem('bgMusicPlaying', !window.bgMusic.paused);
            }

            setTimeout(() => {
                window.location.href = link.getAttribute('href');
            }, 600); 
        }
    });


    // ---------------- 2. SEAMLESS MUSIC PLAYER ----------------
    
    // Create UI
    const playerUI = document.createElement('div');
    playerUI.id = 'floating-music-player';
    playerUI.innerHTML = `
        <div class="music-disc player-icon">
            <i class="fa-solid fa-music" style="color:white; font-size: 1rem; position: absolute; z-index: 10;"></i>
        </div>
        <div class="music-info">
            <h4 class="music-title">Our Song</h4>
            <div class="music-bars">
                <div class="music-bar"></div>
                <div class="music-bar"></div>
                <div class="music-bar"></div>
                <div class="music-bar"></div>
            </div>
        </div>
    `;
    document.body.appendChild(playerUI);

    // Create Audio
    // Replace 'music.mp3' with your actual song file!
    const audio = new Audio('music.mp3'); 
    audio.loop = true;
    audio.volume = 0.4;
    window.bgMusic = audio;

    const disc = playerUI.querySelector('.music-disc');
    const bars = playerUI.querySelectorAll('.music-bar');

    function updateUIPlayState(isPlaying) {
        if (isPlaying) {
            disc.classList.add('playing');
            bars.forEach(b => b.classList.add('active'));
        } else {
            disc.classList.remove('playing');
            bars.forEach(b => b.classList.remove('active'));
        }
    }

    // Check if it was playing in the previous page
    const savedTime = sessionStorage.getItem('bgMusicTime');
    const wasPlaying = sessionStorage.getItem('bgMusicPlaying');

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    // Try to auto-play if it was playing previously
    if (wasPlaying === 'true') {
        audio.play().then(() => {
            updateUIPlayState(true);
        }).catch(() => {
            // Browser blocked autoplay
            updateUIPlayState(false);
            sessionStorage.setItem('bgMusicPlaying', 'false');
        });
    }

    // Click to Play/Pause
    playerUI.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            updateUIPlayState(true);
            sessionStorage.setItem('bgMusicPlaying', 'true');
        } else {
            audio.pause();
            updateUIPlayState(false);
            sessionStorage.setItem('bgMusicPlaying', 'false');
        }
    });

    // Save state periodically just in case of reload
    setInterval(() => {
        if (!audio.paused) {
            sessionStorage.setItem('bgMusicTime', audio.currentTime);
        }
    }, 1000);

});
