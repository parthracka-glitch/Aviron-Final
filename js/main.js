/**
 * AVIRON DIGITAL STUDIO - Main Application Entrypoint
 * Bootstraps all subsystems: Preloader, Three.js canvas, Lenis scroll,
 * GSAP animations, form handling, and interactive physics.
 */

import { initThreeScene } from './three-scene.js';
import { initScroll } from './scroll.js';
import { initInteractions } from './interactions.js';
import { initForm } from './form.js';

// Expose Aviron Studio global namespace
window.Aviron = {
  initThreeScene,
  initScroll,
  initInteractions,
  initForm
};

// Bootstrap function
function initAvironStudio() {
  console.log('%cAVIRON DIGITAL STUDIO', 'color:#c4a96a; font-weight:bold; font-size:16px; letter-spacing:2px;');
  console.log('%cThoughtfully crafted. Intentionally different.', 'color:#8a8880; font-style:italic;');

  try {
    // 1. Initialize UI Interactions & Preloader sequence
    initInteractions();

    // 2. Initialize Form handling & pre-selection hooks
    initForm();

    // 3. Initialize Smooth Scrolling (Lenis + GSAP ScrollTrigger)
    initScroll();

    // 4. Initialize Three.js interactive background canvas
    initThreeScene();
  } catch (error) {
    console.error('AVIRON: Initialization notice:', error);
  }
}

// Execute when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAvironStudio);
} else {
  initAvironStudio();
}
