import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// File maskot: public/assets/mascot/
//  - yeti-still.glb  -> pose diam (dipakai di percakapan & header)
//  - yeti-motion.glb -> bergerak (dipakai di ikon tombol chatbot)
const BASE = import.meta.env.BASE_URL || '/';
const STILL_URL = `${BASE}assets/mascot/yeti-still.glb`;
const MOTION_URL = `${BASE}assets/mascot/yeti-motion.glb`;
// Animasi ikon bergerak: bergantian tiap 10 detik
const MOTION_CLIPS = ['Idle', 'Jump'];
const SWITCH_MS = 10000;
const RES = 160;

let shared = null;
const animSubs = new Set();
const stillWaiters = new Set();

function fitModel(gltf) {
  const root = gltf.scene;
  // Material bawaan GLB metalness 0.4 tanpa environment map -> tampak gelap.
  root.traverse((o) => {
    if (o.isMesh && o.material) {
      o.material.metalness = 0;
      o.material.roughness = 1;
      o.material.needsUpdate = true;
    }
  });
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = 1.6 / Math.max(size.x, size.y, size.z || 1);
  const center = box.getCenter(new THREE.Vector3());
  const holder = new THREE.Group();
  root.position.sub(center);
  holder.add(root);
  holder.scale.setScalar(scale);
  holder.visible = false;
  return { root, holder };
}

function findClip(gltf, name) {
  return gltf.animations.find((a) => a.name.endsWith(name)) || gltf.animations[0];
}

function createShared() {
  const canvas = document.createElement('canvas');
  canvas.width = RES;
  canvas.height = RES;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(1);
  renderer.setSize(RES, RES, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 2.4));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(2, 3, 4);
  scene.add(dir);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.2, 3.2);
  camera.lookAt(0, 0, 0);

  const state = {
    canvas,
    renderer,
    scene,
    camera,
    still: null,
    motion: null, // { holder, mixer, actions, current }
    snapshot: null,
    clock: new THREE.Clock(),
    raf: 0,
    timer: 0,
  };

  const loader = new GLTFLoader();

  // --- Model diam: render sekali jadi gambar statis ---
  loader.load(STILL_URL, (gltf) => {
    const { root, holder } = fitModel(gltf);
    scene.add(holder);
    const mixer = new THREE.AnimationMixer(root);
    const clip = findClip(gltf, 'Idle');
    if (clip) {
      mixer.clipAction(clip).play();
      mixer.update(0);
    }
    if (state.motion) state.motion.holder.visible = false;
    holder.visible = true;
    renderer.render(scene, camera);
    holder.visible = false;
    const snap = document.createElement('canvas');
    snap.width = RES;
    snap.height = RES;
    snap.getContext('2d').drawImage(canvas, 0, 0);
    state.snapshot = snap;
    stillWaiters.forEach((cb) => cb(snap));
    stillWaiters.clear();
  });

  // --- Model bergerak ---
  loader.load(MOTION_URL, (gltf) => {
    const { root, holder } = fitModel(gltf);
    scene.add(holder);
    const mixer = new THREE.AnimationMixer(root);
    const actions = MOTION_CLIPS.map((n) => mixer.clipAction(findClip(gltf, n)));
    actions[0].play();
    state.motion = { holder, mixer, actions, current: 0 };
  });

  return state;
}

function tick() {
  if (!shared) return;
  const dt = shared.clock.getDelta();
  const m = shared.motion;
  if (m) {
    if (shared.still) shared.still.visible = false;
    m.holder.visible = true;
    m.mixer.update(dt);
    shared.renderer.render(shared.scene, shared.camera);
    animSubs.forEach((draw) => draw(shared.canvas));
  }
  shared.raf = requestAnimationFrame(tick);
}

function subscribeAnimated(draw) {
  if (!shared) shared = createShared();
  animSubs.add(draw);
  if (!shared.raf) {
    shared.clock.getDelta();
    shared.raf = requestAnimationFrame(tick);
    shared.timer = setInterval(() => {
      const m = shared.motion;
      if (!m) return;
      const next = (m.current + 1) % m.actions.length;
      m.actions[next].reset().play();
      m.actions[m.current].crossFadeTo(m.actions[next], 0.4, false);
      m.current = next;
    }, SWITCH_MS);
  }
  return () => {
    animSubs.delete(draw);
    if (animSubs.size === 0 && shared) {
      cancelAnimationFrame(shared.raf);
      clearInterval(shared.timer);
      shared.raf = 0;
      shared.timer = 0;
    }
  };
}

function subscribeStill(draw) {
  if (!shared) shared = createShared();
  if (shared.snapshot) {
    draw(shared.snapshot);
    return () => {};
  }
  stillWaiters.add(draw);
  return () => stillWaiters.delete(draw);
}

/**
 * Maskot Yeti 3D.
 * animated=true  -> bergerak (untuk ikon tombol chatbot)
 * animated=false -> pose diam (untuk percakapan, header, dll.)
 */
export default function YetiMascot({ size = 36, animated = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ctx = el.getContext('2d');
    const draw = (src) => {
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(src, 0, 0, el.width, el.height);
    };
    return animated ? subscribeAnimated(draw) : subscribeStill(draw);
  }, [animated]);

  return (
    <canvas
      ref={ref}
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
