const navmid= document.querySelector('.middle');
const hero   = document.querySelector('.hero');
const heroVideo = document.querySelector('.video');
const menuPage  = document.querySelector('.menuPage');
const modeBtn  = document.querySelector('.modeBtn');
const cursor  = document.querySelector('.cursor');
const cards  = document.querySelectorAll('.card');
const projContainers = document.querySelectorAll('.project-container');
const bigPlayground = document.querySelector('.big-playground');
const serviceRows = document.querySelectorAll('.services > div[class^="se"]');
const talkTag  = document.querySelector('.talk-tag');
const helloTrigger   = document.querySelector('.hello-trigger');
const footerSection  = document.querySelector('.footer-section');
const detail         = document.querySelector('.detail');
const playgroundWord = document.querySelector('.playground-word');
const images1  = document.querySelectorAll('.images1 img');
const images2     = document.querySelectorAll('.images2 img');
const imageBox1  = document.querySelector('.images1');
const imageBox2  = document.querySelector('.images2');

const preloader = document.getElementById('preloader');
const preloaderVideo = document.getElementById('preloader-video');
const cursorLabel = cursor?.querySelector('span');

let preloaderHidden = false;
let preloaderTimer = null;

function hidePreloader() {
    if (!preloader || preloaderHidden) return;
    preloaderHidden = true;
    if (preloaderTimer) window.clearTimeout(preloaderTimer);
    preloader.classList.add('hidden');
}

if (preloaderVideo) {
    const startPreloaderHide = () => {
        preloaderVideo.classList.add('ready');

        if (Number.isFinite(preloaderVideo.duration) && preloaderVideo.duration > 0) {
            const videoDurationMs = Math.max(preloaderVideo.duration * 1000, 1500);
            preloaderTimer = window.setTimeout(hidePreloader, videoDurationMs);
        } else {
            preloaderTimer = window.setTimeout(hidePreloader, 4000);
        }
    };

    preloaderVideo.addEventListener('loadeddata', startPreloaderHide);
    preloaderVideo.addEventListener('canplaythrough', startPreloaderHide);
    preloaderVideo.addEventListener('play', () => preloaderVideo.classList.add('ready'));
    preloaderVideo.addEventListener('ended', hidePreloader);
    preloaderVideo.addEventListener('error', () => {
        preloaderVideo.classList.add('ready');
        hidePreloader();
    });
}

window.addEventListener('load', () => {
    if (preloaderVideo && preloaderVideo.readyState >= 2) {
        preloaderVideo.classList.add('ready');
    }
});

/* ---------- STATE ---------- */
let isOpen   = false;
let isDark   = false;
let mouseX   = 0, mouseY = 0;
let curX     = 0, curY   = 0;
let zCounter = 1;

/* ---------- LERP ---------- */
const lerp = (a, b, n) => a + (b - a) * n;

/* ---------- CURSOR RAF LOOP ---------- */
function rafLoop() {
    curX = lerp(curX, mouseX, 0.18);
    curY = lerp(curY, mouseY, 0.18);

    if (cursor) {
        cursor.style.left = curX + 'px';
        cursor.style.top  = curY + 'px';
    }

    // hero video follows mouse (lerped)
    if (heroVideo) {
        let vx = parseFloat(heroVideo.dataset.x) || mouseX;
        let vy = parseFloat(heroVideo.dataset.y) || mouseY;
        vx += (mouseX - vx) * 0.1;
        vy += (mouseY - vy) * 0.1;
        heroVideo.dataset.x = vx;
        heroVideo.dataset.y = vy;
        heroVideo.style.left = vx + 'px';
        heroVideo.style.top  = vy + 'px';
    }

    // talk tag follows mouse
    if (talkTag && talkTag.classList.contains('active')) {
        talkTag.style.left = mouseX + 'px';
        talkTag.style.top  = mouseY + 'px';
    }

    requestAnimationFrame(rafLoop);
}

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
requestAnimationFrame(rafLoop);

/* ---------- DARK MODE ---------- */
if (modeBtn) {
    modeBtn.addEventListener('click', () => {
        isDark = !isDark;
        document.body.classList.toggle('dark', isDark);
        modeBtn.textContent = isDark ? 'LIGHT MODE' : 'DARK MODE';
    });
}

/* ---------- NAV MENU ---------- */
if (navmid) {
    navmid.addEventListener('mouseover', () => {
        if (!isOpen) navmid.textContent = 'OPEN';
    });
    navmid.addEventListener('mouseout', () => {
        if (!isOpen) navmid.textContent = 'MENU';
    });
    navmid.addEventListener('click', () => {
        isOpen = !isOpen;
        hero.classList.toggle('movedown', isOpen);
        menuPage.classList.toggle('active', isOpen);
        navmid.textContent = isOpen ? 'CLOSE' : 'MENU';
    });
}

/* ---------- HERO VIDEO VISIBILITY ---------- */
if (hero && heroVideo) {
    hero.addEventListener('mouseenter', () => { heroVideo.style.opacity = '1'; });
    hero.addEventListener('mouseleave', () => { heroVideo.style.opacity = '0'; });
}

/* ---------- PROJECT CARDS — video swap + floating tag ---------- */
projContainers.forEach(container => {
    const card = container.querySelector('.card');
    const vid  = container.querySelector('video');
    const img  = container.querySelector('img');
    const tag  = container.querySelector('.floating-tag');

    if (!card) return;

    // lerp the tag
    let tx = 0, ty = 0, tagActive = false;
    function lerpTag() {
        if (!tagActive) return;
        tx = lerp(tx, mouseX, 0.14);
        ty = lerp(ty, mouseY, 0.14);
        if (tag) { tag.style.left = tx + 'px'; tag.style.top = ty + 'px'; }
        requestAnimationFrame(lerpTag);
    }

    card.addEventListener('mouseenter', () => {
        // show video, hide image
        if (vid) { vid.style.opacity = '1'; vid.style.transform = 'scale(1)'; vid.play(); }
        if (img) img.style.opacity = '0';
        // show tag and update cursor label
        if (tag) {
            tx = mouseX;
            ty = mouseY;
            tag.style.opacity = '1';
            tagActive = true;
            lerpTag();
            if (cursorLabel) cursorLabel.textContent = tag.textContent.trim();
        }
        // expand cursor
        cursor?.classList.add('portfolio-hover');
    });

    card.addEventListener('mouseleave', () => {
        if (vid) { vid.style.opacity = '0'; vid.style.transform = 'scale(1.06)'; vid.pause(); }
        if (img) img.style.opacity = '1';
        if (tag) { tag.style.opacity = '0'; tagActive = false; }
        cursor?.classList.remove('portfolio-hover');
    });

    if (vid) {
        vid.addEventListener('mouseenter', event => {
            event.stopPropagation();
            cursor?.classList.remove('portfolio-hover');
        });

        vid.addEventListener('mouseleave', () => {
            if (card.matches(':hover')) {
                cursor?.classList.add('portfolio-hover');
            }
        });
    }
});

/* ---------- BIG PLAYGROUND CURSOR ---------- */
if (bigPlayground) {
    bigPlayground.addEventListener('mouseenter', () => cursor?.classList.add('portfolio-hover'));
    bigPlayground.addEventListener('mouseleave', () => cursor?.classList.remove('portfolio-hover'));
}

/* ---------- SERVICE ROWS CURSOR ---------- */
serviceRows.forEach(row => {
    row.addEventListener('mouseenter', () => {});
    row.addEventListener('mouseleave', () => {});
});

/* ---------- HELLO / TALK TAG ---------- */
if (talkTag && helloTrigger) {
    helloTrigger.addEventListener('mouseenter', () => {
        talkTag.style.left = mouseX + 'px';
        talkTag.style.top  = mouseY + 'px';
        talkTag.classList.add('active');
    });
    helloTrigger.addEventListener('mouseleave', () => {
        talkTag.classList.remove('active');
    });
}

/* ---------- IMAGE STACK HELPER ---------- */
function setupImageStack(trigger, imgBox, imgs) {
    if (!trigger || !imgBox || !imgs.length) return;
    let current  = 0;
    let interval = null;
    let zCtr     = 1;

    trigger.addEventListener('mousemove', e => {
        const rect = trigger.getBoundingClientRect();
        imgBox.style.left = (e.clientX - rect.left) + 'px';
        imgBox.style.top  = (e.clientY - rect.top - 200) + 'px';
    });

    trigger.addEventListener('mouseenter', () => {
        clearInterval(interval);
        interval = setInterval(() => {
            const img = imgs[current];
            img.style.transition = 'none';
            img.style.opacity    = '0';
            img.style.transform  = 'translateY(80px) scale(0.95)';
            img.style.zIndex     = zCtr++;
            void img.offsetHeight; // force reflow
            img.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
            img.style.opacity    = '1';
            img.style.transform  = 'translateY(0) scale(1)';
            current = (current + 1) % imgs.length;
        }, 280);
    });

    trigger.addEventListener('mouseleave', () => {
        clearInterval(interval);
        imgs.forEach(img => {
            img.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
            img.style.opacity    = '0';
            img.style.transform  = 'translateY(80px) scale(0.95)';
        });
        current = 0;
        zCtr    = 1;
    });
}

setupImageStack(detail,        imageBox1, Array.from(images1));
setupImageStack(playgroundWord, imageBox2, Array.from(images2));



/* ---------- SCROLL REVEAL ---------- */
(function setupReveal() {
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---------- FOOTER NAMMA PARALLAX ---------- */
(function footerParallax() {
    if (!footerSection) return;
    const spans = footerSection.querySelectorAll('.foot-logo span');

    window.addEventListener('scroll', () => {
        const rect     = footerSection.getBoundingClientRect();
        const vh       = window.innerHeight;
        const progress = Math.max(0, Math.min(1, 1 - rect.bottom / (vh + rect.height)));
        spans.forEach((s, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            s.style.transform = `scaleY(1.2) translateX(${dir * progress * 28}px)`;
        });
    }, { passive: true });
})();