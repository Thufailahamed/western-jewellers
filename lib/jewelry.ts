// Procedural jewellery built from three.js primitives, plus the studio lighting they're rendered in.
import * as THREE from "three";
import type { ModelKind } from "./data";

/* ------------------------------------------------------------------ Studio */

function softboxEnvironment(renderer: THREE.WebGLRenderer, background: number, gain: number) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  const box = (w: number, h: number, color: number, intensity: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity * gain), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  // High-contrast softboxes: metal and stones only read well with strong light/dark separation.
  box(6, 3, 0xffffff, 6, [0, 6, 3]);
  box(2, 8, 0xfff2dc, 4, [-7, 1, 2]);
  box(2, 8, 0xffffff, 3.5, [7, 0, 1]);
  box(10, 0.6, 0xffffff, 5, [0, -2, 6]);
  box(4, 4, 0xffe2b0, 2.2, [-3, -4, -6]);
  box(1.2, 6, 0xffffff, 5, [3, 3, -7]);
  box(8, 1, 0xd8e4ff, 1.4, [0, 7, -3]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(scene, 0.035).texture;
  pmrem.dispose();
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    (mesh.material as THREE.Material | undefined)?.dispose?.();
  });
  return tex;
}

export type Studio = { env: THREE.Texture; gemEnv: THREE.Texture; diamond: THREE.MeshPhysicalMaterial };
const studios = new WeakMap<THREE.WebGLRenderer, Studio>();

/** One set of environment maps + diamond material per renderer, created lazily. */
export function getStudio(gl: THREE.WebGLRenderer): Studio {
  let s = studios.get(gl);
  if (s) return s;
  const env = softboxEnvironment(gl, 0x57524b, 1);
  const gemEnv = softboxEnvironment(gl, 0x75726c, 1.6);
  const diamond = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0,
    flatShading: true,
    envMap: gemEnv,
    envMapIntensity: 1.7,
    iridescence: 1,
    iridescenceIOR: 1.9,
    iridescenceThicknessRange: [180, 820],
  });
  s = { env, gemEnv, diamond };
  studios.set(gl, s);
  return s;
}

export function metalMaterial(env: THREE.Texture, color: string) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 1,
    roughness: 0.16,
    envMap: env,
    envMapIntensity: 1.25,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
  });
}

/* ------------------------------------------------------------------ Geometry helpers */

let brilliant: THREE.LatheGeometry | null = null;
export function brilliantGeometry() {
  if (brilliant) return brilliant;
  // Radius-1 brilliant profile revolved: culet → pavilion → girdle → crown → table.
  const pts = [
    [0.0, -0.86],
    [0.52, -0.44],
    [1.0, 0.0],
    [1.0, 0.035],
    [0.82, 0.19],
    [0.56, 0.33],
    [0.0, 0.33],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  brilliant = new THREE.LatheGeometry(pts, 16);
  brilliant.userData.shared = true;
  return brilliant;
}

type Mats = { metal: THREE.Material; diamond: THREE.Material };
const UP = new THREE.Vector3(0, 1, 0);

function rod(a: THREE.Vector3, b: THREE.Vector3, radius: number, mat: THREE.Material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.8, radius, dir.length(), 12), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}

function band(radius: number, tube: number, width: number, mat: THREE.Material) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 48, 220), mat);
  m.scale.z = width / (tube * 2);
  return m;
}

function gem(mat: THREE.Material, scale: number, pos: THREE.Vector3, dir = UP) {
  const m = new THREE.Mesh(brilliantGeometry(), mat);
  m.scale.setScalar(scale);
  m.position.copy(pos);
  m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  return m;
}

/** Stones around a circle in the XY plane, each pointing outward (or along `facing` when given). */
function gemRing(mat: THREE.Material, count: number, radius: number, size: number, opts: { from?: number; to?: number; facing?: THREE.Vector3; z?: number; sizeFn?: (i: number) => number } = {}) {
  const { from = 0, to = Math.PI * 2, facing, z = 0, sizeFn } = opts;
  const inst = new THREE.InstancedMesh(brilliantGeometry(), mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const full = Math.abs(to - from - Math.PI * 2) < 1e-6;
  for (let i = 0; i < count; i++) {
    const t = full ? i / count : count === 1 ? 0.5 : i / (count - 1);
    const a = from + (to - from) * t;
    const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    p.copy(dir).multiplyScalar(radius).setZ(z);
    q.setFromUnitVectors(UP, facing ?? dir);
    s.setScalar(sizeFn ? sizeFn(i) : size);
    m.compose(p, q, s);
    inst.setMatrixAt(i, m);
  }
  return inst;
}

function claws(g: THREE.Group, mat: THREE.Material, count: number, stoneR: number, girdleY: number, baseY = 1.08) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.PI / count;
    const c = Math.cos(a), s = Math.sin(a);
    const bottom = new THREE.Vector3(0.13 * c, baseY, 0.13 * s);
    const mid = new THREE.Vector3((stoneR + 0.01) * c, girdleY - 0.02, (stoneR + 0.01) * s);
    const tip = new THREE.Vector3((stoneR - 0.04) * c, girdleY + 0.1 * (stoneR / 0.38), (stoneR - 0.04) * s);
    g.add(rod(bottom, mid, 0.03, mat), rod(mid, tip, 0.028, mat));
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), mat);
    bead.position.copy(tip);
    g.add(bead);
  }
}

function basket(g: THREE.Group, mat: THREE.Material, y0: number, y1: number, r1: number) {
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.028, 16, 48), mat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = y0;
  const rail = new THREE.Mesh(new THREE.TorusGeometry(r1, 0.022, 16, 64), mat);
  rail.rotation.x = Math.PI / 2;
  rail.position.y = y1;
  g.add(collar, rail);
}

/* ------------------------------------------------------------------ Pieces */

function solitaire({ metal, diamond }: Mats) {
  const g = new THREE.Group();
  g.add(band(1, 0.075, 0.26, metal));
  const s = 0.38, girdleY = 1.48;
  const stone = gem(diamond, s, new THREE.Vector3(0, girdleY, 0));
  g.add(stone);
  basket(g, metal, 1.12, 1.3, 0.27);
  claws(g, metal, 6, s, girdleY);
  g.userData.stone = stone;
  g.position.y = -0.35;
  return g;
}

function halo({ metal, diamond }: Mats) {
  const g = new THREE.Group();
  g.add(band(1, 0.07, 0.24, metal));
  const s = 0.3, girdleY = 1.4;
  const stone = gem(diamond, s, new THREE.Vector3(0, girdleY, 0));
  g.add(stone);
  basket(g, metal, 1.1, 1.26, 0.3);
  claws(g, metal, 4, s, girdleY);
  // Halo of small stones lying flat around the centre stone.
  const haloGroup = new THREE.Group();
  const ring = gemRing(diamond, 18, 0.42, 0.058, { facing: new THREE.Vector3(0, 0, 1) });
  haloGroup.add(ring);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 16, 96), metal);
  rail.position.z = -0.03;
  haloGroup.add(rail);
  haloGroup.rotation.x = -Math.PI / 2;
  haloGroup.position.y = girdleY - 0.02;
  g.add(haloGroup);
  g.userData.stone = stone;
  g.position.y = -0.32;
  return g;
}

function trilogy({ metal, diamond }: Mats) {
  const g = new THREE.Group();
  g.add(band(1, 0.075, 0.26, metal));
  const s = 0.32, girdleY = 1.4;
  const stone = gem(diamond, s, new THREE.Vector3(0, girdleY, 0));
  g.add(stone);
  basket(g, metal, 1.1, 1.26, 0.23);
  claws(g, metal, 4, s, girdleY);
  // Side stones tilted outward along the band.
  [-1, 1].forEach((side) => {
    const a = Math.PI / 2 + side * 0.36;
    const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const pos = dir.clone().multiplyScalar(1.22);
    g.add(gem(diamond, 0.2, pos, dir));
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.03, 16, 48), metal);
    bezel.position.copy(dir.clone().multiplyScalar(1.2));
    bezel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    g.add(bezel);
    g.add(rod(dir.clone().multiplyScalar(1.02), dir.clone().multiplyScalar(1.17), 0.06, metal));
  });
  g.userData.stone = stone;
  g.position.y = -0.3;
  return g;
}

function eternity({ metal, diamond }: Mats) {
  const g = new THREE.Group();
  g.add(band(1, 0.06, 0.2, metal));
  g.add(gemRing(diamond, 30, 1.07, 0.098));
  [-0.09, 0.09].forEach((z) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.075, 0.022, 16, 220), metal);
    r.position.z = z;
    g.add(r);
  });
  return g;
}

function dropUnit({ metal, diamond }: Mats, scale = 1) {
  const g = new THREE.Group();
  const accent = gem(diamond, 0.13, new THREE.Vector3(0, 0.72, 0.02), new THREE.Vector3(0, 0, 1));
  const accentBezel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.024, 16, 48), metal);
  accentBezel.position.copy(accent.position);
  const holder = new THREE.Group();
  holder.add(gem(diamond, 0.38, new THREE.Vector3(), new THREE.Vector3(0, 0, 1)));
  holder.add(new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.03, 16, 80), metal));
  holder.scale.y = 1.4;
  const link = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 12, 32), metal);
  link.position.y = 0.58;
  link.rotation.y = Math.PI / 2;
  g.add(accent, accentBezel, holder, link);
  g.scale.setScalar(scale);
  return g;
}

function pendant(mats: Mats) {
  const g = new THREE.Group();
  const strand = (side: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector3(side * (0.04 + t * 1.9), 1.0 + Math.pow(t, 1.6) * 3.2, -t * 0.6));
    }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.018, 8, false), mats.metal);
  };
  g.add(strand(1), strand(-1));
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 16, 40), mats.metal);
  bail.position.y = 0.95;
  bail.rotation.y = Math.PI / 2;
  g.add(bail, dropUnit(mats));
  g.position.y = -0.55;
  return g;
}

function drops(mats: Mats) {
  const g = new THREE.Group();
  [-1, 1].forEach((side) => {
    const u = new THREE.Group();
    const stud = gem(mats.diamond, 0.2, new THREE.Vector3(0, 1.15, 0), new THREE.Vector3(0, 0, 1));
    const studBezel = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.03, 16, 48), mats.metal);
    studBezel.position.copy(stud.position);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 12, 32), mats.metal);
    hook.position.y = 0.9;
    hook.rotation.y = Math.PI / 2;
    u.add(stud, studBezel, hook, dropUnit(mats, 0.95));
    u.position.x = side * 0.62;
    u.position.z = side * -0.1;
    u.rotation.y = side * -0.25;
    g.add(u);
  });
  g.position.y = -0.2;
  return g;
}

function hoops({ metal, diamond }: Mats) {
  const g = new THREE.Group();
  [-1, 1].forEach((side) => {
    const h = new THREE.Group();
    const r = 0.78;
    const tube = new THREE.Mesh(new THREE.TorusGeometry(r, 0.075, 32, 160), metal);
    tube.scale.z = 1.5;
    tube.rotation.z = Math.PI / 2 + 0.38;
    h.add(tube);
    // Pavé across the lower front face.
    h.add(gemRing(diamond, 13, r, 0.052, { from: -Math.PI * 0.95, to: -Math.PI * 0.05, facing: new THREE.Vector3(0, 0, 1), z: 0.1 }));
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 10), metal);
    post.rotation.x = Math.PI / 2;
    post.position.set(0, r, -0.2);
    h.add(post);
    h.position.x = side * 0.92;
    h.rotation.y = side * -0.45;
    g.add(h);
  });
  return g;
}

function bangle({ metal, diamond }: Mats) {
  const g = new THREE.Group();
  g.add(band(1, 0.1, 0.42, metal));
  const count = 11;
  g.add(
    gemRing(diamond, count, 1.09, 0.1, {
      from: Math.PI / 2 - 0.65,
      to: Math.PI / 2 + 0.65,
      sizeFn: (i) => 0.1 - Math.abs(i - (count - 1) / 2) * 0.008,
    })
  );
  return g;
}

const builders: Record<ModelKind, (m: Mats) => THREE.Group> = { solitaire, halo, trilogy, eternity, pendant, bangle, hoops, drops };

export function buildPiece(kind: ModelKind, mats: Mats) {
  return builders[kind](mats);
}

export function disposePiece(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const g = (o as THREE.Mesh).geometry;
    if (g && !g.userData.shared) g.dispose();
  });
}

/** Resting pose for each kind when displayed as a product shot. */
export const POSES: Record<ModelKind, { rotation: [number, number, number]; scale: number; y?: number }> = {
  solitaire: { rotation: [0.5, -0.6, 0.12], scale: 1.25, y: -0.05 },
  halo: { rotation: [0.5, -0.5, 0.1], scale: 1.25, y: -0.05 },
  trilogy: { rotation: [0.45, -0.35, 0.08], scale: 1.25, y: -0.05 },
  eternity: { rotation: [-0.95, 0.35, 0.3], scale: 1.35 },
  pendant: { rotation: [0.35, 0.6, 0.05], scale: 1.3, y: -0.2 },
  bangle: { rotation: [0.75, 0.2, -0.15], scale: 1.3 },
  hoops: { rotation: [0.15, 0.25, 0], scale: 1.05 },
  drops: { rotation: [0.12, 0.35, 0], scale: 1.35 },
};

/* ------------------------------------------------------------------ Glint sprite */

let glint: THREE.CanvasTexture | null = null;
export function glintTexture() {
  if (glint) return glint;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const grd = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.12, "rgba(255,248,230,0.6)");
  grd.addColorStop(1, "rgba(255,240,210,0)");
  x.fillStyle = grd;
  x.fillRect(0, 0, 128, 128);
  x.globalCompositeOperation = "lighter";
  const ray = () => {
    const g2 = x.createLinearGradient(0, 0, 128, 0);
    g2.addColorStop(0, "rgba(255,255,255,0)");
    g2.addColorStop(0.5, "rgba(255,255,255,0.9)");
    g2.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g2;
    x.fillRect(0, 63, 128, 2);
  };
  ray();
  x.translate(64, 64);
  x.rotate(Math.PI / 2);
  x.translate(-64, -64);
  ray();
  glint = new THREE.CanvasTexture(c);
  glint.colorSpace = THREE.SRGBColorSpace;
  return glint;
}
