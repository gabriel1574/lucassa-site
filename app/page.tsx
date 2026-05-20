'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    /* Loader */
    const loader = document.getElementById('loader');
    const onLoad = () => {
      setTimeout(() => loader && loader.classList.add('is-done'), 1500);
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);

    /* Cursor customizado */
    let rafCursor = 0;
    if (!isTouch) {
      const cursor = document.getElementById('cursor');
      const dot = document.getElementById('cursorDot');
      let mx = window.innerWidth / 2,
        my = window.innerHeight / 2;
      let cx = mx,
        cy = my,
        dx = mx,
        dy = my;

      const onMove = (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
        dx = mx;
        dy = my;
      };
      window.addEventListener('mousemove', onMove);

      const render = () => {
        cx += (mx - cx) * 0.18;
        cy += (my - cy) * 0.18;
        if (cursor)
          cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
        if (dot)
          dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
        rafCursor = requestAnimationFrame(render);
      };
      render();

      const hoverables =
        'a, button, [data-magnetic], .company-item, .area-card, .contact-card';
      document.querySelectorAll(hoverables).forEach((el) => {
        el.addEventListener('mouseenter', () => cursor?.classList.add('is-hover'));
        el.addEventListener('mouseleave', () =>
          cursor?.classList.remove('is-hover')
        );
      });
      document.addEventListener('mousedown', () =>
        cursor?.classList.add('is-click')
      );
      document.addEventListener('mouseup', () =>
        cursor?.classList.remove('is-click')
      );
    }

    /* Magnetic hover */
    if (!isTouch && !reduce) {
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        const strength = 0.25;
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
        });
      });
    }

    /* Spotlight em area-card */
    if (!isTouch) {
      document.querySelectorAll<HTMLElement>('.area-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--my', `${e.clientX - r.left}px`);
          card.style.setProperty('--mx', `${e.clientY - r.top}px`);
        });
      });
    }

    /* Scroll progress + header sticky */
    const progress = document.getElementById('scrollProgress');
    const header = document.getElementById('header');
    const onScroll = () => {
      const scrollY = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (scrollY / max) * 100 : 0;
      if (progress) progress.style.width = `${pct}%`;
      if (scrollY > 20) header?.classList.add('is-scrolled');
      else header?.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Reveal on scroll + split por palavras (split lazy: so quando o
       elemento entra no viewport, evita reflow pesado na montagem) */
    const revealEls = document.querySelectorAll('[data-reveal], [data-split]');

    const walkAndSplit = (parent: Node) => {
      Array.from(parent.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (!text.trim()) return;
          const frag = document.createDocumentFragment();
          const tokens = text.split(/(\s+)/);
          tokens.forEach((token) => {
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
          node.parentNode?.replaceChild(frag, node);
        } else if (
          node.nodeType === Node.ELEMENT_NODE &&
          !(node as Element).classList.contains('split-word-wrap') &&
          !(node as Element).classList.contains('split-word')
        ) {
          walkAndSplit(node);
        }
      });
    };

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          if (el.hasAttribute('data-split') && !el.dataset.splitDone) {
            el.dataset.splitDone = 'true';
            walkAndSplit(el);
            el.querySelectorAll<HTMLElement>('.split-word').forEach((w, i) => {
              w.style.transitionDelay = `${i * 70}ms`;
            });
          }
          el.classList.add('is-visible');
          revealObs.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px 0px 0px' }
    );

    revealEls.forEach((el) => revealObs.observe(el));

    /* Safety fallback: forçar is-visible se observer não disparar em 2s */
    const fallbackTimer = setTimeout(() => {
      revealEls.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
        }
      });
    }, 2000);

    /* Counter animado */
    const counters = document.querySelectorAll<HTMLElement>(
      '.stat-num[data-count]'
    );
    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.count || '0', 10);
          const duration = 1600;
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = String(target);
          };
          requestAnimationFrame(step);
          countObs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => countObs.observe(c));

    /* Menu mobile */
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const onMenuClick = () => {
      menuToggle?.classList.toggle('is-open');
      mobileMenu?.classList.toggle('is-open');
      document.body.style.overflow = mobileMenu?.classList.contains('is-open')
        ? 'hidden'
        : '';
    };
    menuToggle?.addEventListener('click', onMenuClick);
    mobileMenu?.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        menuToggle?.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    /* Footer — hora local + ano */
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    const footerTime = document.getElementById('footerTime');
    let timeInterval: ReturnType<typeof setInterval> | null = null;
    if (footerTime) {
      const updateTime = () => {
        const now = new Date();
        const time = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo',
        });
        footerTime.textContent = `Brasil · ${time} · UTC−3`;
      };
      updateTime();
      timeInterval = setInterval(updateTime, 30000);
    }

    /* Partículas — deferred pra liberar o thread principal logo apos
       o primeiro paint (rIC com fallback p/ setTimeout) */
    let rafParticles = 0;
    let onResize: (() => void) | null = null;
    let onParticleMove: ((e: MouseEvent) => void) | null = null;
    let onMouseLeave: (() => void) | null = null;
    let idleHandle: number | null = null;
    const initParticlesDeferred = () => {
      const canvas = document.getElementById('particles') as HTMLCanvasElement | null;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          let w = 0,
            h = 0,
            particles: Array<{
              x: number;
              y: number;
              vx: number;
              vy: number;
              r: number;
              hue: number;
              alpha: number;
            }> = [],
            mouseX = -1000,
            mouseY = -1000;

          const resize = () => {
            w = canvas.width = window.innerWidth * window.devicePixelRatio;
            h = canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
          };

          const initParticles = () => {
            const count = Math.min(
              80,
              Math.floor((window.innerWidth * window.innerHeight) / 22000)
            );
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
                  ctx.strokeStyle = `rgba(140, 130, 220, ${op})`;
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(q.x, q.y);
                  ctx.stroke();
                }
              }
            }

            particles.forEach((p) => {
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
              ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
              ctx.fill();
            });

            rafParticles = requestAnimationFrame(draw);
          };

          resize();
          initParticles();
          draw();

          onResize = () => {
            resize();
            initParticles();
          };
          onParticleMove = (e: MouseEvent) => {
            mouseX = e.clientX * window.devicePixelRatio;
            mouseY = e.clientY * window.devicePixelRatio;
          };
          onMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
          };
          window.addEventListener('resize', onResize);
          window.addEventListener('mousemove', onParticleMove);
          window.addEventListener('mouseleave', onMouseLeave);
        }
      }
    };
    if (!reduce) {
      type WithRic = Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      const w = window as WithRic;
      if (typeof w.requestIdleCallback === 'function') {
        idleHandle = w.requestIdleCallback(initParticlesDeferred, { timeout: 1200 });
      } else {
        idleHandle = window.setTimeout(initParticlesDeferred, 200) as unknown as number;
      }
    }

    /* Smooth scroll */
    const smoothLinks = document.querySelectorAll<HTMLAnchorElement>(
      'a[href^="#"]'
    );
    smoothLinks.forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });

    return () => {
      cancelAnimationFrame(rafCursor);
      cancelAnimationFrame(rafParticles);
      clearTimeout(fallbackTimer);
      if (idleHandle !== null) {
        const w = window as Window & { cancelIdleCallback?: (id: number) => void };
        if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleHandle);
        else clearTimeout(idleHandle);
      }
      if (timeInterval) clearInterval(timeInterval);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('load', onLoad);
      if (onResize) window.removeEventListener('resize', onResize);
      if (onParticleMove) window.removeEventListener('mousemove', onParticleMove);
      if (onMouseLeave) window.removeEventListener('mouseleave', onMouseLeave);
      revealObs.disconnect();
      countObs.disconnect();
    };
  }, []);

  return (
    <>
      <div className="cursor" id="cursor"></div>
      <div className="cursor-dot" id="cursorDot"></div>

      <div className="loader" id="loader">
        <div className="loader-content">
          <span className="loader-text">L</span>
          <span className="loader-text">A</span>
        </div>
        <div className="loader-bar">
          <span></span>
        </div>
      </div>

      <div className="bg-gradient"></div>
      <canvas className="bg-particles" id="particles"></canvas>
      <div className="bg-grid"></div>
      <div className="bg-noise"></div>

      <div className="scroll-progress" id="scrollProgress"></div>

      <header className="header" id="header">
        <a href="#hero" className="logo" data-magnetic>
          <span className="logo-mark">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M6 6V26H26"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="logo-text">
            Lucas<span>Andrade</span>
          </span>
        </a>
        <nav className="nav">
          <a href="#sobre" className="nav-link" data-magnetic>
            <span>01</span>Sobre
          </a>
          <a href="#areas" className="nav-link" data-magnetic>
            <span>02</span>Áreas
          </a>
          <a href="#empresas" className="nav-link" data-magnetic>
            <span>03</span>Empresas
          </a>
          <a href="#contato" className="nav-link" data-magnetic>
            <span>04</span>Contato
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="lang-toggle"
            data-magnetic
            aria-label="Alternar idioma"
            type="button"
          >
            <span className="active">PT</span>
            <span>EN</span>
          </button>
          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label="Abrir menu"
            type="button"
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className="mobile-menu" id="mobileMenu">
        <nav>
          <a href="#sobre">
            <span>01</span>Sobre
          </a>
          <a href="#areas">
            <span>02</span>Áreas
          </a>
          <a href="#empresas">
            <span>03</span>Empresas
          </a>
          <a href="#contato">
            <span>04</span>Contato
          </a>
        </nav>
      </div>

      <main>
        <section className="hero" id="hero">
          <div className="hero-meta">
            <div className="meta-line">
              <span className="dot"></span>
              <span>Disponível para projetos</span>
            </div>
            <div className="meta-line">
              <span>Brasil · UTC−3</span>
            </div>
          </div>

          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="line">
                  <span className="word">Construo,</span>
                  <span className="word">posiciono</span>
                </span>
                <span className="line">
                  <span className="word accent">e&nbsp;protejo</span>
                </span>
                <span className="line">
                  <span className="word">produtos</span>
                  <span className="word">digitais.</span>
                </span>
              </h1>

              <p className="hero-desc">
                Sou <strong>Lucas Andrade</strong> — desenvolvedor, especialista em SEO,
                criador de aplicações e pentester. Acredito na intersecção entre código,
                posicionamento e segurança ofensiva como áreas <em>complementares</em>, nunca isoladas.
              </p>

              <div className="hero-cta">
                <a href="#contato" className="btn btn-primary" data-magnetic>
                  <span>Falar comigo</span>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a href="#areas" className="btn btn-ghost" data-magnetic>
                  <span>Ver áreas</span>
                </a>
              </div>
            </div>

            <div className="hero-photo">
              <div className="photo-frame">
                <div className="photo-glow"></div>
                <Image
                  src="/Imagens/me.avif"
                  alt="Lucas Andrade"
                  width={640}
                  height={640}
                  priority
                  sizes="(max-width: 480px) 260px, (max-width: 960px) 320px, 452px"
                />
                <div className="photo-tags">
                  <span className="photo-tag">@lucassame</span>
                  <span className="photo-tag photo-tag-2">Founder · Builder</span>
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-hint">
            <span>Scroll</span>
            <div className="scroll-line"></div>
          </div>
        </section>

        <section className="stats" aria-label="Números">
          <div className="stat" data-reveal>
            <span className="stat-num" data-count="11">0</span>
            <span className="stat-suffix">+</span>
            <span className="stat-label">Empresas fundadas</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat" data-reveal>
            <span className="stat-num" data-count="10">0</span>
            <span className="stat-suffix">+</span>
            <span className="stat-label">Anos de experiência</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat" data-reveal>
            <span className="stat-num" data-count="4">0</span>
            <span className="stat-label">Áreas de atuação</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat" data-reveal>
            <span className="stat-num" data-count="24">0</span>
            <span className="stat-suffix">h</span>
            <span className="stat-label">Tempo de resposta</span>
          </div>
        </section>

        <section className="section about" id="sobre">
          <div className="section-head">
            <span className="section-num">01 — Sobre</span>
            <h2 className="section-title" data-split>
              Três disciplinas, <em>uma</em> visão integrada.
            </h2>
          </div>
          <div className="about-grid">
            <div className="about-text" data-reveal>
              <p>
                Trabalho na intersecção entre <strong>desenvolvimento</strong>,{' '}
                <strong>SEO técnico</strong> e <strong>segurança ofensiva</strong>.
                Para mim, essas três áreas não são silos — são lentes diferentes
                sobre o mesmo objeto: produtos digitais que precisam existir,
                ser encontrados e resistir.
              </p>
              <p>
                Em mais de uma década entregando software, descobri que a maior parte
                dos problemas não está em uma área específica, mas nas <em>costuras</em>
                entre elas: um schema mal pensado quebra SEO, um header negligenciado
                vira vetor, uma feature mal posicionada nunca encontra usuário.
              </p>
              <p>
                Construo, posiciono e protejo — porque essas três coisas
                são, na prática, a mesma decisão.
              </p>
            </div>
            <aside className="about-card" data-reveal>
              <div className="card-row">
                <span className="card-key">Nome</span>
                <span className="card-val">Lucas Andrade</span>
              </div>
              <div className="card-row">
                <span className="card-key">Função</span>
                <span className="card-val">Dev · SEO · Pentest</span>
              </div>
              <div className="card-row">
                <span className="card-key">Local</span>
                <span className="card-val">Brasil · UTC−3</span>
              </div>
              <div className="card-row">
                <span className="card-key">CNPJ</span>
                <span className="card-val">33.832.085/0001-23</span>
              </div>
              <div className="card-row">
                <span className="card-key">Status</span>
                <span className="card-val">
                  <span className="status-dot"></span>
                  Aceitando projetos
                </span>
              </div>
            </aside>
          </div>
        </section>

        <section className="section areas" id="areas">
          <div className="section-head">
            <span className="section-num">02 — Áreas de atuação</span>
            <h2 className="section-title" data-split>
              O que eu faço, <em>de verdade</em>.
            </h2>
          </div>

          <div className="areas-grid">
            <article className="area-card" data-reveal>
              <div className="area-index">01</div>
              <div className="area-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 6L2 12l6 6M16 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Desenvolvimento</h3>
              <p>
                Aplicações web e mobile — front-end, back-end e infraestrutura.
                Foco em sistemas que duram, escalam e não viram dívida técnica em seis meses.
              </p>
              <ul className="area-stack">
                <li>JavaScript</li>
                <li>Python</li>
                <li>PHP</li>
                <li>React</li>
                <li>Node</li>
              </ul>
            </article>

            <article className="area-card" data-reveal>
              <div className="area-index">02</div>
              <div className="area-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3>SEO</h3>
              <p>
                SEO técnico, on-page, off-page e Core Web Vitals.
                Posicionamento orgânico tratado como engenharia, não como adivinhação.
              </p>
              <ul className="area-stack">
                <li>Técnico</li>
                <li>On-page</li>
                <li>Off-page</li>
                <li>CWV</li>
              </ul>
            </article>

            <article className="area-card" data-reveal>
              <div className="area-index">03</div>
              <div className="area-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Aplicações</h3>
              <p>
                SaaS, sistemas internos, dashboards e integrações.
                Produtos que resolvem o problema certo, com a complexidade mínima necessária.
              </p>
              <ul className="area-stack">
                <li>SaaS</li>
                <li>Dashboards</li>
                <li>Integrações</li>
                <li>Sistemas internos</li>
              </ul>
            </article>

            <article className="area-card" data-reveal>
              <div className="area-index">04</div>
              <div className="area-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Pentest</h3>
              <p>
                Testes de intrusão, análise de vulnerabilidades e hardening.
                Olhar adversarial sobre o próprio produto — antes que alguém faça isso por você.
              </p>
              <ul className="area-stack">
                <li>Pentest</li>
                <li>Vuln. analysis</li>
                <li>Hardening</li>
                <li>Red team</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section companies" id="empresas">
          <div className="section-head">
            <span className="section-num">03 — Empresas fundadas</span>
            <h2 className="section-title" data-split>
              Dezessete marcas. <em>Sete em destaque.</em>
            </h2>
          </div>

          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              <span>Adventury</span>
              <span>·</span>
              <span>Nebular</span>
              <span>·</span>
              <span>Basilisk</span>
              <span>·</span>
              <span>Volucer</span>
              <span>·</span>
              <span>Mediaz</span>
              <span>·</span>
              <span>Nixen</span>
              <span>·</span>
              <span>Azarod</span>
              <span>·</span>
              <span>Adventury</span>
              <span>·</span>
              <span>Nebular</span>
              <span>·</span>
              <span>Basilisk</span>
              <span>·</span>
              <span>Volucer</span>
              <span>·</span>
              <span>Mediaz</span>
              <span>·</span>
              <span>Nixen</span>
              <span>·</span>
              <span>Azarod</span>
              <span>·</span>
            </div>
          </div>

          <ul className="companies-list">
            {[
              { num: '01', name: 'Adventury', tag: 'Produto' },
              { num: '02', name: 'Nebular', tag: 'Tecnologia' },
              { num: '03', name: 'Basilisk', tag: 'Segurança' },
              { num: '04', name: 'Volucer', tag: 'Desenvolvimento' },
              { num: '05', name: 'Mediaz', tag: 'Mídia' },
              { num: '06', name: 'Azarod', tag: 'Site' },
              { num: '07', name: 'Nixen', tag: 'Site' },
              { num: '08', name: 'Nivrix', tag: 'Site' },
              { num: '09', name: 'Axuz', tag: 'Site' },
              { num: '10', name: 'Shark', tag: 'Site' },
              { num: '11', name: 'Otimiza Crédito', tag: 'Fintech' },
              { num: '12', name: 'Consicred', tag: 'Fintech' },
              { num: '13', name: 'Navor', tag: 'Site' },
              { num: '14', name: 'Bazam', tag: 'Site' },
              { num: '15', name: 'Schematize', tag: 'Site' },
              { num: '16', name: 'Vedrak', tag: 'Site' },
              { num: '17', name: 'Payle', tag: 'Site' },
            ].map((c) => (
              <li className="company-item" data-reveal key={c.num}>
                <span className="company-num">{c.num}</span>
                <h3 className="company-name">{c.name}</h3>
                <span className="company-tag">{c.tag}</span>
                <span className="company-arrow" aria-hidden="true">
                  ↗
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section contact" id="contato">
          <div className="section-head">
            <span className="section-num">04 — Contato</span>
            <h2 className="section-title big" data-split>
              Vamos <em>construir</em> algo?
            </h2>
          </div>

          <p className="contact-lead" data-reveal>
            Resposta típica em até <strong>24 horas</strong>. Para projetos,
            consultorias ou parcerias — escolha o canal mais confortável.
          </p>

          <div className="contact-grid">
            <a
              href="mailto:contato@lucassa.com"
              className="contact-card"
              data-magnetic
              data-reveal
            >
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M3 7l9 6 9-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="contact-key">Email</span>
              <span className="contact-val">contato@lucassa.com</span>
              <span className="contact-arrow">↗</span>
            </a>

            <a
              href="https://wa.me/5511969789917"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
              data-magnetic
              data-reveal
            >
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12a9 9 0 1 1-3.5-7.1L21 3l-1.1 3.5A9 9 0 0 1 21 12z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 11c.5 2 2 3.5 4 4l1.5-1.5 2.5 1v2c-4 0-8-4-8-8h2l1 2.5L8 11z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="contact-key">WhatsApp</span>
              <span className="contact-val">+55 11 96978-9917</span>
              <span className="contact-arrow">↗</span>
            </a>

            <a
              href="https://linkedin.com/in/lucassame/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
              data-magnetic
              data-reveal
            >
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M8 10v7M8 7.5v.01M12 17v-4a2 2 0 0 1 4 0v4M12 17v-7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="contact-key">LinkedIn</span>
              <span className="contact-val">/in/lucassame</span>
              <span className="contact-arrow">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <a href="#hero" className="footer-back" data-magnetic>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Voltar ao topo
          </a>
          <div className="footer-time" id="footerTime">
            Brasil · UTC−3
          </div>
        </div>
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-mark">LA</span>
            <p>
              Construindo, posicionando e protegendo
              produtos digitais desde 2014.
            </p>
          </div>
          <div className="footer-col">
            <span className="footer-label">Navegação</span>
            <a href="#sobre">Sobre</a>
            <a href="#areas">Áreas</a>
            <a href="#empresas">Empresas</a>
            <a href="#contato">Contato</a>
          </div>
          <div className="footer-col">
            <span className="footer-label">Contato</span>
            <a href="mailto:contato@lucassa.com">contato@lucassa.com</a>
            <a href="https://wa.me/5511969789917" target="_blank" rel="noopener noreferrer">
              +55 11 96978-9917
            </a>
            <a
              href="https://linkedin.com/in/lucassame/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
          <div className="footer-col">
            <span className="footer-label">Empresas</span>
            <span>Adventury</span>
            <span>Nebular</span>
            <span>Basilisk</span>
            <span>Volucer</span>
            <span>Mediaz</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © <span id="year">2026</span> Lucas Andrade · CNPJ 33.832.085/0001-23
          </span>
          <span>
            Feito à mão · <em>lucassa.me</em>
          </span>
        </div>
      </footer>
    </>
  );
}
