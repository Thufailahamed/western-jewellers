// Procedural jewellery: geometry, materials and a studio light environment.
import * as THREE from "three";

/* ---------- Studio environment (softboxes in a dark room) ---------- */
export function makeEnvironment(renderer, { background = 0x0a0908, gain = 1 } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);

  const box = (w, h, color, intensity, pos, look) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity * gain), side: THREE.DoubleSide })
    );
    m.position.copy(pos);
    m.lookAt(look || new THREE.Vector3());
    scene.add(m);
  };

  // Key, fill, rim and strip lights: high contrast is what makes metal and stones read.
  box(6, 3, 0xffffff, 6, new THREE.Vector3(0, 6, 3));
  box(2, 8, 0xfff2dc, 4, new THREE.Vector3(-7, 1, 2));
  box(2, 8, 0xffffff, 3.5, new THREE.Vector3(7, 0, 1));
  box(10, 0.6, 0xffffff, 5, new THREE.Vector3(0, -2, 6));
  box(4, 4, 0xffe2b0, 2.2, new THREE.Vector3(-3, -4, -6));
  box(1.2, 6, 0xffffff, 5, new THREE.Vector3(3, 3, -7));
  box(8, 1, 0xd8e4ff, 1.4, new THREE.Vector3(0, 7, -3));

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.035).texture;
  pmrem.dispose();
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return env;
}

/* ---------- Materials ---------- */
export function makeMaterials(env, gemEnv = env) {
  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xf0c983,
    metalness: 1,
    roughness: 0.16,
    envMap: env,
    envMapIntensity: 1.25,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
  });
  const diamond = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.0,
    flatShading: true,
    envMap: gemEnv,
    envMapIntensity: 1.7,
    iridescence: 1,
    iridescenceIOR: 1.9,
    iridescenceThicknessRange: [180, 820],
  });
  return { gold, diamond };
}

/* ---------- Geometry helpers ---------- */
let _brilliant;
export function brilliantGeometry() {
  if (_brilliant) return _brilliant;
  // Radius-1 brilliant cut profile, revolved: culet → pavilion → girdle → crown → table.
  const pts = [
    [0.0, -0.86],
    [0.52, -0.44],
    [1.0, 0.0],
    [1.0, 0.035],
    [0.82, 0.19],
    [0.56, 0.33],
    [0.0, 0.33],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 16);
  g.computeVertexNormals();
  _brilliant = g;
  return g;
}

function rod(a, b, radius, material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.8, radius, len, 12), material);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function band(radius, tube, width, material) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 48, 220), material);
  m.scale.z = width / (tube * 2);
  return m;
}

/* ---------- Pieces ---------- */
export function solitaire(mats, { prongs = 6 } = {}) {
  const g = new THREE.Group();
  g.add(band(1, 0.075, 0.26, mats.gold));

  const s = 0.38; // stone radius
  const girdleY = 1.48;
  const gem = new THREE.Mesh(brilliantGeometry(), mats.diamond);
  gem.scale.setScalar(s);
  gem.position.y = girdleY;
  g.add(gem);

  // Basket: lower collar + gallery rail under the girdle.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.028, 16, 48), mats.gold);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.12;
  g.add(collar);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.022, 16, 64), mats.gold);
  rail.rotation.x = Math.PI / 2;
  rail.position.y = 1.3;
  g.add(rail);

  // Claws.
  for (let i = 0; i < prongs; i++) {
    const a = (i / prongs) * Math.PI * 2 + Math.PI / prongs;
    const c = Math.cos(a), sn = Math.sin(a);
    const bottom = new THREE.Vector3(0.13 * c, 1.08, 0.13 * sn);
    const mid = new THREE.Vector3((s + 0.01) * c, girdleY - 0.02, (s + 0.01) * sn);
    const tip = new THREE.Vector3((s - 0.04) * c, girdleY + 0.1, (s - 0.04) * sn);
    g.add(rod(bottom, mid, 0.03, mats.gold));
    g.add(rod(mid, tip, 0.028, mats.gold));
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), mats.gold);
    bead.position.copy(tip);
    g.add(bead);
  }

  g.userData.gem = gem;
  return g;
}

export function eternity(mats, count = 30) {
  const g = new THREE.Group();
  g.add(band(1, 0.06, 0.2, mats.gold));
  const geo = brilliantGeometry();
  const inst = new THREE.InstancedMesh(geo, mats.diamond, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3().setScalar(0.098);
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    p.copy(dir).multiplyScalar(1.07);
    q.setFromUnitVectors(up, dir);
    m.compose(p, q, sc);
    inst.setMatrixAt(i, m);
  }
  g.add(inst);
  // Rails either side of the stones.
  [-0.09, 0.09].forEach((z) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.075, 0.022, 16, 220), mats.gold);
    r.position.z = z;
    g.add(r);
  });
  return g;
}

export function pendant(mats) {
  const g = new THREE.Group();

  // Chain: two catenary-ish strands meeting at the bail.
  const strand = (side) => {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector3(side * (0.04 + t * 1.9), 1.0 + Math.pow(t, 1.6) * 3.2, -t * 0.6));
    }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.018, 8, false), mats.gold);
  };
  g.add(strand(1), strand(-1));

  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 16, 40), mats.gold);
  bail.position.y = 0.95;
  bail.rotation.y = Math.PI / 2;
  g.add(bail);

  // Small round accent stone.
  const accent = new THREE.Mesh(brilliantGeometry(), mats.diamond);
  accent.scale.setScalar(0.13);
  accent.rotation.x = Math.PI / 2;
  accent.position.set(0, 0.72, 0.02);
  g.add(accent);
  const accentBezel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.024, 16, 48), mats.gold);
  accentBezel.position.copy(accent.position);
  g.add(accentBezel);

  // Oval drop.
  const drop = new THREE.Mesh(brilliantGeometry(), mats.diamond);
  drop.scale.set(0.38, 0.38, 0.38);
  drop.rotation.x = Math.PI / 2;
  const holder = new THREE.Group();
  holder.add(drop);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.03, 16, 80), mats.gold);
  holder.add(bezel);
  holder.scale.y = 1.4;
  holder.position.y = 0.0;
  g.add(holder);

  const link = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 12, 32), mats.gold);
  link.position.y = 0.58;
  link.rotation.y = Math.PI / 2;
  g.add(link);

  return g;
}

export function bangle(mats) {
  const g = new THREE.Group();
  g.add(band(1, 0.1, 0.42, mats.gold));
  const geo = brilliantGeometry();
  const count = 11;
  const inst = new THREE.InstancedMesh(geo, mats.diamond, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const a = Math.PI / 2 + (i - (count - 1) / 2) * 0.13;
    const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const size = 0.1 - Math.abs(i - (count - 1) / 2) * 0.008;
    p.copy(dir).multiplyScalar(1.09);
    q.setFromUnitVectors(up, dir);
    m.compose(p, q, new THREE.Vector3().setScalar(size));
    inst.setMatrixAt(i, m);
  }
  g.add(inst);
  return g;
}

/* ---------- 4-point glint texture ---------- */
export function glintTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  const grd = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.12, "rgba(255,248,230,0.6)");
  grd.addColorStop(1, "rgba(255,240,210,0)");
  x.fillStyle = grd;
  x.fillRect(0, 0, 128, 128);
  x.globalCompositeOperation = "lighter";
  const ray = (w, h) => {
    const g2 = x.createLinearGradient(64 - w / 2, 0, 64 + w / 2, 0);
    g2.addColorStop(0, "rgba(255,255,255,0)");
    g2.addColorStop(0.5, "rgba(255,255,255,0.9)");
    g2.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g2;
    x.fillRect(64 - w / 2, 64 - h / 2, w, h);
  };
  ray(128, 2);
  x.save(); x.translate(64, 64); x.rotate(Math.PI / 2); x.translate(-64, -64); ray(128, 2); x.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
