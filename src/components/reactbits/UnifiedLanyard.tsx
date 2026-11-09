'use client';

import React, { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';

import './Lanyard.css';

export interface BadgeConfig {
  id: string;
  frontImage: string;
  backImage?: string;
  cardColor: string;
  strapColor: string;
  strapLength?: number;
  size?: number;
  mass?: number;
  anchorRatio?: number; // relative horizontal position across view (-0.28 to +0.28)
}

export interface UnifiedLanyardProps {
  badges?: BadgeConfig[];
  gravity?: number;
  damping?: number;
  elasticity?: number;
  breeze?: number;
  interactive?: boolean;
  intro?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface CardLayout {
  width: number;
  height: number;
  radius: number;
  slot: { width: number; height: number; y: number };
  ringY: number;
  hangY: number;
}

interface Body {
  position: THREE.Vector3;
  previous: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  previousQuaternion: THREE.Quaternion;
  angular: THREE.Vector3;
  mass: number;
  inverseInertia: THREE.Vector3;
  hang: THREE.Vector3;
}

interface Grab {
  local: THREE.Vector3;
  rotation: THREE.Quaternion;
  reach: number;
  from: THREE.Vector3;
  target: THREE.Vector3;
}

interface Simulation {
  nodes: THREE.Vector3[];
  previous: THREE.Vector3[];
  velocities: THREE.Vector3[];
  lengths: Float64Array;
  impulses: Float64Array;
  rest: number;
  anchor: THREE.Vector3;
  body: Body;
  grab: Grab | null;
  turn: number;
  twist: number;
  twistRaw: number;
  calm: number;
}

interface Physics {
  gravity: number;
  hold: number;
  stiffness: number;
  spring: number;
  bandDamping: number;
  linearDrag: number;
  angularDrag: number;
  air: number;
  broadside: number;
  spinAir: number;
  nodeDrag: number;
  nodeAir: number;
  twist: number;
  twistDamping: number;
  grip: number;
  gripDamping: number;
  breeze: number;
}

interface Press {
  x: number;
  y: number;
  time: number;
  point: THREE.Vector3;
}

interface BadgeRuntime {
  config: BadgeConfig;
  sim: Simulation;
  layout: CardLayout;
  scale: number;
  cardGroup: THREE.Group;
  bodyMesh: THREE.Mesh;
  frontMesh: THREE.Mesh;
  backMesh: THREE.Mesh;
  ring: THREE.Mesh;
  clampGroup: THREE.Group;
  clampMesh: THREE.Mesh;
  eyelet: THREE.Mesh;
  bandGeometry: THREE.BufferGeometry;
  bandMesh: THREE.Mesh;
  frontCanvas: HTMLCanvasElement;
  backCanvas: HTMLCanvasElement;
  strapCanvas: HTMLCanvasElement;
  frontTexture: THREE.CanvasTexture;
  backTexture: THREE.CanvasTexture;
  strapTexture: THREE.CanvasTexture;
  frontMaterial: THREE.MeshPhysicalMaterial;
  backMaterial: THREE.MeshPhysicalMaterial;
  edgeMaterial: THREE.MeshPhysicalMaterial;
  metalMaterial: THREE.MeshStandardMaterial;
  bandMaterial: THREE.MeshPhysicalMaterial;
  tileRatio: number;
  points: THREE.Vector3[];
  sides: THREE.Vector3[];
  controls: THREE.Vector3[];
  mouth: THREE.Vector3;
  tuck: THREE.Vector3;
  curve: THREE.CatmullRomCurve3;
}

type Rgb = [number, number, number];
type ImageFit = 'cover' | 'contain';

const THICKNESS = 0.02;
const BEVEL = 0.007;
const JOINTS = 4;
const NODE_WEIGHT = 1 / 0.05;
const MAX_STEP = 1 / 960;
const ITERATIONS = 2;
const SAMPLES = 64;
const FOV = 25;
const STRAP_WIDTH = 0.38;
const RING_RADIUS = 0.105;
const RING_TUBE = 0.0145;
const EYELET_RADIUS = 0.040;
const CLAMP_BODY = 0.16;
const FACE_WIDTH = 1024;
const FLIP_SPIN = 9;

const BAND_COLUMNS = [0, 0.07, 0.93, 1];
const BAND_BEND = [-0.95, -0.28, 0.28, 0.95];

const FOIL_VERTEX_HEAD = `
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;
`;

const FOIL_VERTEX_BODY = `
vFoilUv = uv;
vFoilX = normalize((modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
vFoilY = normalize((modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
`;

const FOIL_FRAGMENT_HEAD = `
uniform float foilStrength;
uniform float foilAspect;
uniform vec3 foilKey;
uniform vec3 foilFill;
uniform vec3 foilTop;
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;

float foilHash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float foilBump(float t, float center, float width) {
  float x = (t - center) / width;
  return max(0.0, 1.0 - x * x);
}

vec3 foilSpectrum(float t) {
  return vec3(
    foilBump(t, 0.82, 0.32) + 0.4 * foilBump(t, 0.02, 0.12),
    foilBump(t, 0.5, 0.26),
    foilBump(t, 0.18, 0.24)
  );
}

vec3 foilGrating(float u, float spacing) {
  vec3 color = vec3(0.0);
  for (int m = 1; m <= 2; m++) {
    float order = float(m);
    float t = (spacing * abs(u) / order - 0.38) / 0.32;
    color += foilSpectrum(t) / order;
  }
  return color;
}

vec3 foilShard(vec2 p) {
  vec2 base = floor(p);
  float best = 9.0;
  float edge = 9.0;
  vec2 id = base;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      vec2 site = cell + vec2(foilHash(cell), foilHash(cell + 7.31)) * 0.9 + 0.05;
      float d = length(site - p);
      if (d < best) {
        edge = best;
        best = d;
        id = cell;
      } else if (d < edge) {
        edge = d;
      }
    }
  }
  return vec3(foilHash(id + 3.17), foilHash(id + 11.73), edge - best);
}
`;

const FOIL_FRAGMENT_BODY = `
if (foilStrength > 0.0) {
  vec3 foilView = normalize(vViewPosition);
  vec3 foilNormal = normalize(normal);
  vec2 foilP = vec2(vFoilUv.x, vFoilUv.y * foilAspect);
  vec3 shard = foilShard(foilP * 26.0);
  vec2 ray = foilP - vec2(-1.6, 2.6 * foilAspect);
  float angle = atan(ray.y, ray.x) + (shard.x - 0.5) * 0.16;
  vec3 grating = normalize(vFoilX * cos(angle) + vFoilY * sin(angle));
  float spacing = 1.7 * (0.95 + shard.y * 0.1);
  vec3 rainbow = foilGrating(dot(foilKey + foilView, grating), spacing);
  rainbow += 0.6 * foilGrating(dot(foilTop + foilView, grating), spacing);
  rainbow *= 0.8 + 0.2 * smoothstep(0.0, 0.04, shard.z);
  rainbow = max(rainbow - 0.35 * min(rainbow.r, min(rainbow.g, rainbow.b)), 0.0);
  vec2 grid = foilP * 64.0;
  vec2 cell = floor(grid);
  vec2 jitter = vec2(foilHash(cell + 1.7), foilHash(cell + 9.2));
  float flake = smoothstep(0.32, 0.06, length(fract(grid) - jitter * 0.6 - 0.2)) * step(0.45, foilHash(cell + 4.4));
  vec3 facet = normalize(foilNormal + (vFoilX * (jitter.x - 0.5) + vFoilY * (jitter.y - 0.5)) * 0.8);
  float glint = pow(max(dot(reflect(-foilKey, facet), foilView), 0.0), 28.0);
  glint += 0.7 * pow(max(dot(reflect(-foilTop, facet), foilView), 0.0), 28.0);
  float fine = 1.0 - smoothstep(0.35, 0.9, max(fwidth(grid.x), fwidth(grid.y)));
  vec3 sparkle = flake * glint * fine * (vec3(0.7) + foilGrating(dot(foilKey + foilView, grating) + jitter.x * 0.4, spacing));
  float ink = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float foil = foilStrength * (0.08 + 0.92 * smoothstep(0.04, 0.7, ink));
  float facing = clamp(dot(foilNormal, foilView), 0.0, 1.0);
  float tint = clamp(dot(rainbow, vec3(0.4)), 0.0, 1.0);
  outgoingLight = outgoingLight * (1.0 - foil * (0.3 + 0.32 * tint)) + (rainbow * 0.62 * (0.4 + 0.6 * facing) + sparkle * 1.6) * foil;
}
`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const parseColor = (value: string, fallback: Rgb): Rgb => {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return fallback;
    ctx.fillStyle = '#000000';
    ctx.fillStyle = value;
    const resolved = ctx.fillStyle;
    if (resolved.startsWith('#')) {
      const n = parseInt(resolved.slice(1), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    const parts = resolved.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return fallback;
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];
  } catch {
    return fallback;
  }
};

const luminance = (rgb: Rgb) => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
const toCss = (rgb: Rgb, alpha = 1) =>
  `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}, ${alpha})`;

const seeded = (start: number) => {
  let state = start >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const traceRoundedRect = (path: any, x: number, y: number, width: number, height: number, radius: number) => {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const k = r * 0.4477;
  path.moveTo(x + r, y);
  path.lineTo(x + width - r, y);
  path.bezierCurveTo(x + width - k, y, x + width, y + k, x + width, y + r);
  path.lineTo(x + width, y + height - r);
  path.bezierCurveTo(x + width, y + height - k, x + width - k, y + height, x + width - r, y + height);
  path.lineTo(x + r, y + height);
  path.bezierCurveTo(x + k, y + height, x, y + height - k, x, y + height - r);
  path.lineTo(x, y + r);
  path.bezierCurveTo(x, y + k, x + k, y, x + r, y);
};

const loadImage = (
  cache: Map<string, Promise<HTMLImageElement | null>>,
  url?: string
): Promise<HTMLImageElement | null> => {
  if (!url) return Promise.resolve(null);
  const cached = cache.get(url);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
  cache.set(url, promise);
  return promise;
};

// Generates scalable, high-resolution badge layout
const makeCardLayout = (scale = 1.0): CardLayout => {
  const baseW = 1.7 * scale;
  const baseH = 2.4 * scale;
  const radius = 0.12 * scale;
  const slot = { width: 0.36 * scale, height: 0.075 * scale, y: baseH / 2 - 0.14 * scale };
  const ringY = baseH / 2 - 0.055 * scale;
  return { width: baseW, height: baseH, radius, slot, ringY, hangY: ringY + RING_RADIUS * scale };
};

const buildCardGeometry = (layout: CardLayout) => {
  const { width, height, radius, slot } = layout;
  const outline = new THREE.Shape();
  traceRoundedRect(
    outline,
    -width / 2 + BEVEL,
    -height / 2 + BEVEL,
    width - BEVEL * 2,
    height - BEVEL * 2,
    Math.max(radius - BEVEL, 0.005)
  );
  const hole = new THREE.Path();
  traceRoundedRect(
    hole,
    -slot.width / 2 - BEVEL,
    slot.y - slot.height / 2 - BEVEL,
    slot.width + BEVEL * 2,
    slot.height + BEVEL * 2,
    slot.height / 2 + BEVEL
  );
  outline.holes.push(hole);
  const body = new THREE.ExtrudeGeometry(outline, {
    depth: THICKNESS,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 5,
    curveSegments: 24
  });
  body.translate(0, 0, -THICKNESS / 2);
  const face = new THREE.ShapeGeometry(outline, 24);
  const position = face.getAttribute('position');
  const uv = face.getAttribute('uv');
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) + width / 2) / width, (position.getY(i) + height / 2) / height);
  }
  uv.needsUpdate = true;
  return { body, face };
};

const buildClampGeometry = (width: number) => {
  const shape = new THREE.Shape();
  const w = width * 1.16;
  traceRoundedRect(shape, -w / 2 + 0.014, -CLAMP_BODY / 2 + 0.014, w - 0.028, CLAMP_BODY - 0.028, 0.024);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 6,
    curveSegments: 10
  });
  geometry.translate(0, 0, -0.01);
  return geometry;
};

const buildBandGeometry = (count: number) => {
  const columns = BAND_COLUMNS.length;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * columns * 2), 2));
  const index: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    for (let c = 0; c < columns - 1; c++) {
      const a = i * columns + c;
      index.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
    }
  }
  geometry.setIndex(index);
  return geometry;
};

const buildEnvironment = (renderer: THREE.WebGLRenderer) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0.035, 0.035, 0.04);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const materials: THREE.Material[] = [];
  const panel = (intensity: number, position: [number, number, number], scale: [number, number], rotation = 0) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(intensity, intensity, intensity),
      side: THREE.DoubleSide
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(scale[0], scale[1], 1);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(rotation);
    scene.add(mesh);
  };
  panel(2.6, [0, 4.5, 8], [9, 4]);
  panel(6, [-5.5, 0.5, 7], [0.9, 14]);
  panel(4, [5, -0.5, 8], [0.6, 14]);
  panel(3.5, [0, -1, 9], [24, 0.35], Math.PI / 3);
  panel(2.5, [1, 2.5, 9], [24, 0.2], Math.PI / 3);
  panel(1.4, [0, 6, -6], [12, 4]);
  panel(0.5, [0, -7, 1], [16, 6]);
  panel(0.9, [8, 0, -2], [4, 10]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.035);
  pmrem.dispose();
  geometry.dispose();
  materials.forEach((material) => material.dispose());
  return target;
};

const makeCanvasTexture = (canvas: HTMLCanvasElement, anisotropy: number) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
};

const buildGrainTexture = () => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const random = seeded(7);
  const field = Float32Array.from({ length: size * size }, () => random());
  const height = (x: number, y: number) => {
    let sum = 0;
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) sum += field[((y + j + size) % size) * size + ((x + i + size) % size)];
    }
    return (sum / 9) * 1.6;
  };
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = height((x - 1 + size) % size, y) - height((x + 1) % size, y);
      const ny = height(x, (y - 1 + size) % size) - height(x, (y + 1) % size);
      const length = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      image.data[i] = ((nx / length) * 0.5 + 0.5) * 255;
      image.data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      image.data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 7);
  return texture;
};

const buildWeaveTexture = () => {
  const size = 128;
  const threads = 8;
  const random = seeded(19);
  const fiber = Float32Array.from({ length: size * size }, () => random());
  const profile = (f: number) => Math.sqrt(Math.max(0, 1 - 4 * f * f));
  const height = (x: number, y: number) => {
    const px = ((x % size) + size) % size;
    const py = ((y % size) + size) % size;
    const u = (px / size) * threads;
    const v = (py / size) * threads;
    const cu = Math.floor(u);
    const cv = Math.floor(v);
    const fu = u - cu - 0.5;
    const fv = v - cv - 0.5;
    const lift = (cu + cv) % 2 === 0;
    const warp = profile(fu) * (0.55 + 0.45 * Math.cos(fv * Math.PI * (lift ? 1 : 0.6)));
    const weft = profile(fv) * (0.55 + 0.45 * Math.cos(fu * Math.PI * (lift ? 0.6 : 1)));
    return (lift ? Math.max(warp, weft * 0.7) : Math.max(weft, warp * 0.7)) + fiber[py * size + px] * 0.08;
  };
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (height(x - 1, y) - height(x + 1, y)) * 1.6;
      const ny = (height(x, y - 1) - height(x, y + 1)) * 1.6;
      const length = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      data[i] = ((nx / length) * 0.5 + 0.5) * 255;
      data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};

const drawFitted = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  fit: ImageFit = 'cover'
) => {
  const scale = (fit === 'contain' ? Math.min : Math.max)(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
};

const paintFace = (canvas: HTMLCanvasElement, image: HTMLImageElement | null, color: Rgb) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = toCss(color);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (image) drawFitted(ctx, image, canvas.width, canvas.height, 'cover');
};

const paintStrap = (canvas: HTMLCanvasElement, color: Rgb) => {
  const across = 192;
  const along = across * 2;
  canvas.width = across;
  canvas.height = along;
  const ctx = canvas.getContext('2d');
  if (!ctx) return along / across;
  ctx.fillStyle = toCss(color);
  ctx.fillRect(0, 0, across, along);
  const ink: Rgb = luminance(color) > 0.5 ? [0, 0, 0] : [1, 1, 1];
  ctx.fillStyle = toCss(ink, 0.05);
  for (let y = 0; y < along; y += 4) ctx.fillRect(0, y, across, 1);
  ctx.fillStyle = toCss(ink, 0.2);
  for (let y = 0; y < along; y += 14) {
    ctx.fillRect(across * 0.075, y, 2, 8);
    ctx.fillRect(across * 0.925 - 2, y, 2, 8);
  }
  return along / across;
};

const createSimulation = (): Simulation => {
  const vectors = () => Array.from({ length: JOINTS + 1 }, () => new THREE.Vector3());
  return {
    nodes: vectors(),
    previous: vectors(),
    velocities: vectors(),
    lengths: new Float64Array(JOINTS),
    impulses: new Float64Array(JOINTS),
    rest: 1,
    anchor: new THREE.Vector3(),
    body: {
      position: new THREE.Vector3(),
      previous: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      previousQuaternion: new THREE.Quaternion(),
      angular: new THREE.Vector3(),
      mass: 1,
      inverseInertia: new THREE.Vector3(1, 1, 1),
      hang: new THREE.Vector3()
    },
    grab: null,
    turn: 0,
    twist: 0,
    twistRaw: 0,
    calm: 0
  };
};

const scratch = {
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  c: new THREE.Vector3(),
  d: new THREE.Vector3(),
  e: new THREE.Vector3(),
  f: new THREE.Vector3(),
  g: new THREE.Vector3(),
  pin: new THREE.Vector3(),
  q: new THREE.Quaternion(),
  r: new THREE.Quaternion()
};

const applyInverseInertia = (body: Body, vector: THREE.Vector3, out: THREE.Vector3) => {
  scratch.r.copy(body.quaternion).invert();
  out.copy(vector).applyQuaternion(scratch.r);
  out.set(out.x * body.inverseInertia.x, out.y * body.inverseInertia.y, out.z * body.inverseInertia.z);
  return out.applyQuaternion(body.quaternion);
};

const rotateBody = (q: THREE.Quaternion, w: THREE.Vector3) => {
  const { x: qx, y: qy, z: qz, w: qw } = q;
  q.x += 0.5 * (w.x * qw + w.y * qz - w.z * qy);
  q.y += 0.5 * (w.y * qw + w.z * qx - w.x * qz);
  q.z += 0.5 * (w.z * qw + w.x * qy - w.y * qx);
  q.w += 0.5 * (-w.x * qx - w.y * qy - w.z * qz);
  q.normalize();
};

const bodyWeight = (body: Body, r: THREE.Vector3, normal: THREE.Vector3) => {
  const rn = scratch.c.crossVectors(r, normal);
  return 1 / body.mass + rn.dot(applyInverseInertia(body, rn, scratch.d));
};

const pushBody = (body: Body, r: THREE.Vector3, impulse: THREE.Vector3) => {
  body.position.addScaledVector(impulse, 1 / body.mass);
  rotateBody(body.quaternion, applyInverseInertia(body, scratch.e.crossVectors(r, impulse), scratch.f));
};

const solveSegment = (sim: Simulation, i: number, h: number, physics: Physics) => {
  const { nodes, body } = sim;
  const a = nodes[i];
  const wa = i === 0 ? 0 : NODE_WEIGHT;
  const last = i === JOINTS - 1;
  const r = scratch.g;
  let b = nodes[i + 1];
  if (last) {
    r.copy(body.hang).applyQuaternion(body.quaternion);
    b = scratch.b.copy(body.position).add(r);
  }
  const delta = scratch.a.subVectors(b, a);
  const length = delta.length();
  const stretch = length - sim.rest;
  if (stretch <= 0 || length < 1e-9) return;
  const normal = delta.divideScalar(length);
  const wb = last ? bodyWeight(body, r, normal) : NODE_WEIGHT;
  const rate = (length - sim.lengths[i]) / h;
  const tension =
    physics.hold * Math.tanh((physics.stiffness * stretch) / physics.hold) +
    physics.spring * stretch +
    physics.bandDamping * Math.max(0, rate);
  const room = tension * h * h - sim.impulses[i];
  if (room <= 0) return;
  const lambda = Math.min(stretch / (wa + wb), room);
  sim.impulses[i] += lambda;
  if (wa) a.addScaledVector(normal, lambda * wa);
  if (last) pushBody(body, r, normal.multiplyScalar(-lambda));
  else b.addScaledVector(normal, -lambda * wb);
};

const solvePin = (body: Body, grab: Grab, target: THREE.Vector3) => {
  const r = scratch.g.copy(grab.local).applyQuaternion(body.quaternion);
  const delta = scratch.a.copy(target).sub(body.position).sub(r);
  const distance = delta.length();
  if (distance < 1e-9) return;
  const normal = delta.divideScalar(distance);
  const lambda = distance / bodyWeight(body, r, normal);
  pushBody(body, r, normal.multiplyScalar(lambda));
};

const placeHanging = (sim: Simulation, layout: CardLayout, intro: boolean) => {
  const { nodes, previous, velocities, body, anchor } = sim;
  nodes[0].copy(anchor);
  for (let i = 1; i <= JOINTS; i++) {
    nodes[i].copy(nodes[i - 1]);
    if (intro) nodes[i].x += sim.rest * (anchor.x < 0 ? -1 : 1);
    else nodes[i].y -= sim.rest;
  }
  body.quaternion.identity();
  if (intro) body.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), anchor.x < 0 ? -0.4 : 0.4);
  body.hang.set(0, layout.hangY, 0);
  const offset = scratch.a.copy(body.hang).applyQuaternion(body.quaternion);
  body.position.copy(nodes[JOINTS]).sub(offset);
  body.previous.copy(body.position);
  body.previousQuaternion.copy(body.quaternion);
  body.velocity.set(0, 0, 0);
  body.angular.set(0, 0, 0);
  for (let i = 0; i <= JOINTS; i++) {
    previous[i].copy(nodes[i]);
    velocities[i].set(0, 0, 0);
  }
  sim.lengths.fill(sim.rest);
  sim.turn = 0;
  sim.twist = 0;
  sim.twistRaw = 0;
  sim.calm = 0;
};

const configureSimulation = (sim: Simulation, layout: CardLayout, length: number, mass = 1) => {
  sim.rest = length / JOINTS;
  const { width, height } = layout;
  const body = sim.body;
  const t = THICKNESS + BEVEL * 2;
  body.mass = mass;
  body.inverseInertia.set(
    12 / (height * height + t * t),
    12 / (width * width + t * t),
    12 / (width * width + height * height)
  );
  body.hang.set(0, layout.hangY, 0);
};

const DEFAULT_BADGES: BadgeConfig[] = [
  {
    id: 'vp',
    frontImage: '/badges/vp.svg',
    cardColor: '#1C1E4B',
    strapColor: '#283FC3',
    strapLength: 0.38,
    size: 1.15,
    mass: 1.0,
    anchorRatio: -0.26
  },
  {
    id: 'president',
    frontImage: '/badges/president.svg',
    cardColor: '#111744',
    strapColor: '#BF2026',
    strapLength: 0.42,
    size: 1.28,
    mass: 1.25,
    anchorRatio: 0
  },
  {
    id: 'sg',
    frontImage: '/badges/sg.svg',
    cardColor: '#1C1E4B',
    strapColor: '#4E55D3',
    strapLength: 0.38,
    size: 1.15,
    mass: 1.0,
    anchorRatio: 0.26
  }
];

export const UnifiedLanyard: React.FC<UnifiedLanyardProps> = ({
  badges: badgesProp = DEFAULT_BADGES,
  gravity = 0.95,
  damping = 0.5,
  elasticity = 0.5,
  breeze = 0.16,
  interactive = true,
  intro = true,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    const canvas = renderer.domElement;
    canvas.className = 'lanyard-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const scene = new THREE.Scene();
    const environment = buildEnvironment(renderer);
    scene.environment = environment.texture;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(-3, 5, 8);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.45);
    fillLight.position.set(4, -1, 5);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(keyLight, fillLight, ambientLight);

    const grain = buildGrainTexture();
    const weave = buildWeaveTexture();

    const foilUniforms = {
      foilStrength: { value: 0.8 },
      foilAspect: { value: 1.4 },
      foilKey: { value: new THREE.Vector3() },
      foilFill: { value: new THREE.Vector3() },
      foilTop: { value: new THREE.Vector3() }
    };

    const injectFoil = (shader: THREE.WebGLProgramParametersWithUniforms) => {
      Object.assign(shader.uniforms, foilUniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${FOIL_VERTEX_HEAD}`)
        .replace('#include <project_vertex>', `#include <project_vertex>\n${FOIL_VERTEX_BODY}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${FOIL_FRAGMENT_HEAD}`)
        .replace('#include <opaque_fragment>', `${FOIL_FRAGMENT_BODY}\n#include <opaque_fragment>`);
    };

    const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // Create badge runtimes
    const badgeRuntimes: BadgeRuntime[] = badgesProp.map((cfg) => {
      const scale = cfg.size || 1.15;
      const layout = makeCardLayout(scale);

      const frontCanvas = document.createElement('canvas');
      const backCanvas = document.createElement('canvas');
      const strapCanvas = document.createElement('canvas');
      const frontTexture = makeCanvasTexture(frontCanvas, anisotropy);
      const backTexture = makeCanvasTexture(backCanvas, anisotropy);
      const strapTexture = makeCanvasTexture(strapCanvas, anisotropy);
      strapTexture.wrapS = THREE.ClampToEdgeWrapping;
      strapTexture.wrapT = THREE.RepeatWrapping;

      const frontMaterial = new THREE.MeshPhysicalMaterial({
        map: frontTexture,
        normalMap: grain,
        normalScale: new THREE.Vector2(0.06, 0.06),
        roughness: 0.38,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.05
      });
      const backMaterial = new THREE.MeshPhysicalMaterial({
        map: backTexture,
        normalMap: grain,
        normalScale: new THREE.Vector2(0.06, 0.06),
        roughness: 0.38,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.05
      });
      frontMaterial.onBeforeCompile = injectFoil;
      backMaterial.onBeforeCompile = injectFoil;

      const cardColorRgb = parseColor(cfg.cardColor, [0.1, 0.1, 0.3]);
      const edgeMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(cardColorRgb[0] * 0.9, cardColorRgb[1] * 0.9, cardColorRgb[2] * 0.9),
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.08
      });

      const metalMaterial = new THREE.MeshStandardMaterial({
        color: '#d9dce2',
        metalness: 1,
        roughness: 0.16
      });

      const bandMaterial = new THREE.MeshPhysicalMaterial({
        map: strapTexture,
        normalMap: weave,
        normalScale: new THREE.Vector2(0.7, 0.7),
        roughness: 0.65,
        sheen: 1,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color(0.35, 0.35, 0.38),
        side: THREE.DoubleSide
      });

      const cardGroup = new THREE.Group();
      const geom = buildCardGeometry(layout);
      const bodyMesh = new THREE.Mesh(geom.body, edgeMaterial);
      const frontMesh = new THREE.Mesh(geom.face, frontMaterial);
      const backMesh = new THREE.Mesh(geom.face.clone(), backMaterial);
      frontMesh.position.z = THICKNESS / 2 + BEVEL + 0.0006;
      backMesh.rotation.y = Math.PI;
      backMesh.position.z = -(THICKNESS / 2 + BEVEL + 0.0006);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(RING_RADIUS * scale, RING_TUBE * scale, 18, 72),
        metalMaterial
      );
      ring.position.set(0, layout.ringY, 0);
      ring.rotation.y = Math.PI / 2 - 0.7;

      cardGroup.add(bodyMesh, frontMesh, backMesh, ring);
      scene.add(cardGroup);

      const bandGeometry = buildBandGeometry(SAMPLES);
      const bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
      bandMesh.frustumCulled = false;
      scene.add(bandMesh);

      const clampGroup = new THREE.Group();
      const clampMesh = new THREE.Mesh(buildClampGeometry(STRAP_WIDTH * scale), metalMaterial);
      clampMesh.position.y = (EYELET_RADIUS + CLAMP_BODY / 2 - 0.004) * scale;
      const eyelet = new THREE.Mesh(
        new THREE.TorusGeometry(EYELET_RADIUS * scale, 0.011 * scale, 14, 40),
        metalMaterial
      );
      clampGroup.add(clampMesh, eyelet);
      scene.add(clampGroup);

      const sim = createSimulation();

      const tileRatio = paintStrap(strapCanvas, parseColor(cfg.strapColor, [0.1, 0.1, 0.5]));
      weave.repeat.set(2, 2 * tileRatio);
      strapTexture.needsUpdate = true;

      const fW = FACE_WIDTH;
      const fH = Math.round((FACE_WIDTH * layout.height) / layout.width);
      frontCanvas.width = fW;
      frontCanvas.height = fH;
      backCanvas.width = fW;
      backCanvas.height = fH;

      paintFace(frontCanvas, null, cardColorRgb);
      paintFace(backCanvas, null, cardColorRgb);
      frontTexture.needsUpdate = true;
      backTexture.needsUpdate = true;

      loadImage(imageCache, cfg.frontImage).then((img) => {
        if (!img) return;
        paintFace(frontCanvas, img, cardColorRgb);
        paintFace(backCanvas, img, cardColorRgb);
        frontTexture.needsUpdate = true;
        backTexture.needsUpdate = true;
      });

      return {
        config: cfg,
        sim,
        layout,
        scale,
        cardGroup,
        bodyMesh,
        frontMesh,
        backMesh,
        ring,
        clampGroup,
        clampMesh,
        eyelet,
        bandGeometry,
        bandMesh,
        frontCanvas,
        backCanvas,
        strapCanvas,
        frontTexture,
        backTexture,
        strapTexture,
        frontMaterial,
        backMaterial,
        edgeMaterial,
        metalMaterial,
        bandMaterial,
        tileRatio,
        points: Array.from({ length: SAMPLES }, () => new THREE.Vector3()),
        sides: Array.from({ length: SAMPLES }, () => new THREE.Vector3()),
        controls: [],
        mouth: new THREE.Vector3(),
        tuck: new THREE.Vector3(),
        curve: new THREE.CatmullRomCurve3([], false, 'centripetal')
      };
    });

    const view = { width: 1, height: 1 };
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let visible = true;
    let alive = true;
    let placed = false;
    let activeGrabIdx = -1;
    let press: Press | null = null;

    const frameScene = () => {
      const aspect = view.width / view.height;
      // High-visibility framing: cards are large, prominent, and clearly readable
      let viewHeight = 5.2;
      const minRequiredWidth = 8.2;
      if (viewHeight * aspect < minRequiredWidth) {
        viewHeight = minRequiredWidth / aspect;
      }
      const viewWidth = viewHeight * aspect;

      camera.aspect = aspect;
      camera.position.set(0, 0, (viewHeight / 2) / Math.tan((FOV * Math.PI) / 360));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      foilUniforms.foilKey.value.set(-3, 5, 8).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilFill.value.set(4, -1, 5).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilTop.value.set(0.5, 4.5, 8).normalize().transformDirection(camera.matrixWorldInverse);

      const topAnchorY = viewHeight / 2 + 0.15;
      const cardRestY = -0.1;

      badgeRuntimes.forEach((b) => {
        const ratio = b.config.anchorRatio ?? 0;
        const anchorX = ratio * Math.min(viewWidth, 12);
        b.sim.anchor.set(anchorX, topAnchorY, 0);

        const strapDrop = b.config.strapLength ?? 0.38;
        const totalDrop = topAnchorY - (cardRestY + b.layout.hangY);
        configureSimulation(b.sim, b.layout, Math.max(1.5, totalDrop * (0.85 + strapDrop * 0.3)), b.config.mass ?? 1);
        b.sim.nodes[0].copy(b.sim.anchor);
        b.sim.previous[0].copy(b.sim.anchor);

        if (!placed) {
          placeHanging(b.sim, b.layout, intro && !reducedMotion);
        }
      });
      placed = true;
    };

    const updateBand = (b: BadgeRuntime) => {
      const { sim, scale, points, sides, controls, mouth, tuck, curve, bandGeometry, clampGroup } = b;
      const hang = sim.nodes[JOINTS];
      const reach = (EYELET_RADIUS + CLAMP_BODY + 0.05) * scale;
      let guide = JOINTS - 1;
      while (guide > 0 && sim.nodes[guide].distanceTo(hang) < reach * 1.1) guide--;
      const axis = scratch.a.subVectors(sim.nodes[guide], hang);
      if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0).applyQuaternion(sim.body.quaternion);
      axis.normalize();
      mouth.copy(hang).addScaledVector(axis, reach);
      tuck.copy(hang).addScaledVector(axis, (EYELET_RADIUS + CLAMP_BODY * 0.35) * scale);
      controls.length = 0;
      for (let i = 0; i <= guide; i++) controls.push(sim.nodes[i]);
      controls.push(mouth, tuck);
      curve.points = controls;
      curve.updateArcLengths();
      for (let i = 0; i < SAMPLES; i++) curve.getPointAt(i / (SAMPLES - 1), points[i]);
      const length = curve.getLength();
      const held = 1 - mouth.distanceTo(tuck) / Math.max(length, 0.001);
      const position = bandGeometry.getAttribute('position') as THREE.BufferAttribute;
      const normal = bandGeometry.getAttribute('normal') as THREE.BufferAttribute;
      const uv = bandGeometry.getAttribute('uv') as THREE.BufferAttribute;
      const columns = BAND_COLUMNS.length;
      const restLength = sim.rest * JOINTS;
      const strapScale = STRAP_WIDTH * scale;
      const repeats = restLength / (strapScale * b.tileRatio);
      const width = strapScale / Math.pow(Math.max(1, length / Math.max(restLength, 0.001)), 0.35);
      const bends = BAND_BEND.map((angle): [number, number] => [Math.cos(angle), Math.sin(angle)]);
      const tangent = scratch.b;
      const toCam = scratch.c;
      const across = scratch.d;
      const facing = scratch.e;

      for (let i = 0; i < SAMPLES; i++) {
        tangent.subVectors(points[Math.min(SAMPLES - 1, i + 1)], points[Math.max(0, i - 1)]);
        if (tangent.lengthSq() < 1e-12) tangent.set(0, -1, 0);
        tangent.normalize();
        toCam.subVectors(camera.position, points[i]).normalize();
        const side = sides[i].crossVectors(toCam, tangent);
        if (side.lengthSq() < 1e-10) side.copy(i > 0 ? sides[i - 1] : scratch.f.set(1, 0, 0));
        side.normalize();
        if (i > 0 && side.dot(sides[i - 1]) < 0) side.negate();
        const angle = -sim.twist * Math.pow(Math.min(1, i / (SAMPLES - 1) / held), 1.3);
        facing.crossVectors(tangent, side);
        across.copy(side).multiplyScalar(Math.cos(angle)).addScaledVector(facing, Math.sin(angle));
        facing.crossVectors(tangent, across);
        const p = points[i];
        const v = (1 - i / (SAMPLES - 1)) * repeats;
        for (let c = 0; c < columns; c++) {
          const k = i * columns + c;
          const offset = (BAND_COLUMNS[c] - 0.5) * width;
          const [bendCos, bendSin] = bends[c];
          position.setXYZ(k, p.x + across.x * offset, p.y + across.y * offset, p.z + across.z * offset);
          normal.setXYZ(
            k,
            facing.x * bendCos + across.x * bendSin,
            facing.y * bendCos + across.y * bendSin,
            facing.z * bendCos + across.z * bendSin
          );
          uv.setXY(k, BAND_COLUMNS[c], v);
        }
      }
      position.needsUpdate = true;
      normal.needsUpdate = true;
      uv.needsUpdate = true;

      across.copy(across).addScaledVector(axis, -across.dot(axis)).normalize();
      facing.crossVectors(across, axis).normalize();
      scratch.a.copy(across);
      const basis = new THREE.Matrix4().makeBasis(across, axis, facing);
      clampGroup.quaternion.setFromRotationMatrix(basis);
      clampGroup.position.copy(hang);
    };

    // Resolves inter-badge physical collisions (repulsion + velocity/torque impulse transfer)
    const resolveInterBadgeCollisions = () => {
      const N = badgeRuntimes.length;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const bA = badgeRuntimes[i];
          const bB = badgeRuntimes[j];
          const simA = bA.sim;
          const simB = bB.sim;

          // Capsule-sphere collision points along each card
          const upA = scratch.a.set(0, 1, 0).applyQuaternion(simA.body.quaternion);
          const upB = scratch.b.set(0, 1, 0).applyQuaternion(simB.body.quaternion);
          const hA = bA.layout.height;
          const hB = bB.layout.height;
          const rA = bA.layout.width * 0.50;
          const rB = bB.layout.width * 0.50;

          const spheresA = [
            simA.body.position.clone().addScaledVector(upA, hA * 0.25),
            simA.body.position.clone().addScaledVector(upA, -hA * 0.25)
          ];
          const spheresB = [
            simB.body.position.clone().addScaledVector(upB, hB * 0.25),
            simB.body.position.clone().addScaledVector(upB, -hB * 0.25)
          ];

          for (const sA of spheresA) {
            for (const sB of spheresB) {
              const delta = scratch.c.subVectors(sA, sB);
              const dist = delta.length();
              const minDist = rA + rB;
              if (dist < minDist && dist > 1e-4) {
                const normal = delta.divideScalar(dist);
                const overlap = minDist - dist;
                const isGrabbedA = !!simA.grab;
                const isGrabbedB = !!simB.grab;

                // Position separation
                if (!isGrabbedA && !isGrabbedB) {
                  simA.body.position.addScaledVector(normal, overlap * 0.5);
                  simB.body.position.addScaledVector(normal, -overlap * 0.5);
                } else if (isGrabbedA && !isGrabbedB) {
                  simB.body.position.addScaledVector(normal, -overlap);
                } else if (!isGrabbedA && isGrabbedB) {
                  simA.body.position.addScaledVector(normal, overlap);
                }

                // Elastic impulse transfer
                const cpA = scratch.d.subVectors(sA, simA.body.position);
                const cpB = scratch.e.subVectors(sB, simB.body.position);
                const vA = scratch.f.copy(simA.body.velocity).add(scratch.g.crossVectors(simA.body.angular, cpA));
                const vB = simB.body.velocity.clone().add(new THREE.Vector3().crossVectors(simB.body.angular, cpB));
                const vRel = vA.sub(vB);
                const vNorm = vRel.dot(normal);

                if (vNorm < 0) {
                  const restitution = 0.55;
                  const rnA = scratch.f.crossVectors(cpA, normal);
                  const rnB = new THREE.Vector3().crossVectors(cpB, normal);
                  const invMassA = isGrabbedA ? 0 : 1 / simA.body.mass + rnA.dot(applyInverseInertia(simA.body, rnA, scratch.g));
                  const invMassB = isGrabbedB ? 0 : 1 / simB.body.mass + rnB.dot(applyInverseInertia(simB.body, rnB, new THREE.Vector3()));
                  const denom = invMassA + invMassB;

                  if (denom > 1e-6) {
                    const jMag = -((1 + restitution) * vNorm) / denom;
                    const impulse = normal.clone().multiplyScalar(jMag);
                    if (!isGrabbedA) {
                      simA.body.velocity.addScaledVector(impulse, 1 / simA.body.mass);
                      const torqueA = cpA.clone().cross(impulse);
                      simA.body.angular.add(applyInverseInertia(simA.body, torqueA, scratch.g));
                    }
                    if (!isGrabbedB) {
                      simB.body.velocity.addScaledVector(impulse, -1 / simB.body.mass);
                      const torqueB = cpB.clone().cross(impulse.clone().negate());
                      simB.body.angular.add(applyInverseInertia(simB.body, torqueB, new THREE.Vector3()));
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const getPhysics = (): Physics => {
      const g = 40 * clamp(gravity, 0, 3);
      const weight = Math.max(g, 20);
      const springy = clamp(elasticity, 0, 1);
      const settle = clamp(damping, 0, 1);
      return {
        gravity: g,
        hold: weight * mix(2.2, 5.5, springy),
        stiffness: weight * 10 * JOINTS,
        spring: weight * mix(0.1, 0.4, springy) * JOINTS,
        bandDamping: weight * mix(0.3, 0.08, springy) * JOINTS,
        linearDrag: 0.25 * Math.pow(16, settle),
        angularDrag: 0.5 * Math.pow(12, settle),
        air: 0.15,
        broadside: 0.5,
        spinAir: 0.03,
        nodeDrag: 2,
        nodeAir: 0.2,
        twist: 30,
        twistDamping: 3,
        grip: 40,
        gripDamping: 6,
        breeze: reducedMotion ? 0 : clamp(breeze, 0, 1)
      };
    };

    const stepWorld = (dt: number, phys: Physics) => {
      const steps = Math.max(1, Math.ceil(dt / MAX_STEP - 1e-6));
      const h = dt / steps;
      const windX = phys.breeze * (Math.sin(time * 0.53) * 0.7 + Math.sin(time * 1.31 + 1.7) * 0.3) * 3;
      const windZ = phys.breeze * Math.sin(time * 0.37 + 0.6) * 2;
      const pin = scratch.pin;
      const nodeDrag = Math.exp(-phys.nodeDrag * h);
      const linearDrag = Math.exp(-phys.linearDrag * h);
      const angularDrag = Math.exp(-phys.angularDrag * h);

      for (let s = 0; s < steps; s++) {
        // 1. Step individual badges
        badgeRuntimes.forEach((b) => {
          const sim = b.sim;
          const { nodes, previous, velocities, body } = sim;

          for (let i = 1; i < JOINTS; i++) {
            const v = velocities[i];
            v.y -= phys.gravity * h;
            v.x += windX * h;
            v.z += windZ * h;
            previous[i].copy(nodes[i]);
            nodes[i].addScaledVector(v, h);
          }

          body.previous.copy(body.position);
          body.previousQuaternion.copy(body.quaternion);
          const q = body.quaternion;

          if (sim.grab) {
            const turn = scratch.q.copy(sim.grab.rotation).multiply(scratch.r.copy(q).invert());
            if (turn.w < 0) turn.set(-turn.x, -turn.y, -turn.z, -turn.w);
            const torque = scratch.a.set(turn.x, turn.y, turn.z).multiplyScalar(2 * phys.grip);
            torque.addScaledVector(body.angular, -phys.gripDamping);
            body.angular.addScaledVector(applyInverseInertia(body, torque, scratch.b), h);
          }

          const up = scratch.a.set(0, 1, 0).applyQuaternion(q);
          const front = scratch.b.set(-up.x * up.z, -up.y * up.z, 1 - up.z * up.z);
          if (front.lengthSq() > 1e-3) {
            const facing = scratch.d.set(0, 0, 1).applyQuaternion(q);
            const raw = Math.atan2(scratch.e.crossVectors(front, facing).dot(up), front.dot(facing));
            let turned = raw - sim.twistRaw;
            if (turned > Math.PI) turned -= Math.PI * 2;
            else if (turned < -Math.PI) turned += Math.PI * 2;
            sim.twist += turned;
            sim.twistRaw = raw;
          }

          if (!sim.grab) {
            const spin = body.angular.dot(up);
            body.angular.addScaledVector(up, (phys.twist * (sim.turn - sim.twist) - phys.twistDamping * spin) * h);
          }

          body.velocity.y -= phys.gravity * h;
          body.velocity.x += windX * 0.35 * h;
          body.velocity.z += windZ * 0.35 * h;
          body.position.addScaledVector(body.velocity, h);
          rotateBody(body.quaternion, scratch.f.copy(body.angular).multiplyScalar(h));

          sim.impulses.fill(0);
          if (sim.grab) pin.lerpVectors(sim.grab.from, sim.grab.target, (s + 1) / steps);
          for (let iter = 0; iter < ITERATIONS; iter++) {
            for (let i = 0; i < JOINTS; i++) solveSegment(sim, i, h, phys);
            if (sim.grab) solvePin(body, sim.grab, pin);
          }

          for (let i = 1; i < JOINTS; i++) {
            const v = velocities[i].subVectors(nodes[i], previous[i]).divideScalar(h).multiplyScalar(nodeDrag);
            v.multiplyScalar(1 / (1 + phys.nodeAir * v.length() * h));
          }

          body.velocity.subVectors(body.position, body.previous).divideScalar(h);
          const dq = scratch.q.copy(body.previousQuaternion).invert().premultiply(body.quaternion);
          body.angular.set(dq.x, dq.y, dq.z).multiplyScalar((2 / h) * (dq.w < 0 ? -1 : 1));

          const normal = scratch.a.set(0, 0, 1).applyQuaternion(body.quaternion);
          const across = body.velocity.dot(normal);
          const along = scratch.b.copy(body.velocity).addScaledVector(normal, -across);
          along.multiplyScalar(1 / (1 + phys.air * along.length() * h));
          body.velocity
            .copy(along)
            .addScaledVector(normal, across / (1 + phys.broadside * Math.abs(across) * h))
            .multiplyScalar(linearDrag);
          body.angular.multiplyScalar(angularDrag / (1 + phys.spinAir * body.angular.length() * h));

          if (body.velocity.lengthSq() > 3600) body.velocity.setLength(60);
          if (body.angular.lengthSq() > 1600) body.angular.setLength(40);

          nodes[JOINTS].copy(body.hang).applyQuaternion(body.quaternion).add(body.position);
          for (let i = 0; i < JOINTS; i++) sim.lengths[i] = nodes[i].distanceTo(nodes[i + 1]);
        });

        // 2. Solve inter-badge physics collisions
        resolveInterBadgeCollisions();
      }

      badgeRuntimes.forEach((b) => {
        if (b.sim.grab) b.sim.grab.from.copy(b.sim.grab.target);
      });
    };

    const render = () => {
      badgeRuntimes.forEach((b) => {
        b.cardGroup.position.copy(b.sim.body.position);
        b.cardGroup.quaternion.copy(b.sim.body.quaternion);
        updateBand(b);
      });
      renderer.render(scene, camera);
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      time += dt;

      const phys = getPhysics();
      stepWorld(dt, phys);

      render();

      let totalEnergy = 0;
      badgeRuntimes.forEach((b) => {
        const body = b.sim.body;
        if (!Number.isFinite(body.position.x + body.position.y + body.position.z + body.quaternion.w)) {
          b.sim.grab = null;
          placeHanging(b.sim, b.layout, false);
        }
        totalEnergy += body.velocity.lengthSq() + body.angular.lengthSq() * 0.3;
      });

      const resting = totalEnergy < 5e-4 && activeGrabIdx === -1 && phys.breeze === 0;
      if (visible && !resting) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const toPointer = (event: { clientX: number; clientY: number }) => {
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
    };

    const pickCard = () => {
      const meshes: THREE.Mesh[] = [];
      badgeRuntimes.forEach((b) => {
        b.cardGroup.updateMatrixWorld();
        meshes.push(b.bodyMesh, b.frontMesh, b.backMesh);
      });
      const hits = raycaster.intersectObjects(meshes, false);
      if (!hits.length) return null;
      const hitObj = hits[0].object;
      const idx = badgeRuntimes.findIndex(
        (b) => b.bodyMesh === hitObj || b.frontMesh === hitObj || b.backMesh === hitObj
      );
      return { hit: hits[0], badgeIdx: idx };
    };

    const setCursor = (value: string) => {
      if (canvas.style.cursor !== value) canvas.style.cursor = value;
    };

    const flipBadge = (b: BadgeRuntime, point: THREE.Vector3) => {
      const body = b.sim.body;
      const up = scratch.a.set(0, 1, 0).applyQuaternion(body.quaternion);
      let direction = b.sim.turn > 0 ? -1 : 1;
      if (b.sim.turn === 0) {
        const away = scratch.c.subVectors(point, camera.position).normalize();
        direction = scratch.b.subVectors(point, body.position).cross(away).dot(up) < 0 ? -1 : 1;
      }
      b.sim.turn = b.sim.turn === 0 ? Math.PI * direction : 0;
      body.angular.addScaledVector(up, FLIP_SPIN * direction);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!interactive || event.button > 0) return;
      toPointer(event);
      const picked = pickCard();
      if (!picked || picked.badgeIdx === -1) return;
      activeGrabIdx = picked.badgeIdx;
      const b = badgeRuntimes[activeGrabIdx];
      const hit = picked.hit;

      b.sim.grab = {
        local: hit.point.clone().sub(b.sim.body.position).applyQuaternion(b.sim.body.quaternion.clone().invert()),
        rotation: b.sim.body.quaternion.clone(),
        reach: hit.distance,
        from: hit.point.clone(),
        target: hit.point.clone()
      };
      press = { x: event.clientX, y: event.clientY, time: performance.now(), point: hit.point.clone() };
      canvas.setPointerCapture?.(event.pointerId);
      setCursor('grabbing');
      event.preventDefault();
      start();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!interactive) return;
      toPointer(event);
      if (activeGrabIdx !== -1) {
        const b = badgeRuntimes[activeGrabIdx];
        if (b.sim.grab) {
          if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press = null;
          raycaster.ray.at(b.sim.grab.reach, b.sim.grab.target);
          start();
          return;
        }
      }
      if (event.pointerType === 'touch') return;
      const hover = !!pickCard();
      setCursor(hover ? 'grab' : '');
    };

    const onPointerUp = (event: PointerEvent) => {
      if (activeGrabIdx !== -1) {
        const b = badgeRuntimes[activeGrabIdx];
        if (b.sim.grab) {
          b.sim.grab = null;
          if (press && event.type === 'pointerup' && performance.now() - press.time < 450) {
            flipBadge(b, press.point);
          }
        }
        activeGrabIdx = -1;
      }
      press = null;
      canvas.releasePointerCapture?.(event.pointerId);
      setCursor(pickCard() && event.pointerType !== 'touch' ? 'grab' : '');
      start();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!interactive || event.touches.length !== 1) return;
      toPointer(event.touches[0]);
      if (pickCard()) event.preventDefault();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('lostpointercapture', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    const resize = () => {
      view.width = Math.max(1, container.clientWidth);
      view.height = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(view.width, view.height, false);
      frameScene();
      render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    intersectionObserver.observe(container);

    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    start();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('lostpointercapture', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart);

      badgeRuntimes.forEach((b) => {
        b.bodyMesh.geometry.dispose();
        b.frontMesh.geometry.dispose();
        b.backMesh.geometry.dispose();
        b.ring.geometry.dispose();
        b.clampMesh.geometry.dispose();
        b.eyelet.geometry.dispose();
        b.bandGeometry.dispose();
        b.frontTexture.dispose();
        b.backTexture.dispose();
        b.strapTexture.dispose();
        b.frontMaterial.dispose();
        b.backMaterial.dispose();
        b.edgeMaterial.dispose();
        b.metalMaterial.dispose();
        b.bandMaterial.dispose();
      });

      environment.texture.dispose();
      grain.dispose();
      weave.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, [badgesProp, gravity, damping, elasticity, breeze, interactive, intro]);

  return (
    <div
      ref={containerRef}
      className={`unified-lanyard-arena ${className}`.trim()}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'visible',
        ...style
      }}
    />
  );
};

export default UnifiedLanyard;
