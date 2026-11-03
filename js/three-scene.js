/**
 * AVIRON DIGITAL STUDIO - 3D Background Scene
 * Three.js interactive core geometry, wireframe shell, multi-orbital rings,
 * orbiting satellites, cosmic star dust, and continuous scroll-linked choreography.
 */

import * as THREE from 'three';
import { getLenis } from './scroll.js';

let isThreeInitialized = false;

export function initThreeScene() {
  if (isThreeInitialized) return;
  isThreeInitialized = true;

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const canvas = document.getElementById('webgl-canvas');
    if (canvas) canvas.classList.add('hidden');
    return;
  }

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const isInitialMobile = window.innerWidth < 992;
  canvas.style.opacity = isInitialMobile ? '0.85' : '1.0';

  // 1. Renderer Setup with fallback detection
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
  } catch (err) {
    console.warn('AVIRON: WebGL not supported or initialization failed, falling back to CSS background.', err);
    canvas.classList.add('hidden');
    return;
  }

  // 2. Scene and Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8.8);

  // 3. Lighting (Warm Gold Key + Fill Light + Cool Twilight Accent + Specular Pointer)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.70);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xc4a96a, 1.65);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xe8d09e, 0.85);
  fillLight.position.set(-4, 3, 3);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0x8fa8d8, 0.85);
  backLight.position.set(-5, -3, -4);
  scene.add(backLight);

  const pointerLight = new THREE.PointLight(0xd8bd7e, 3.2, 22, 1.4);
  pointerLight.position.set(0, 0, 4.5);
  scene.add(pointerLight);

  const coolAccentLight = new THREE.PointLight(0x8fa8d8, 1.8, 24, 1.6);
  coolAccentLight.position.set(0, 0, -2.5);
  scene.add(coolAccentLight);

  // 4. Main Scene Group (Target of scroll poses and parallax)
  const sceneGroup = new THREE.Group();
  scene.add(sceneGroup);

  // Core Solid Mesh: Faceted Icosahedron with jewel-like specular sheen
  const coreGeo = new THREE.IcosahedronGeometry(1.05, 0);
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0xc4a96a,
    flatShading: true,
    shininess: 60,
    specular: 0xfff0c0,
    emissive: 0x4a3a18,
    emissiveIntensity: 0.40,
    transparent: true,
    opacity: 0.95
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  sceneGroup.add(coreMesh);

  // Shell Wireframe Mesh: Icosahedron Wireframe
  const shellGeo = new THREE.IcosahedronGeometry(1.8, 1);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0xa8c2f0,
    wireframe: true,
    transparent: true,
    opacity: 0.68
  });
  const shellMesh = new THREE.Mesh(shellGeo, shellMat);
  sceneGroup.add(shellMesh);

  // Orbital Rings: 3x TorusGeometries tilted at astronomical angles
  const ring1Geo = new THREE.TorusGeometry(2.6, 0.016, 16, 120);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0xe2c78a,
    transparent: true,
    opacity: 0.65
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = THREE.MathUtils.degToRad(25);
  ring1.rotation.y = THREE.MathUtils.degToRad(15);
  sceneGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(3.25, 0.013, 16, 120);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xa8c2f0,
    transparent: true,
    opacity: 0.50
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = THREE.MathUtils.degToRad(-18);
  ring2.rotation.z = THREE.MathUtils.degToRad(22);
  sceneGroup.add(ring2);

  const ring3Geo = new THREE.TorusGeometry(3.85, 0.011, 16, 140);
  const ring3Mat = new THREE.MeshBasicMaterial({
    color: 0xf0d89e,
    transparent: true,
    opacity: 0.40
  });
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.rotation.x = THREE.MathUtils.degToRad(58);
  ring3.rotation.y = THREE.MathUtils.degToRad(-28);
  sceneGroup.add(ring3);

  // Orbiting Satellites (12 on desktop, 6 on mobile)
  const isMobile = window.innerWidth < 900;
  const satelliteCount = isMobile ? 6 : 12;
  const satellites = [];
  const satGeos = [
    new THREE.BoxGeometry(0.14, 0.14, 0.14),
    new THREE.OctahedronGeometry(0.12),
    new THREE.TetrahedronGeometry(0.13),
    new THREE.DodecahedronGeometry(0.11)
  ];

  for (let i = 0; i < satelliteCount; i++) {
    const geo = satGeos[i % satGeos.length];
    const isWire = i % 2 === 1;
    const mat = isWire
      ? new THREE.MeshBasicMaterial({ color: 0xb0c8f8, wireframe: true, transparent: true, opacity: 0.85 })
      : new THREE.MeshPhongMaterial({
          color: 0xe2c78a,
          flatShading: true,
          emissive: 0x3d3012,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.95
        });

    const mesh = new THREE.Mesh(geo, mat);
    const radius = 2.1 + (i * 0.20);
    const speed = (0.30 + (i % 4) * 0.15) * (i % 2 === 0 ? 1 : -1);
    const angle = (i / satelliteCount) * Math.PI * 2;
    const inclination = THREE.MathUtils.degToRad((i * 26) - 32);

    satellites.push({
      mesh,
      radius,
      speed,
      angle,
      inclination
    });
    sceneGroup.add(mesh);
  }

  // Ambient Star Dust Particles with Gentle Cosmic Drift (800 desktop, 350 mobile)
  const dustCount = isMobile ? 350 : 800;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * 18;
    const sinPhi = Math.sin(phi);
    dustPositions[i * 3]     = r * sinPhi * Math.cos(theta);
    dustPositions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
    dustPositions[i * 3 + 2] = r * Math.cos(phi);
  }

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.055,
    color: 0xe2c78a,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);

  // 5. Continuous Waypoint Choreography Across All Sections
  // Coordinates are framed gracefully:
  // - Hero: right-side composition
  // - About: right side, framing the narrative and floating beside the philosophy stamp
  // - Services: left side, framing the service discipline cards
  // - Work: smooth journey centered behind the horizontal reel / cards
  // - Process: right side, framing the timeline steps
  // - Pricing: left side, framing the pricing tiers
  // - Contact: ambient centered depth behind the contact form
  // - Footer: foundation depth beneath the footer
  const WAYPOINT_DEFS = [
    { id: '#hero',        role: 'single', x:  2.20, y:  0.00, s: 1.35, rotX:  0.08, rotY:  0.20, rotZ: -0.04, camZ: 8.8 },
    { id: '#about',       role: 'single', x:  2.55, y: -0.06, s: 1.15, rotX: -0.12, rotY: -0.30, rotZ:  0.05, camZ: 8.8 },
    { id: '#services',    role: 'single', x:  2.45, y: -0.05, s: 1.15, rotX:  0.18, rotY:  0.42, rotZ: -0.05, camZ: 8.8 },
    { id: '#work',        role: 'span',
      startPose: { x:  0.35, y:  0.05, s: 1.15, rotX:  0.05, rotY:  0.30, rotZ:  0.02, camZ: 9.0 },
      endPose:   { x:  0.85, y:  0.05, s: 1.08, rotX:  0.08, rotY:  0.65, rotZ: -0.02, camZ: 9.2 }
    },
    { id: '#process',     role: 'single', x:  2.85, y: -0.05, s: 1.05, rotX:  0.20, rotY: -0.25, rotZ:  0.06, camZ: 9.5 },
    { id: '#pricing',     role: 'single', x: -2.40, y:  0.05, s: 1.15, rotX: -0.12, rotY:  0.38, rotZ: -0.05, camZ: 8.8 },
    { id: '#contact',     role: 'single', x:  0.00, y: -0.55, s: 1.10, rotX:  0.25, rotY:  0.10, rotZ:  0.00, camZ: 9.0 },
    { id: '.site-footer', role: 'single', x:  0.00, y: -0.30, s: 1.30, rotX:  0.30, rotY:  0.15, rotZ:  0.00, camZ: 8.8 }
  ];

  function adjustPoseForViewport(pose) {
    const width = window.innerWidth;
    const height = Math.max(window.innerHeight, 1);
    const aspect = width / height;

    if (width < 768) {
      // Mobile screens: strictly horizontally centered (x: 0),
      // dynamic camZ and scale guarantee that all 3 orbital rings and orbiting satellites NEVER clip off-screen
      const targetOuterRadius = 3.90 * 0.65;
      const safeMargin = 1.08; // 8% edge breathing room
      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(22.5));
      const neededCamZ = (targetOuterRadius * safeMargin) / (tanHalfFov * Math.max(aspect, 0.35));
      const mobileCamZ = Math.min(Math.max(neededCamZ, 12.0), 18.0);

      return {
        x: 0,
        y: pose.y * 0.25,
        s: 0.65,
        rotX: pose.rotX * 0.75,
        rotY: pose.rotY * 0.75,
        rotZ: (pose.rotZ || 0) * 0.50,
        camZ: mobileCamZ
      };
    }

    if (width < 992) {
      // Tablet screens: gentle centering and scaled so outer rings stay within viewport bounds
      return {
        x: pose.x * 0.22,
        y: pose.y * 0.50,
        s: Math.min(pose.s * 0.72, 0.88),
        rotX: pose.rotX * 0.80,
        rotY: pose.rotY * 0.80,
        rotZ: (pose.rotZ || 0) * 0.60,
        camZ: Math.max(pose.camZ + 2.0, 10.8)
      };
    }

    // On desktop / laptop, scale X to viewport aspect ratio so outer rings never clip
    const aspectFactor = aspect >= 1.5 ? 1.0 : Math.max(0.65, (aspect - 0.6) / 0.9);
    return {
      x: pose.x * aspectFactor,
      y: pose.y,
      s: pose.s,
      rotX: pose.rotX,
      rotY: pose.rotY,
      rotZ: pose.rotZ || 0,
      camZ: pose.camZ
    };
  }

  function getElementDocumentBounds(el) {
    if (!el) return null;
    // Check if wrapped in GSAP pin-spacer
    const targetEl = (el.parentElement && el.parentElement.classList.contains('pin-spacer'))
      ? el.parentElement
      : el;
    const rect = targetEl.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const top = rect.top + scrollY;
    const height = Math.max(rect.height, 100);
    return { top, height, bottom: top + height };
  }

  let calculatedWaypoints = [];

  function updateWaypointPositions() {
    const list = [];
    for (const def of WAYPOINT_DEFS) {
      const el = document.querySelector(def.id);
      const bounds = getElementDocumentBounds(el);
      if (!bounds) continue;

      if (def.role === 'span') {
        // Section with extended horizontal or pinned span (e.g. #work)
        list.push({
          targetY: bounds.top + Math.min(window.innerHeight * 0.40, bounds.height * 0.3),
          pose: def.startPose
        });
        list.push({
          targetY: bounds.bottom - Math.min(window.innerHeight * 0.45, bounds.height * 0.3),
          pose: def.endPose
        });
      } else {
        list.push({
          targetY: bounds.top + bounds.height * 0.45,
          pose: {
            x: def.x,
            y: def.y,
            s: def.s,
            rotX: def.rotX,
            rotY: def.rotY,
            rotZ: def.rotZ,
            camZ: def.camZ
          }
        });
      }
    }

    // Sort strictly by targetY to ensure flawless interpolation
    list.sort((a, b) => a.targetY - b.targetY);
    calculatedWaypoints = list;
  }

  updateWaypointPositions();

  function getInterpolatedTargetPose() {
    if (calculatedWaypoints.length === 0) updateWaypointPositions();
    if (calculatedWaypoints.length === 0) {
      return adjustPoseForViewport(WAYPOINT_DEFS[0]);
    }

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const viewCenter = scrollY + window.innerHeight * 0.45;

    // Prior to first waypoint
    if (viewCenter <= calculatedWaypoints[0].targetY) {
      return adjustPoseForViewport(calculatedWaypoints[0].pose);
    }

    // Beyond last waypoint
    const lastIdx = calculatedWaypoints.length - 1;
    if (viewCenter >= calculatedWaypoints[lastIdx].targetY) {
      return adjustPoseForViewport(calculatedWaypoints[lastIdx].pose);
    }

    // Between consecutive waypoints
    for (let i = 0; i < lastIdx; i++) {
      const p0 = calculatedWaypoints[i];
      const p1 = calculatedWaypoints[i + 1];
      if (viewCenter >= p0.targetY && viewCenter <= p1.targetY) {
        const range = p1.targetY - p0.targetY;
        const t = range > 0 ? (viewCenter - p0.targetY) / range : 0;
        // Smoothstep ease curve
        const easeT = t * t * (3 - 2 * t);

        const pose0 = p0.pose;
        const pose1 = p1.pose;
        const rawPose = {
          x: pose0.x + (pose1.x - pose0.x) * easeT,
          y: pose0.y + (pose1.y - pose0.y) * easeT,
          s: pose0.s + (pose1.s - pose0.s) * easeT,
          rotX: pose0.rotX + (pose1.rotX - pose0.rotX) * easeT,
          rotY: pose0.rotY + (pose1.rotY - pose0.rotY) * easeT,
          rotZ: (pose0.rotZ || 0) + ((pose1.rotZ || 0) - (pose0.rotZ || 0)) * easeT,
          camZ: pose0.camZ + (pose1.camZ - pose0.camZ) * easeT
        };
        return adjustPoseForViewport(rawPose);
      }
    }

    return adjustPoseForViewport(calculatedWaypoints[0].pose);
  }

  const initialPose = adjustPoseForViewport(WAYPOINT_DEFS[0]);
  const currentPose = { ...initialPose };

  // 6. Pointer & Touch Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetRotY = 0;
  let targetRotX = 0;

  function updatePointerCoords(clientX, clientY) {
    mouseX = (clientX / window.innerWidth) * 2 - 1;
    mouseY = -(clientY / window.innerHeight) * 2 + 1;
    targetRotY = mouseX * THREE.MathUtils.degToRad(6.5);
    targetRotX = -mouseY * THREE.MathUtils.degToRad(4.5);
  }

  window.addEventListener('mousemove', (e) => {
    updatePointerCoords(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      updatePointerCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouseX = 0;
    mouseY = 0;
    targetRotX = 0;
    targetRotY = 0;
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    mouseX = 0;
    mouseY = 0;
    targetRotX = 0;
    targetRotY = 0;
  }, { passive: true });

  // 7. Interactive Click / Tap Pulse Physics
  window.addEventListener('pointerdown', () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(coreMat, {
        emissiveIntensity: 0.60,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
      gsap.to(shellMesh.scale, {
        x: 1.07,
        y: 1.07,
        z: 1.07,
        duration: 0.22,
        yoyo: true,
        repeat: 1,
        ease: 'back.out(2)'
      });
    }
  });

  // 8. Dynamic Layout & Resize Handlers
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    if (window.innerWidth < 992) {
      canvas.style.opacity = '0.85';
    } else {
      canvas.style.opacity = '1.0';
    }
    updateWaypointPositions();
  }
  window.addEventListener('resize', onWindowResize, { passive: true });
  window.addEventListener('load', updateWaypointPositions, { passive: true });

  // Connect to ScrollTrigger refresh so waypoint offsets stay strictly accurate
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.addEventListener('refresh', updateWaypointPositions);
  }

  // 9. Visibility Change Handler (Pause loop to conserve GPU battery)
  let isTabActive = true;
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  // 10. Main Render Loop with Glitch-Free Dynamic Scroll Velocity Damping
  const clock = new THREE.Clock();
  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let smoothedVelocity = 0;
  let smoothedDirection = 1;

  function animate() {
    requestAnimationFrame(animate);
    if (!isTabActive) return;

    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsedTime = clock.getElapsedTime();

    // Query Lenis instance if active
    const lenis = typeof getLenis === 'function' ? getLenis() : null;
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const rawDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Determine instantaneous scroll velocity (px/sec)
    let instantVel = 0;
    if (lenis && typeof lenis.velocity === 'number') {
      instantVel = Math.min(Math.abs(lenis.velocity) * 1.5, 2400);
    } else {
      instantVel = Math.min(Math.abs(rawDelta) / Math.max(delta, 0.001), 2400);
    }

    // Asymmetric smoothing: fast attack (0.22) and gentle decay (0.05)
    const attackDecay = instantVel > smoothedVelocity ? 0.22 : 0.05;
    smoothedVelocity += (instantVel - smoothedVelocity) * attackDecay;

    // Direction tracking with deadzone that never snaps back to +1 on idle ticks
    if (lenis && typeof lenis.direction === 'number' && lenis.direction !== 0) {
      smoothedDirection += (lenis.direction - smoothedDirection) * 0.15;
    } else if (rawDelta > 0.8) {
      smoothedDirection += (1 - smoothedDirection) * 0.15;
    } else if (rawDelta < -0.8) {
      smoothedDirection += (-1 - smoothedDirection) * 0.15;
    }

    // Normalized velocity multiplier (0 at idle, ~1-2 at brisk scroll)
    const velFactor = Math.min(smoothedVelocity / 600, 2.5);

    // Continuous geometry rotation + dynamic scroll-velocity acceleration
    const coreSpinSpeedX = delta * (0.32 + velFactor * 0.50);
    const coreSpinSpeedY = delta * (0.42 + velFactor * 0.70 * smoothedDirection);
    coreMesh.rotation.x += coreSpinSpeedX;
    coreMesh.rotation.y += coreSpinSpeedY;

    const shellSpinSpeedX = delta * (0.18 + velFactor * 0.30);
    const shellSpinSpeedY = delta * (0.25 + velFactor * 0.45 * smoothedDirection);
    shellMesh.rotation.x -= shellSpinSpeedX;
    shellMesh.rotation.y -= shellSpinSpeedY;

    ring1.rotation.z += delta * (0.15 + velFactor * 0.45 * smoothedDirection);
    ring2.rotation.y += delta * (0.12 + velFactor * 0.38 * smoothedDirection);
    ring3.rotation.x += delta * (0.09 + velFactor * 0.30);

    // Orbiting satellites accelerate during scroll
    const satSpeedMultiplier = 1.0 + velFactor * 1.4;
    for (let i = 0; i < satellites.length; i++) {
      const sat = satellites[i];
      sat.angle += sat.speed * satSpeedMultiplier * delta;
      const x = Math.cos(sat.angle) * sat.radius;
      const z = Math.sin(sat.angle) * sat.radius;
      const y = Math.sin(sat.angle * 2) * 0.35;

      sat.mesh.position.set(
        x,
        y * Math.cos(sat.inclination) - z * Math.sin(sat.inclination),
        y * Math.sin(sat.inclination) + z * Math.cos(sat.inclination)
      );

      sat.mesh.rotation.x += delta * (1.2 + velFactor * 1.8);
      sat.mesh.rotation.y += delta * (1.5 + velFactor * 2.2);
    }

    // Cosmic star dust rotation + subtle undulation
    dustPoints.rotation.y += delta * (0.022 + velFactor * 0.06 * smoothedDirection);
    dustPoints.rotation.x += delta * (0.010 + velFactor * 0.025);

    // Dynamic Specular Lighting Tracking
    pointerLight.position.x += (mouseX * 7.0 - pointerLight.position.x) * 0.08;
    pointerLight.position.y += (mouseY * 5.0 - pointerLight.position.y) * 0.08;
    pointerLight.position.z = 4.5 + Math.sin(elapsedTime * 2.0) * 0.35;

    coolAccentLight.position.x += (-mouseX * 6.0 - coolAccentLight.position.x) * 0.06;
    coolAccentLight.position.y += (-mouseY * 4.5 - coolAccentLight.position.y) * 0.06;

    // Breathing Wireframe Shell Opacity
    shellMat.opacity = 0.65 + Math.sin(elapsedTime * 1.4) * 0.12;

    // Interpolate continuous pose targets with smoothstep waypoints
    const targetPose = getInterpolatedTargetPose();

    const lerpFactor = 0.055;
    currentPose.x += (targetPose.x - currentPose.x) * lerpFactor;
    currentPose.y += (targetPose.y - currentPose.y) * lerpFactor;
    currentPose.s += (targetPose.s - currentPose.s) * lerpFactor;
    currentPose.rotX += (targetPose.rotX - currentPose.rotX) * lerpFactor;
    currentPose.rotY += (targetPose.rotY - currentPose.rotY) * lerpFactor;
    currentPose.rotZ += (targetPose.rotZ - currentPose.rotZ) * lerpFactor;
    currentPose.camZ += (targetPose.camZ - currentPose.camZ) * lerpFactor;

    sceneGroup.position.x = currentPose.x;
    sceneGroup.position.y = currentPose.y;
    sceneGroup.scale.set(currentPose.s, currentPose.s, currentPose.s);

    // Pointer parallax combined with continuous waypoint rotation & bank on Z
    sceneGroup.rotation.x += ((currentPose.rotX + targetRotX) - sceneGroup.rotation.x) * 0.06;
    sceneGroup.rotation.y += ((currentPose.rotY + targetRotY) - sceneGroup.rotation.y) * 0.06;
    sceneGroup.rotation.z += (currentPose.rotZ - sceneGroup.rotation.z) * 0.06;

    // Camera dynamic Z drift smoothly follows interpolated waypoint camZ
    camera.position.z = currentPose.camZ;

    // Smoothly fade canvas opacity past hero section for an ethereal, non-intrusive background effect
    const heroEl = document.getElementById('hero');
    const heroBottom = heroEl ? (heroEl.offsetTop + heroEl.offsetHeight) : window.innerHeight;
    const scrollYCurrent = window.scrollY || window.pageYOffset || 0;
    
    // In hero: 1.0 desktop / 0.85 mobile. As you scroll past hero: fades smoothly to 0.38 desktop / 0.30 mobile
    let targetCanvasOpacity = 1.0;
    if (scrollYCurrent <= heroBottom * 0.3) {
      targetCanvasOpacity = 1.0;
    } else if (scrollYCurrent >= heroBottom * 1.1) {
      targetCanvasOpacity = 0.38;
    } else {
      const t = (scrollYCurrent - heroBottom * 0.3) / (heroBottom * 0.8);
      targetCanvasOpacity = 1.0 - t * 0.62;
    }
    if (window.innerWidth < 768) {
      targetCanvasOpacity *= 0.82;
    }
    canvas.style.opacity = targetCanvasOpacity.toFixed(3);

    renderer.render(scene, camera);
  }

  animate();
}
