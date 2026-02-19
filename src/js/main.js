// signed: rohit
/*
    File: main.js
    Purpose: handles boot screen, observers and UI interactions
    Signed by: rohit
*/
// Boot Screen Animation
document.addEventListener('DOMContentLoaded', () => {
    // Sanitize URL immediately on load to prevent unsafe or unexpected URL parts
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

// End of file - signed: RohitRauniyar
