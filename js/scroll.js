/**
 * AVIRON DIGITAL STUDIO - Scroll Controller
 * Lenis smooth scrolling, GSAP ScrollTrigger integrations, horizontal work pinning,
 * process line drawing, header scroll progress, and reveal animations
 */

let lenisInstance = null;

export function initScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Initialize Lenis Smooth Scroll (unless reduced motion is preferred)
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true
    });

    // Synchronize Lenis with GSAP ScrollTrigger if available, otherwise use standalone RAF
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenisInstance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // 2. Header Scroll Effects & Progress Bar
  const header = document.querySelector('.site-header');
  const progressBar = document.querySelector('.scroll-progress');

  function onScrollHandler() {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    // Update bottom gold line
    if (progressBar) {
      progressBar.style.width = (progress * 100) + '%';
    }

    // Toggle glass blur class
    if (header) {
      if (scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', onScrollHandler, { passive: true });
  onScrollHandler();

  // If GSAP or ScrollTrigger are not loaded, fallback gracefully
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) {
    document.body.classList.add('js-loaded');
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('js-loaded');

  // 3. Hero Subtle Parallax & Indicator Fade
  const heroShell = document.querySelector('.hero-shell');
  if (heroShell) {
    gsap.to(heroShell, {
      yPercent: -6,
      opacity: 0.85,
      ease: "none",
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  const scrollIndicator = document.querySelector('.hero-scroll-indicator');
  if (scrollIndicator) {
    gsap.to(scrollIndicator, {
      opacity: 0,
      y: 12,
      ease: "none",
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '35% top',
        scrub: true
      }
    });
  }

  // 4. Pinned Horizontal Work Reel for Desktop (min-width: 900px)
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    const workSection = document.querySelector('.work-section');
    const track = document.querySelector('.work-track');

    if (workSection && track) {
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + (window.innerWidth * 0.11));

      gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: workSection,
          start: 'top top',
          end: () => '+=' + (track.scrollWidth - window.innerWidth + 400),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    }
  });

  // 5. Process Line Scrub & Step Highlighting
  const processLineFill = document.querySelector('.process-line-fill');
  const processList = document.querySelector('.process-list');

  if (processLineFill && processList) {
    gsap.to(processLineFill, {
      scaleY: 1,
      transformOrigin: 'top center',
      ease: 'none',
      scrollTrigger: {
        trigger: processList,
        start: 'top 70%',
        end: 'bottom 35%',
        scrub: true
      }
    });

    const processRows = document.querySelectorAll('.process-row');
    processRows.forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: 'top 65%',
        end: 'bottom 35%',
        onEnter: () => row.classList.add('is-active'),
        onEnterBack: () => row.classList.add('is-active'),
        onLeave: () => row.classList.remove('is-active'),
        onLeaveBack: () => row.classList.remove('is-active')
      });
    });
  }

  // 6. Generic Scroll Reveals for Elements Marked with .reveal
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((el) => {
    gsap.fromTo(el, 
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });

  // 7. Smooth Anchor Scrolling via Lenis or standard scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, { offset: -74, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

export function getLenis() {
  return lenisInstance;
}
