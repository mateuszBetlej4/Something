/**
 * Geopolitics Economy – entry point, game loop, camera, coordinate system.
 * World space: 2D continuous (x, y). Screen: pixel space. Camera: pan (offset) + zoom (scale).
 */

import { worldToScreen as worldToScreenCam, screenToWorld as screenToWorldCam, type Camera } from "./camera";
import { getBuildings, getBuildingAppearance } from "./buildings";
import { getRouteSegments, getRoutes } from "./routes";
import { getUnits, getUnitAppearance } from "./units";
import {
  getCells,
  getCellColor,
  getBorderSegments,
  CELL_SIZE,
} from "./terrain";
import { renderUI } from "./ui";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const camera: Camera = {
  x: 0,
  y: 0,
  scale: 1,
  minScale: 0.1,
  maxScale: 5,
};

function worldToScreen(wx: number, wy: number): [number, number] {
  return worldToScreenCam(camera, canvas.width, canvas.height, wx, wy);
}

function screenToWorld(sx: number, sy: number): [number, number] {
  return screenToWorldCam(camera, canvas.width, canvas.height, sx, sy);
}

// --- Game loop ---
let lastTime = performance.now();

function tick(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(tick);
}

function update(_dt: number): void {
  // Simulation step (economy, etc.) will go here; fixed timestep can be added later.
}

function render(): void {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cells = getCells();

  // Terrain: fill each cell by color (elevation + ownership)
  for (const cell of cells) {
    const [sx, sy] = worldToScreen(cell.wx - CELL_SIZE / 2, cell.wy - CELL_SIZE / 2);
    const [sx2, sy2] = worldToScreen(cell.wx + CELL_SIZE / 2, cell.wy + CELL_SIZE / 2);
    ctx.fillStyle = getCellColor(cell);
    ctx.fillRect(sx, sy, sx2 - sx, sy2 - sy);
  }

  // Borders: lines between different owners
  const segs = getBorderSegments();
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = Math.max(1, 2 / camera.scale);
  ctx.beginPath();
  for (const s of segs) {
    const [a0, a1] = worldToScreen(s.x1, s.y1);
    const [b0, b1] = worldToScreen(s.x2, s.y2);
    ctx.moveTo(a0, a1);
    ctx.lineTo(b0, b1);
  }
  ctx.stroke();

  // Routes: lines between buildings (trade/supply)
  const buildings = getBuildings();
  const routeSegs = getRouteSegments(getRoutes(), buildings);
  ctx.strokeStyle = "#5a7a9a";
  ctx.lineWidth = Math.max(1, 2 / camera.scale);
  ctx.setLineDash([8 / camera.scale, 6 / camera.scale]);
  ctx.beginPath();
  for (const seg of routeSegs) {
    const [sx1, sy1] = worldToScreen(seg.x1, seg.y1);
    const [sx2, sy2] = worldToScreen(seg.x2, seg.y2);
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Buildings: simple shapes by type/level
  for (const b of buildings) {
    const app = getBuildingAppearance(b);
    const [cx, cy] = worldToScreen(b.x, b.y);
    const screenSize = app.size * camera.scale;
    ctx.fillStyle = app.fill;
    ctx.strokeStyle = app.stroke;
    ctx.lineWidth = Math.max(1, 2 / camera.scale);
    if (app.shape === "circle") {
      ctx.beginPath();
      ctx.arc(cx, cy, screenSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(cx - screenSize, cy - screenSize, screenSize * 2, screenSize * 2);
      ctx.strokeRect(cx - screenSize, cy - screenSize, screenSize * 2, screenSize * 2);
    }
  }

  // Units/armies: dot or triangle, color = owner, size = strength
  for (const u of getUnits()) {
    const app = getUnitAppearance(u);
    const [cx, cy] = worldToScreen(u.x, u.y);
    const screenSize = Math.max(2, app.size * camera.scale);
    ctx.fillStyle = app.fill;
    ctx.strokeStyle = app.stroke;
    ctx.lineWidth = Math.max(1, 1.5 / camera.scale);
    if (app.symbol === "dot") {
      ctx.beginPath();
      ctx.arc(cx, cy, screenSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, cy - screenSize);
      ctx.lineTo(cx + screenSize, cy + screenSize);
      ctx.lineTo(cx - screenSize, cy + screenSize);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // Origin marker (optional)
  const [sx, sy] = worldToScreen(0, 0);
  if (sx >= -20 && sx <= canvas.width + 20 && sy >= -20 && sy <= canvas.height + 20) {
    ctx.fillStyle = "#8a8aae";
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // UI overlay: panel, resource bars, icons
  renderUI(ctx, canvas.width, canvas.height);
}

// --- Resize ---
function resize(): void {
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

// --- Pan / zoom ---
let dragStart: { x: number; y: number; camX: number; camY: number } | null = null;

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  const factor = e.deltaY > 0 ? 0.9 : 1.1;
  camera.scale = Math.max(camera.minScale, Math.min(camera.maxScale, camera.scale * factor));
  const [wx2, wy2] = screenToWorld(e.clientX, e.clientY);
  camera.x += wx - wx2;
  camera.y += wy - wy2;
}, { passive: false });

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0) dragStart = { x: e.clientX, y: e.clientY, camX: camera.x, camY: camera.y };
});

canvas.addEventListener("mousemove", (e) => {
  if (!dragStart) return;
  const [dw0] = screenToWorld(dragStart.x, dragStart.y);
  const [dw1] = screenToWorld(e.clientX, e.clientY);
  camera.x = dragStart.camX - (dw1 - dw0);
  const [, dwy0] = screenToWorld(dragStart.x, dragStart.y);
  const [, dwy1] = screenToWorld(e.clientX, e.clientY);
  camera.y = dragStart.camY - (dwy1 - dwy0);
});

canvas.addEventListener("mouseup", () => { dragStart = null; });
canvas.addEventListener("mouseleave", () => { dragStart = null; });

// --- Start ---
requestAnimationFrame(tick);
