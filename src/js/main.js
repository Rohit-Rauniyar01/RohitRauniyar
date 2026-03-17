// signed: rohit
/*
    File: main.js
    Purpose: handles boot screen, observers and UI interactions
    Signed by: rohit
*/
// Boot Screen Animation
document.addEventListener('DOMContentLoaded', () => {
    (function sanitizeUrl() {
        try {
            const url = new URL(window.location.href);

            // Normalize pathname: remove duplicate slashes and resolve '.' and '..'
            const parts = url.pathname.split('/').filter(Boolean);
            const normalizedParts = [];
            parts.forEach(p => {
                if (p === '..') {
                    normalizedParts.pop();
                } else if (p !== '.') {
                    normalizedParts.push(p);
                }
            });
            const normalizedPath = '/' + normalizedParts.join('/');

            // Strip search/query parameters entirely (keep none)
            const sanitizedSearch = '';

            // Allow only safe fragment identifiers (alphanumeric, hyphen, underscore)
            let sanitizedHash = '';
            if (url.hash) {
                const candidate = url.hash.replace(/^#/, '');
                if (/^[A-Za-z0-9_\-]+$/.test(candidate)) {
                    sanitizedHash = '#' + candidate;
                }
            }

            const sanitized = url.origin + normalizedPath + sanitizedSearch + sanitizedHash;
            const current = window.location.origin + window.location.pathname + window.location.search + window.location.hash;
            if (sanitized !== current) {
                history.replaceState(null, document.title, sanitized);
            }
        } catch (e) {
            // If URL parsing fails, do nothing — safer to leave URL unchanged
            console.warn('URL sanitization skipped:', e);
        }
    })();

    const bootScreen = document.getElementById('bootScreen');
    
    // Hide boot screen after animation completes
    setTimeout(() => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 500);
    }, 6000); // 6 seconds total boot time
    
    // Allow skipping with any key press or click
    const skipBoot = () => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 500);
    };
    
    document.addEventListener('keydown', skipBoot, { once: true });
    bootScreen.addEventListener('click', skipBoot, { once: true });

    // Reveal obfuscated contact details at runtime
    (function revealContact() {
        try {
            const emailEl = document.getElementById('contactEmail');
            if (emailEl) {
                const user = emailEl.dataset.user || '';
                const domain = emailEl.dataset.domain || '';
                if (user && domain) {
                    const email = user + '@' + domain;
                    emailEl.href = 'mailto:' + email;
                    emailEl.textContent = email;
                }
            }

            const form = document.getElementById('contactForm');
            if (form) {
                const proto = form.dataset.proto || '';
                const path = form.dataset.path || '';
                if (proto && path) {
                    // simple cleanup and assignment
                    form.action = proto.replace(/\s+/g, '') + path;
                }
            }
        } catch (e) {
            console.warn('Contact reveal failed:', e);
        }
    })();

    // Intercept contact form submission and show popup instead of redirect
    (function interceptContactSubmit() {
        function showPopup(message) {
            const existing = document.getElementById('formPopup');
            if (existing) existing.remove();
            const overlay = document.createElement('div');
            overlay.id = 'formPopup';
            Object.assign(overlay.style, {
                position: 'fixed', left: '0', top: '0', width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.45)', zIndex: 9999
            });
            const box = document.createElement('div');
            Object.assign(box.style, {
                background: '#111', color: '#fff', padding: '1.2rem 1.6rem', borderRadius: '8px',
                maxWidth: '90%', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', textAlign: 'center'
            });
            const p = document.createElement('p');
            p.textContent = message;
            p.style.margin = '0 0 1rem';
            const btn = document.createElement('button');
            btn.textContent = 'OK';
            Object.assign(btn.style, { padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' });
            btn.addEventListener('click', () => overlay.remove());
            box.appendChild(p);
            box.appendChild(btn);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
        }

        try {
            const form = document.getElementById('contactForm');
            if (!form) return;
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const action = form.action || (form.dataset.proto || '') + (form.dataset.path || '');
                    const formData = new FormData(form);
                    const res = await fetch(action, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });
                    if (res.ok) {
                        showPopup('Message sent successfully — the hacker will contact you soon');
                        form.reset();
                    } else {
                        showPopup('Message failed to send. Please try again later.');
                    }
                } catch (err) {
                    console.warn('Contact submit error:', err);
                    showPopup('Message failed to send. Please try again later.');
                }
            });
        } catch (e) {
            console.warn('Contact submit interception failed:', e);
        }
    })();
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.skill-progress');
            progressBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.skill-category').forEach(category => {
    skillObserver.observe(category);
});

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                lazyObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('lazy-section');
        lazyObserver.observe(section);
    });
});

let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
        document.body.style.overflowY = 'auto';
    }, 150);
}, { passive: true });

// Animated Character Interaction - signed: Rohit
(function initializeCharacter() {
    const character = document.getElementById('character');
    if (!character) return;

    const characterBody = character.querySelector('.character-body');
    const pupils = document.querySelectorAll('.pupil');
    const eyes = document.querySelectorAll('.eye');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isScrolling = false;
    let scrollTimeout;
    let lastScrollY = window.scrollY;
    let characterX = window.innerWidth - 90;
    let characterY = window.innerHeight - 100;

    // Track mouse movement to make eyes follow
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Move pupils to follow mouse
        pupils.forEach(pupil => {
            const eye = pupil.parentElement;
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
            const distance = 2; // Pupil movement distance
            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;

            pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
        });

        // Wave when user moves mouse around character
        const charRect = character.getBoundingClientRect();
        const distToMouse = Math.hypot(
            mouseX - (charRect.left + charRect.width / 2),
            mouseY - (charRect.top + charRect.height / 2)
        );

        if (distToMouse < 150) {
            character.classList.add('waving');
        } else {
            character.classList.remove('waving');
        }
    });

    // React to scrolling
    window.addEventListener('scroll', () => {
        const scrollDelta = Math.abs(window.scrollY - lastScrollY);
        lastScrollY = window.scrollY;

        if (scrollDelta > 5) {
            isScrolling = true;
            character.classList.add('scrolling');
            character.classList.add('excited');

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                character.classList.remove('scrolling');
                character.classList.remove('excited');
            }, 1000);
        }
    }, { passive: true });

    // Position character based on scroll - makes it "sticky"
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        // Character stays in viewport corner but follows scroll slightly
        characterY = Math.min(window.innerHeight - 100, 50 + scrollY * 0.1);
        character.style.bottom = (window.innerHeight - characterY) + 'px';
    }, { passive: true });

    // Adjust character position on window resize
    window.addEventListener('resize', () => {
        const newRight = Math.max(20, window.innerWidth - characterX);
        if (newRight < window.innerWidth) {
            character.style.right = newRight + 'px';
        }
    });

    // Add subtle floating animation that syncs with character mood
    character.classList.add('floating');

    // Random expressions occasionally
    setInterval(() => {
        const mouth = character.querySelector('.character-mouth');
        if (Math.random() > 0.7 && !isScrolling) {
            // Happy expression
            mouth.style.borderRadius = '0 0 12px 12px';
            mouth.style.height = '8px';
        } else {
            mouth.style.borderRadius = '0 0 12px 12px';
            mouth.style.height = '6px';
        }
    }, 3000);
})();

// End of file - signed: RohitRauniyar
