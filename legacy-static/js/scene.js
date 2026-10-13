// Hero WebGL scene (the floating solitaire) + offline studio renders for collection cards.
import * as THREE from "three";
import { makeEnvironment, makeMaterials, solitaire, eternity, pendant, bangle, glintTexture } from "./pieces.js";

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const env = makeEnvironment(renderer);
  const gemEnv = makeEnvironment(renderer, { background: 0x5a5856, gain: 1.6 });
  const mats = makeMaterials(env, gemEnv);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 10);

  // Rig: outer = scroll-driven placement, tilt = mouse, ring = idle spin.
  const rig = new THREE.Group();
  const tilt = new THREE.Group();
  const ring = solitaire(mats);
  ring.position.y = -0.35; // visual centre between band and stone
  tilt.add(ring);
  rig.add(tilt);
  scene.add(rig);

  // Glints on the stone.
  const tex = glintTexture();
  const glints = [];
  const gem = ring.userData.gem;
  [[0.2, 0.25, 0.25], [-0.25, 0.12, 0.2], [0.05, -0.1, 0.36], [-0.12, 0.3, -0.1]].forEach(([x, y, z], i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    s.position.set(gem.position.x + x, gem.position.y + y, gem.position.z + z);
    s.userData.phase = i * 1.7;
    s.userData.speed = 0.6 + i * 0.23;
    ring.add(s);
    glints.push(s);
  });

  // Fine gold dust.
  const dustCount = 160;
  const dustGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xe8c98d, size: 0.028, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(dust);

  // Public state, tweened from main.js.
  const state = { x: 0, y: 0, scale: 1, rx: 0.32, ry: 0, rz: 0, spin: 1, visible: 1 };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const baseScale = () => {
    const w = window.innerWidth;
    return w < 720 ? 0.62 : w < 1100 ? 0.8 : 0.95;
  };

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  // Viewport-space helper: state.x/y are in fractions of visible half-width/height.
  const half = new THREE.Vector2();
  function viewHalf() {
    const h = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    half.set(h * camera.aspect, h);
    return half;
  }

  const clock = new THREE.Clock();
  let spinAngle = 0;
  let running = true;

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    const v = viewHalf();
    rig.position.set(state.x * v.x, -state.y * v.y + Math.sin(t * 0.8) * 0.05, 0);
    rig.scale.setScalar(state.scale * baseScale());
    rig.rotation.set(state.rx, state.ry, state.rz);

    tilt.rotation.x = mouse.y * 0.18;
    tilt.rotation.z = -mouse.x * 0.08;

    spinAngle += dt * 0.32 * state.spin;
    ring.rotation.y = Math.sin(spinAngle) * 0.85 + mouse.x * 0.4;

    glints.forEach((s) => {
      const k = Math.pow(Math.max(0, Math.sin(t * s.userData.speed + s.userData.phase)), 18);
      s.material.opacity = k;
      s.scale.setScalar(0.15 + k * 0.55);
    });

    dust.rotation.y = t * 0.02;
    dust.position.y = Math.sin(t * 0.3) * 0.1;

    canvas.style.opacity = state.visible;
    if (state.visible > 0.001) renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  return {
    state,
    start() { clock.start(); frame(); },
    stop() { running = false; },
    renderer, env, mats,
  };
}

/* Render the collection pieces once into PNG data URLs. */
export function renderStudio(mats, size = { w: 800, h: 1000 }) {
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(size.w, size.h, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // The env map belongs to the other context: rebuild it here.
  const env = makeEnvironment(renderer);
  const gemEnv = makeEnvironment(renderer, { background: 0x5a5856, gain: 1.6 });
  const m = makeMaterials(env, gemEnv);
  m.gold.color.set(0xe8be72);

  const camera = new THREE.PerspectiveCamera(26, size.w / size.h, 0.1, 100);
  camera.position.set(0, 0, 10);

  const shots = {
    solitaire: () => { const g = solitaire(m); g.position.y = -0.4; g.rotation.set(0.5, -0.6, 0.12); g.scale.setScalar(1.25); return g; },
    eternity: () => { const g = eternity(m); g.rotation.set(-0.95, 0.35, 0.3); g.scale.setScalar(1.35); return g; },
    pendant: () => { const g = pendant(m); g.position.y = -0.7; g.rotation.set(0.35, 0.6, 0.05); g.scale.setScalar(1.35); return g; },
    bangle: () => { const g = bangle(m); g.rotation.set(0.75, 0.2, -0.15); g.scale.setScalar(1.3); return g; },
  };

  const out = {};
  for (const [name, build] of Object.entries(shots)) {
    const scene = new THREE.Scene();
    scene.add(build());
    renderer.render(scene, camera);
    out[name] = canvas.toDataURL("image/png");
    scene.traverse((o) => { if (o.geometry && o.geometry.type !== "LatheGeometry") o.geometry.dispose(); });
  }
  env.dispose();
  gemEnv.dispose();
  Object.values(m).forEach((mat) => mat.dispose());
  renderer.dispose();
  renderer.forceContextLoss();
  return out;
}
