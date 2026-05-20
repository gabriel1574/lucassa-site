/* =========================================================
   Lucas Andrade — Interações e animações
   ========================================================= */

(() => {
    'use strict';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    /* -------------------------------------------------------
       Loader — fade-out após load
       ------------------------------------------------------- */
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader && loader.classList.add('is-done'), 1500);
    });

    /* -------------------------------------------------------
       Cursor customizado com easing
       ------------------------------------------------------- */
    if (!isTouch) {
        const cursor = document.getElementById('cursor');
        const dot = document.getElementById('cursorDot');
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let cx = mx, cy = my, dx = mx, dy = my;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            dx = mx; dy = my;
        });

        const render = () => {
            cx += (mx - cx) * 0.18;
            cy += (my - cy) * 0.18;
            if (cursor) cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px) translate(-50%, -50%)';
            if (dot) dot.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) translate(-50%, -50%)';
            requestAnimationFrame(render);
        };
        render();

        const hoverables = 'a, button, [data-magnetic], .company-item, .area-card, .contact-card';
        document.querySelectorAll(hoverables).forEach(el => {
            el.addEventListener('mouseenter', () => cursor && cursor.classList.add('is-hover'));
            el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('is-hover'));
        });
        document.addEventListener('mousedown', () => cursor && cursor.classList.add('is-click'));
        document.addEventListener('mouseup', () => cursor && cursor.classList.remove('is-click'));
    }

    /* -------------------------------------------------------
       Magnetic hover
       ------------------------------------------------------- */
    if (!isTouch && !reduce) {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            const strength = 0.25;
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = 'translate(' + (x * strength) + 'px, ' + (y * strength) + 'px)';
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    /* -------------------------------------------------------
       Spotlight em area-card
       ------------------------------------------------------- */
    if (!isTouch) {
        document.querySelectorAll('.area-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--my', (e.clientX - r.left) + 'px');
                card.style.setProperty('--mx', (e.clientY - r.top) + 'px');
            });
        });
    }

    /* -------------------------------------------------------
       Scroll progress + header sticky
       ------------------------------------------------------- */
    const progress = document.getElementById('scrollProgress');
    const header = document.getElementById('header');

    const onScroll = () => {
        const scrollY = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (scrollY / max) * 100 : 0;
        if (progress) progress.style.width = pct + '%';
        if (scrollY > 20) header && header.classList.add('is-scrolled');
        else header && header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* -------------------------------------------------------
       Reveal on scroll + split por palavras
       ------------------------------------------------------- */
    const revealEls = document.querySelectorAll('[data-reveal], [data-split]');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(el => {
        if (el.hasAttribute('data-split')) {
            const walkAndSplit = (parent) => {
                Array.from(parent.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent;
                        if (!text.trim()) return;
                        const frag = document.createDocumentFragment();
                        const tokens = text.split(/(\s+)/);
                        tokens.forEach(token => {
                            if (token === '') return;
                            if (/^\s+$/.test(token)) {
                                frag.appendChild(document.createTextNode(token));
                            } else {
                                const wrap = document.createElement('span');
                                wrap.className = 'split-word-wrap';
                                const word = document.createElement('span');
                                word.className = 'split-word';
                                word.textContent = token;
                                wrap.appendChild(word);
                                frag.appendChild(wrap);
                            }
                        });
                        node.parentNode.replaceChild(frag, node);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        walkAndSplit(node);
                    }
                });
            };
            walkAndSplit(el);
            el.querySelectorAll('.split-word').forEach((w, i) => {
                w.style.transitionDelay = (i * 70) + 'ms';
            });
        }
        revealObs.observe(el);
    });

    /* -------------------------------------------------------
       Counter animado para .stat-num
       ------------------------------------------------------- */
    const counters = document.querySelectorAll('.stat-num[data-count]');
    const countObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const duration = 1600;
            const start = performance.now();
            const step = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(target * eased);
                if (t < 1) requestAnimationFrame(step);
                else el.textContent = target;
            };
            requestAnimationFrame(step);
            countObs.unobserve(el);
        });
    }, { threshold: 0.4 });
    counters.forEach(c => countObs.observe(c));

    /* -------------------------------------------------------
       Menu mobile
       ------------------------------------------------------- */
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    menuToggle && menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('is-open');
        mobileMenu && mobileMenu.classList.toggle('is-open');
        document.body.style.overflow = mobileMenu && mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });
    mobileMenu && mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            menuToggle && menuToggle.classList.remove('is-open');
            mobileMenu.classList.remove('is-open');
            document.body.style.overflow = '';
        });
    });

    /* -------------------------------------------------------
       Footer — hora local + ano
       ------------------------------------------------------- */
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    const footerTime = document.getElementById('footerTime');
    if (footerTime) {
        const updateTime = () => {
            const now = new Date();
            const time = now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Sao_Paulo'
            });
            footerTime.textContent = 'Brasil · ' + time + ' · UTC−3';
        };
        updateTime();
        setInterval(updateTime, 30000);
    }

    /* -------------------------------------------------------
       Partículas no fundo
       ------------------------------------------------------- */
    if (!reduce) {
        const canvas = document.getElementById('particles');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let w, h, particles, mouseX = -1000, mouseY = -1000;

            const resize = () => {
                w = canvas.width = window.innerWidth * window.devicePixelRatio;
                h = canvas.height = window.innerHeight * window.devicePixelRatio;
                canvas.style.width = window.innerWidth + 'px';
                canvas.style.height = window.innerHeight + 'px';
            };

            const initParticles = () => {
                const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 22000));
                particles = Array.from({ length: count }, () => ({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    r: Math.random() * 1.4 + 0.4,
                    hue: Math.random() < 0.5 ? 270 : 190,
                    alpha: Math.random() * 0.5 + 0.2,
                }));
            };

            const draw = () => {
                ctx.clearRect(0, 0, w, h);

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    for (let j = i + 1; j < particles.length; j++) {
                        const q = particles[j];
                        const dx = p.x - q.x;
                        const dy = p.y - q.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const max = 140 * window.devicePixelRatio;
                        if (dist < max) {
                            const op = (1 - dist / max) * 0.18;
                            ctx.strokeStyle = 'rgba(140, 130, 220, ' + op + ')';
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(q.x, q.y);
                            ctx.stroke();
                        }
                    }
                }

                particles.forEach(p => {
                    const dx = p.x - mouseX;
                    const dy = p.y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const max = 120 * window.devicePixelRatio;
                    if (dist < max && dist > 0) {
                        const force = (1 - dist / max) * 0.6;
                        p.vx += (dx / dist) * force;
                        p.vy += (dy / dist) * force;
                    }

                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 0.985;
                    p.vy *= 0.985;
                    if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.04;
                    if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.04;

                    if (p.x < 0) p.x = w;
                    if (p.x > w) p.x = 0;
                    if (p.y < 0) p.y = h;
                    if (p.y > h) p.y = 0;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r * window.devicePixelRatio, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(' + p.hue + ', 80%, 70%, ' + p.alpha + ')';
                    ctx.fill();
                });

                requestAnimationFrame(draw);
            };

            resize();
            initParticles();
            draw();

            window.addEventListener('resize', () => {
                resize();
                initParticles();
            });
            window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX * window.devicePixelRatio;
                mouseY = e.clientY * window.devicePixelRatio;
            });
            window.addEventListener('mouseleave', () => {
                mouseX = -1000; mouseY = -1000;
            });
        }
    }

    /* -------------------------------------------------------
       Smooth scroll
       ------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const y = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });

})();
