/* -------------------------------------
   10X PREMIUM FEATURES - JAVASCRIPT
------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    initPreloader();
    initCustomCursor();
    initCanvasParticles();
    initPageTransitions();
    initGSAPAnimations();
    initMagneticInteractions();
    initVanillaTilt();
});

/* -------------------------------------
   1. PAGE PRE-LOADER & TRANSITIONS
------------------------------------- */
function initPreloader() {
    // 1. Inject Loader HTML if it doesn't exist
    if (!document.getElementById('global-loader')) {
        const loaderHTML = `
            <div id="global-loader">
                <i class="fa-solid fa-heart loader-heart"></i>
                <div class="loader-text">Loading Memories <span id="load-percent">0</span>%</div>
                <div class="loader-progress-wrap">
                    <div class="loader-progress" id="load-bar"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    }

    const loader = document.getElementById('global-loader');
    const loadPercent = document.getElementById('load-percent');
    const loadBar = document.getElementById('load-bar');

    let currentPercent = 0;
    
    // Simulate loading
    const interval = setInterval(() => {
        currentPercent += Math.floor(Math.random() * 15) + 5;
        if (currentPercent > 100) currentPercent = 100;
        
        loadPercent.innerText = currentPercent;
        loadBar.style.width = currentPercent + '%';

        if (currentPercent === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('hidden');
                // Optional: remove from DOM after fade
                setTimeout(() => loader.style.display = 'none', 800);
            }, 500);
        }
    }, 100);
}

function initPageTransitions() {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.getAttribute('href');
            
            // Allow hash links to work normally
            if (target.startsWith('#')) return;
            
            // Allow external links
            if (target.startsWith('http') || target.startsWith('mailto')) return;

            e.preventDefault();
            
            // Reactivate loader
            const loader = document.getElementById('global-loader');
            if (loader) {
                loader.style.display = 'flex';
                // force reflow
                void loader.offsetWidth;
                loader.classList.remove('hidden');
            } else {
                document.body.classList.add('fade-out');
            }

            // Navigate after animation
            setTimeout(() => {
                window.location.href = target;
            }, 600);
        });
    });
}

/* -------------------------------------
   2. CUSTOM CURSOR
------------------------------------- */
function initCustomCursor() {
    // Check if on mobile to disable
    if (window.innerWidth <= 768) return;

    // Inject cursor elements
    if (!document.getElementById('custom-cursor')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="custom-cursor"></div>
            <div id="custom-cursor-follower"></div>
        `);
    }

    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('custom-cursor-follower');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = window.innerWidth / 2;
    let followerY = window.innerHeight / 2;

    // Move cursor tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Fast update for small dot
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    // Smooth follower loop
    function renderFollower() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(renderFollower);
    }
    renderFollower();

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .cake-container, .tilt-card, .gallery-item, .nav-btn');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    const textInputs = document.querySelectorAll('input, textarea');
    textInputs.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hide-custom-cursor'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hide-custom-cursor'));
    });
}

/* -------------------------------------
   3. INTERACTIVE PARTICLE CANVAS
------------------------------------- */
function initCanvasParticles() {
    if (document.getElementById('bg-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    let mouse = { x: -1000, y: -1000, radius: 150 };
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    // Move mouse off screen on leave
    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseRadius = Math.random() * 2.5 + 0.5;
            this.radius = this.baseRadius;
            this.density = (Math.random() * 30) + 1;
            // Drifting upwards slowly
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = -(Math.random() * 0.5 + 0.2); 
            this.alpha = Math.random() * 0.6 + 0.2;
            this.color = Math.random() > 0.5 ? '247, 37, 133' : '252, 191, 73'; // Pink & Gold
        }

        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            // Mouse Repulsion interaction
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < maxDistance) {
                this.x -= directionX;
                this.y -= directionY;
                this.alpha = 1; // glow up when pushed
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 10;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 10;
                }
                this.alpha = Math.max(0.2, this.alpha - 0.02);
            }

            // Standard drift
            this.x += this.vx;
            this.y += this.vy;

            // Screen wrapping
            if (this.y < -10) this.y = height + 10;
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;

            // Draw glowing particle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
            
            // Core glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = `rgba(${this.color}, 0.8)`;
            ctx.fill();
            
            // Reset shadow to avoid massive performance drops on other draws
            ctx.shadowBlur = 0;
        }
    }

    // Amount based on screen size (optimized for performance)
    const numParticles = Math.min(150, Math.floor((width * height) / 10000));
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        // Clear with slight trail effect
        ctx.fillStyle = 'rgba(5, 5, 16, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        for (let p of particles) {
            p.update();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* -------------------------------------
   4. GSAP CINEMATIC INJECTION
------------------------------------- */
function initGSAPAnimations() {
    // Only run heavily on index or pages where we want it. We'll load the scripts first.
    if (document.getElementById('gsap-script')) return;

    const gsapScript = document.createElement('script');
    gsapScript.id = 'gsap-script';
    gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    
    gsapScript.onload = () => {
        const scrollScript = document.createElement('script');
        scrollScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";
        scrollScript.onload = runCinematicAnimations;
        document.body.appendChild(scrollScript);
    };
    document.body.appendChild(gsapScript);
}

function runCinematicAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Common Animations:
    // If we have a hero section
    if (document.querySelector('.hero-title')) {
        document.querySelector('.hero-title').classList.remove('reveal');
        document.querySelector('.hero-desc').classList.remove('reveal');
        gsap.fromTo(".hero-title", 
            { y: 100, opacity: 0 }, 
            { duration: 1.5, y: 0, opacity: 1, ease: "power4.out", delay: 1, clearProps: "transform" });
        gsap.fromTo(".hero-desc", 
            { y: 50, opacity: 0 }, 
            { duration: 1.5, y: 0, opacity: 1, ease: "power3.out", delay: 1.3, clearProps: "transform" });
        gsap.fromTo(".hearts-row i", 
            { scale: 0, opacity: 0 }, 
            { duration: 0.8, scale: 1, opacity: 1, stagger: 0.1, ease: "back.out(1.7)", delay: 1.6, clearProps: "transform" });
    }

    // Scroll reveal for all section titles
    gsap.utils.toArray('.section-title').forEach(title => {
        title.classList.remove('reveal');
        gsap.fromTo(title, 
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                clearProps: "transform"
            });
    });

    // 3D Tilt Cards staggered reveal
    if (document.querySelector('.reasons-grid')) {
        document.querySelectorAll('.tilt-card').forEach(card => card.classList.remove('reveal'));
        gsap.fromTo(".tilt-card", 
            { y: 100, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: ".reasons-grid",
                    start: "top 80%"
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "back.out(1.2)",
                clearProps: "transform"
            });
    }

    // Cake Parallax
    if (document.querySelector('.cake-container')) {
        gsap.to(".cake-container", {
            scrollTrigger: {
                trigger: ".cake-container",
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            },
            y: -50,
            rotation: 2
        });
    }

    // Timeline line draw
    if (document.querySelector('.timeline')) {
        const timelineItems = gsap.utils.toArray('.timeline-item');
        timelineItems.forEach((item, i) => {
            item.classList.remove('reveal');
            gsap.fromTo(item, 
                { x: i % 2 === 0 ? -100 : 100, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 85%"
                    },
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    clearProps: "transform"
                });
        });
    }
}

/* -------------------------------------
   5. MAGNETIC INTERACTIVE BUTTONS
------------------------------------- */
function initMagneticInteractions() {
    // Select both primary buttons and specific interactive elements
    const magnetics = document.querySelectorAll('.slider-btn, .home-btn, .nav-btn, button');
    
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const position = btn.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            // Apply magnetic pull securely without breaking layout
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            btn.style.transition = 'transform 0.1s ease-out';
        });

        btn.addEventListener('mouseout', (e) => {
            btn.style.transform = '';
            // Snappy spring back
            btn.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
}

/* -------------------------------------
   6. 3D VANILLA TILT GLOBALLY
------------------------------------- */
function initVanillaTilt() {
    if (document.getElementById('tilt-script')) return;

    const tiltScript = document.createElement('script');
    tiltScript.id = 'tilt-script';
    tiltScript.src = "https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js";
    
    tiltScript.onload = () => {
        // Apply tilt globally to all photo cards and interactive polaroids
        VanillaTilt.init(document.querySelectorAll(".gallery-item, .card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.4,
            scale: 1.05
        });
    };
    document.body.appendChild(tiltScript);
}
