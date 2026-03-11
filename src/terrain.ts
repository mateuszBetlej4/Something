/**
 * Procedural terrain: grid of cells with elevation (noise) and ownership.
 * Colors from rules: elevation → biome (water/lowland/highland/mountain), then tint by owner.
 * Border segments: edges between cells with different ownership.
 */

const SEED = 12345;

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0; // 32-bit
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(SEED);

// 2D value noise (grid corners, bilinear sample)
const noiseScale = 0.08;
const noiseCache: number[] = [];
const noiseSize = 256;
for (let i = 0; i < noiseSize * noiseSize; i++) noiseCache[i] = rnd();

function noise2d(x: number, y: number): number {
  const px = ((x * noiseScale) % noiseSize + noiseSize) % noiseSize | 0;
  const py = ((y * noiseScale) % noiseSize + noiseSize) % noiseSize | 0;
  const ix = px % noiseSize;
  const iy = py % noiseSize;
  return noiseCache[iy * noiseSize + ix] ?? 0;
}

// Smoothed elevation (multi-octave style, 2 octaves)
function elevation(wx: number, wy: number): number {
  const a = noise2d(wx, wy);
  const b = noise2d(wx * 2 + 100, wy * 2 + 100) * 0.5;
  return Math.min(1, Math.max(0, a + b));
}

export const CELL_SIZE = 80;
export const MAP_CELLS_X = 64;
export const MAP_CELLS_Y = 48;

export type Biome = "water" | "lowland" | "highland" | "mountain";

export interface Cell {
  wx: number;
  wy: number;
  elevation: number;
  biome: Biome;
  ownerId: number;
}

const elevationWater = 0.38;
const elevationLowland = 0.5;
const elevationHighland = 0.72;

function getBiome(e: number): Biome {
  if (e < elevationWater) return "water";
  if (e < elevationLowland) return "lowland";
  if (e < elevationHighland) return "highland";
  return "mountain";
}

// Country colors (programmatic; index 0 = neutral)
const OWNER_COLORS: Record<number, string> = {
  0: "#404040",
  1: "#4a6fa5",
  2: "#c45c4a",
  3: "#6a9a5a",
  4: "#9a7a4a",
  5: "#7a5a9a",
};

const BIOME_COLORS: Record<Biome, string> = {
  water: "#1a3a5c",
  lowland: "#2d5a3d",
  highland: "#3d6a4a",
  mountain: "#6b7c6e",
};

function tintByOwner(biomeColor: string, ownerId: number): string {
  if (ownerId === 0) return biomeColor;
  const tint = OWNER_COLORS[ownerId] ?? "#808080";
  // Mix: land keeps some biome, water stays bluer
  const mix = 0.35;
  return blendHex(biomeColor, tint, mix);
}

function blendHex(a: string, b: string, t: number): string {
  const parse = (s: string) => ({
    r: parseInt(s.slice(1, 3), 16),
    g: parseInt(s.slice(3, 5), 16),
    b: parseInt(s.slice(5, 7), 16),
  });
  const va = parse(a);
  const vb = parse(b);
  const r = Math.round(va.r + (vb.r - va.r) * t);
  const g = Math.round(va.g + (vb.g - va.g) * t);
  const bl = Math.round(va.b + (vb.b - va.b) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

// Build map once (fixed seed)
let cells: Cell[] | null = null;

function buildMap(): Cell[] {
  if (cells) return cells;
  const out: Cell[] = [];
  for (let gy = 0; gy < MAP_CELLS_Y; gy++) {
    for (let gx = 0; gx < MAP_CELLS_X; gx++) {
      const wx = gx * CELL_SIZE + CELL_SIZE / 2;
      const wy = gy * CELL_SIZE + CELL_SIZE / 2;
      const e = elevation(wx, wy);
      const biome = getBiome(e);
      // Placeholder ownership: 4 blobs from corners
      const ownerId = getOwnerBlob(gx, gy);
      out.push({ wx, wy, elevation: e, biome, ownerId });
    }
  }
  cells = out;
  return out;
}

function getOwnerBlob(gx: number, gy: number): number {
  const cx = MAP_CELLS_X / 2;
  const cy = MAP_CELLS_Y / 2;
  const dx = (gx - cx) / cx;
  const dy = (gy - cy) / cy;
  if (dx < -0.2 && dy < -0.2) return 1;
  if (dx > 0.2 && dy < -0.2) return 2;
  if (dx < -0.2 && dy > 0.2) return 3;
  if (dx > 0.2 && dy > 0.2) return 4;
  return 0;
}

export function getCells(): Cell[] {
  return buildMap();
}

export function getCellAt(gx: number, gy: number): Cell | undefined {
  if (gx < 0 || gx >= MAP_CELLS_X || gy < 0 || gy >= MAP_CELLS_Y) return undefined;
  return buildMap()[gy * MAP_CELLS_X + gx];
}

export function getCellColor(cell: Cell): string {
  return tintByOwner(BIOME_COLORS[cell.biome], cell.ownerId);
}

// Border segments: world-space line from (x1,y1) to (x2,y2) where owner changes
export interface BorderSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function getBorderSegments(): BorderSegment[] {
  const map = buildMap();
  const segs: BorderSegment[] = [];
  const idx = (gx: number, gy: number) => gy * MAP_CELLS_X + gx;
  const owner = (gx: number, gy: number) => {
    if (gx < 0 || gx >= MAP_CELLS_X || gy < 0 || gy >= MAP_CELLS_Y) return -1;
    return map[idx(gx, gy)]!.ownerId;
  };
  for (let gy = 0; gy < MAP_CELLS_Y; gy++) {
    for (let gx = 0; gx < MAP_CELLS_X; gx++) {
      const o = owner(gx, gy);
      if (o < 0) continue;
      const x0 = gx * CELL_SIZE;
      const y0 = gy * CELL_SIZE;
      // Right edge
      if (owner(gx + 1, gy) !== o) {
        segs.push({ x1: x0 + CELL_SIZE, y1: y0, x2: x0 + CELL_SIZE, y2: y0 + CELL_SIZE });
      }
      // Bottom edge
      if (owner(gx, gy + 1) !== o) {
        segs.push({ x1: x0, y1: y0 + CELL_SIZE, x2: x0 + CELL_SIZE, y2: y0 + CELL_SIZE });
      }
    }
  }
  return segs;
}

export function getWorldBounds(): { x: number; y: number; w: number; h: number } {
  return {
    x: 0,
    y: 0,
    w: MAP_CELLS_X * CELL_SIZE,
    h: MAP_CELLS_Y * CELL_SIZE,
  };
}
