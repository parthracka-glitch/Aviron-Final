/**
 * AVIRON DIGITAL STUDIO - Interactive UI Controller
 * Preloader animation sequence, 3D card tilt physics, mobile navigation drawer,
 * and Hero typography stagger animations
 */

import { getLenis } from './scroll.js';

export function initInteractions() {
  initPreloader();
  initCustomCursor();
  initMagneticElements();
  initCardSpotlights();
  initCardTilts();
  initButtonRipples();
  initKineticTypography();
  initTextScramble();
  initMobileMenu();
  initBackToTop();
}

/**
 * 0. Preloader Sequence (GSAP staggered letters + failsafe + skip button)
 */
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  const skipBtn = document.querySelector('.preloader-skip');
  if (!preloader) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function dismissPreloader() {
    if (!preloader || preloader.classList.contains('preloader--hidden')) return;
    preloader.classList.add('preloader--hidden');
    setTimeout(() => {
      preloader.style.display = 'none';
      triggerHeroEntrance();
    }, 800);
  }

  // Skip button click & Escape key support
  if (skipBtn) {
    skipBtn.addEventListener('click', dismissPreloader);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dismissPreloader();
    }
  });

  // Hard failsafe: remove overlay after 8s
  const failsafeTimer = setTimeout(dismissPreloader, 8000);

  // Reduced motion: fade out quickly
  if (prefersReduced) {
    clearTimeout(failsafeTimer);
    setTimeout(dismissPreloader, 400);
    return;
  }

  // GSAP animation sequence
  if (typeof gsap !== 'undefined') {
    const chars = preloader.querySelectorAll('.p-char');
    const subtitle = preloader.querySelector('.preloader-subtitle');

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(failsafeTimer);
        dismissPreloader();
      }
    });

    // 1. Letters stagger in from small scale & translateY
    tl.fromTo(chars,
      { scale: 0.4, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(1.7)' },
      0.3
    );

    // 2. At 2.5s: "DIGITAL STUDIO" fades in below
    if (subtitle) {
      tl.to(subtitle, { opacity: 1, y: -4, duration: 0.6, ease: 'power2.out' }, 2.3);
    }

    // 3. At 3.5s: all letters scale up 1.4x and fade out
    tl.to(chars, { scale: 1.35, opacity: 0, y: -10, duration: 0.55, ease: 'power3.in' }, 3.5);
    if (subtitle) {
      tl.to(subtitle, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 3.6);
    }

    // 4. Overlay fades out at 4.2s
    tl.to(preloader, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 4.0);
  } else {
    // Fallback if GSAP is unavailable
    setTimeout(dismissPreloader, 3500);
  }
}

/**
 * Hero Typography Entrance Animation
 */
function triggerHeroEntrance() {
  if (typeof gsap === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const heroEyebrow = document.querySelector('.hero-eyebrow-wrap');
  if (heroEyebrow) {
    gsap.fromTo(heroEyebrow,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.1 }
    );
  }

  const heroChars = document.querySelectorAll('.hero-title .char, .hero-title .title-highlight');
  if (heroChars.length > 0) {
    gsap.fromTo(heroChars,
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.15 }
    );
  }

  const heroFadeEls = document.querySelectorAll(
    '.hero-lede, .hero-actions, .hero-scroll-indicator'
  );
  if (heroFadeEls.length > 0) {
    gsap.fromTo(heroFadeEls,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, stagger: 0.08, ease: 'power3.out', delay: 0.3 }
    );
  }
}

/**
 * 3D Mouse Card Tilt Physics
 * Applied to Service Cards and Pricing Cards with scale-awareness
 */
function initCardTilts() {
  if (window.innerWidth < 900 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const tiltableCards = document.querySelectorAll('.service-card, .pricing-card');

  tiltableCards.forEach((card) => {
    const isFeatured = card.classList.contains('pricing-card--featured');
    const baseScale = isFeatured ? 1.03 : 1;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * 8;
      const rotateX = -y * 6;

      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotationY: rotateY,
          rotationX: rotateX,
          scale: baseScale,
          transformPerspective: 900,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          scale: baseScale,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(card, { clearProps: isFeatured ? 'rotationX,rotationY' : 'transform' });
          }
        });
      }
    });
  });
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-footer a');

  if (!toggleBtn || !mobileNav) return;

  function toggleMenu() {
    const isOpen = mobileNav.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    mobileNav.classList.add('is-open');
    toggleBtn.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const lenis = typeof getLenis === 'function' ? getLenis() : null;
    if (lenis) lenis.stop();
  }

  function closeMenu() {
    mobileNav.classList.remove('is-open');
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    const lenis = typeof getLenis === 'function' ? getLenis() : null;
    if (lenis) lenis.start();
  }

  toggleBtn.addEventListener('click', toggleMenu);

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/**
 * Smooth Back-To-Top Controller
 */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.btn-back-top');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Custom Minimalist Precision Cursor with Spring Follower & Dynamic Morphism States
 */
function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse), (hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const label = ring ? ring.querySelector('.cursor-label') : null;
  if (!dot || !ring) return;

  let targetX = -100;
  let targetY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;

  function onMouseMove(e) {
    targetX = e.clientX;
    targetY = e.clientY;

    dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;

    if (!isVisible) {
      isVisible = true;
      dot.classList.add('is-visible');
      ring.classList.add('is-visible');
    }
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    dot.classList.remove('is-visible');
    ring.classList.remove('is-visible');
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    dot.classList.add('is-visible');
    ring.classList.add('is-visible');
  });

  // Smooth lerp loop for outer ring
  function renderCursor() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Dynamic hover state delegation
  document.addEventListener('mouseover', (e) => {
    const target = e.target;

    if (target.closest('.work-card')) {
      ring.className = 'cursor-ring is-visible cursor--work';
      if (label) label.textContent = 'EXPLORE ↗';
      dot.style.opacity = '0';
    } else if (target.closest('input, textarea')) {
      ring.className = 'cursor-ring is-visible cursor--text';
      if (label) label.textContent = '';
      dot.style.opacity = '0';
    } else if (target.closest('a, button, [role="button"], .btn-link-action, .work-note-cta, .rotating-stamp, .service-link')) {
      ring.className = 'cursor-ring is-visible cursor--hover';
      if (label) label.textContent = '';
      dot.style.opacity = '1';
    } else if (target.closest('.service-card, .pricing-card, .addon-card, .process-row, .tech-pricing-container')) {
      ring.className = 'cursor-ring is-visible cursor--card-hover';
      if (label) label.textContent = '';
      dot.style.opacity = '1';
    } else {
      ring.className = 'cursor-ring is-visible';
      if (label) label.textContent = '';
      dot.style.opacity = '1';
    }
  }, { passive: true });

  document.addEventListener('mousedown', () => {
    ring.classList.add('cursor--active');
  });

  document.addEventListener('mouseup', () => {
    ring.classList.remove('cursor--active');
  });
}

/**
 * Smooth Magnetic Attraction on Action Buttons & Interactive Emblems
 */
function initMagneticElements() {
  if (window.matchMedia('(pointer: coarse), (hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const magneticTargets = document.querySelectorAll(
    '.btn-primary, .btn-secondary, .btn-header-cta, .btn-submit, .btn-pricing, .rotating-stamp, .preloader-skip, .work-note-cta, .btn-back-top'
  );

  magneticTargets.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      if (typeof gsap !== 'undefined') {
        gsap.to(el, {
          x: relX * 0.3,
          y: relY * 0.3,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        const inner = el.querySelector('span') || el.querySelector('.stamp-center-icon');
        if (inner) {
          gsap.to(inner, {
            x: relX * 0.15,
            y: relY * 0.15,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      }
    });

    el.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: 'elastic.out(1.1, 0.35)',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(el, { clearProps: 'transform' });
          }
        });

        const inner = el.querySelector('span') || el.querySelector('.stamp-center-icon');
        if (inner) {
          gsap.to(inner, {
            x: 0,
            y: 0,
            duration: 0.65,
            ease: 'elastic.out(1.1, 0.35)',
            overwrite: 'auto',
            onComplete: () => {
              gsap.set(inner, { clearProps: 'transform' });
            }
          });
        }
      }
    });
  });
}

/**
 * Dynamic Card Spotlight Coordinates
 * Feeds --mouse-x and --mouse-y into morphism cards for radial specular illumination
 */
function initCardSpotlights() {
  const cards = document.querySelectorAll(
    '.service-card, .pricing-card, .work-card, .addon-card, .process-row, .contact-badge-card, .contact-form-container, .tech-pricing-container'
  );

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
      card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
    }, { passive: true });
  });
}

/**
 * Fluid Button Click Ripple Wave Effect
 */
function initButtonRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-header-cta, .btn-submit, .btn-pricing, .work-note-cta, .btn-back-top');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    btn.appendChild(ripple);

    setTimeout(() => {
      if (ripple && ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 700);
  });
}

/**
 * Kinetic Wave Micro-interactions for Headline Typography
 */
function initKineticTypography() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroChars = document.querySelectorAll('.hero-title .char');
  heroChars.forEach((char) => {
    const isHighlight = char.closest('em, .title-highlight');

    char.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        if (isHighlight) {
          gsap.fromTo(char,
            { y: 0, scale: 1 },
            {
              y: -8,
              scale: 1.2,
              duration: 0.22,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1,
              overwrite: 'auto',
              onComplete: () => {
                gsap.set(char, { clearProps: 'transform' });
              }
            }
          );
        } else {
          gsap.fromTo(char,
            { y: 0, scale: 1, color: '#f0ede5' },
            {
              y: -7,
              scale: 1.15,
              color: '#c4a96a',
              duration: 0.2,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1,
              overwrite: 'auto',
              onComplete: () => {
                gsap.set(char, { clearProps: 'all' });
              }
            }
          );
        }
      }
    });
  });

  const highlightEl = document.querySelector('.hero-title .title-highlight');
  if (highlightEl) {
    highlightEl.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(highlightEl,
          { y: 0, scale: 1 },
          {
            y: -5,
            scale: 1.05,
            duration: 0.22,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            overwrite: 'auto',
            onComplete: () => {
              gsap.set(highlightEl, { clearProps: 'transform' });
            }
          }
        );
      }
    });
  }
}

/**
 * Cyber-Luxe Text Scramble / Decrypt Animation
 * Applied to kickers and brand name (understated luxury hero eyebrow remains pristine)
 */
function initTextScramble() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const scrambleTargets = document.querySelectorAll('.section-kicker, .brand-name');
  const glyphs = '·✳◊+/−#@&~*|/[]{}<>';

  scrambleTargets.forEach((el) => {
    const originalText = el.textContent.trim();
    let isScrambling = false;

    el.addEventListener('mouseenter', () => {
      if (isScrambling) return;
      isScrambling = true;

      let iteration = 0;
      const totalFrames = originalText.length * 2.5;
      const interval = setInterval(() => {
        el.textContent = originalText
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '·' || char === '/') return char;
            if (index < iteration / 2.5) {
              return originalText[index];
            }
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join('');

        iteration++;
        if (iteration > totalFrames) {
          clearInterval(interval);
          el.textContent = originalText;
          isScrambling = false;
        }
      }, 35);
    });
  });
}
