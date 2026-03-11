/**
 * Geopolitics Economy – entry point, game loop, camera, coordinate system.
 * World space: 2D continuous (x, y). Screen: pixel space. Camera: pan (offset) + zoom (scale).
 */

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// --- Coordinate system ---
// World: arbitrary units (e.g. 1 unit = 1 cell). Origin (0,0) top-left by convention.
// Screen: pixels. Camera transforms world → screen.
const camera = {
  x: 0,
  y: 0,
  scale: 1,
  minScale: 0.1,
  maxScale: 5,
};

function worldToScreen(wx: number, wy: number): [number, number] {
  const sx = (wx - camera.x) * camera.scale + canvas.width / 2;
  const sy = (wy - camera.y) * camera.scale + canvas.height / 2;
  return [sx, sy];
}

function screenToWorld(sx: number, sy: number): [number, number] {
  const wx = (sx - canvas.width / 2) / camera.scale + camera.x;
  const wy = (sy - canvas.height / 2) / camera.scale + camera.y;
  return [wx, wy];
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

  // Draw a simple grid in world space to show camera/coords work
  const [cx, cy] = screenToWorld(canvas.width / 2, canvas.height / 2);
  const cell = 100;
  const left = Math.floor((cx - 500) / cell) * cell;
  const top = Math.floor((cy - 500) / cell) * cell;
  const right = left + 1000;
  const bottom = top + 1000;

  ctx.strokeStyle = "#2a2a4e";
  ctx.lineWidth = 1 / camera.scale;
  for (let x = left; x <= right; x += cell) {
    const [sx0, sy0] = worldToScreen(x, top);
    const [sx1, sy1] = worldToScreen(x, bottom);
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx1, sy1);
    ctx.stroke();
  }
  for (let y = top; y <= bottom; y += cell) {
    const [sx0, sy0] = worldToScreen(left, y);
    const [sx1, sy1] = worldToScreen(right, y);
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx1, sy1);
    ctx.stroke();
  }

  // Origin marker
  const [sx, sy] = worldToScreen(0, 0);
  ctx.fillStyle = "#6a6a8e";
  ctx.beginPath();
  ctx.arc(sx, sy, 4, 0, Math.PI * 2);
  ctx.fill();
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
