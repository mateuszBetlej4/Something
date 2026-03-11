/**
 * Camera and coordinate system: world ↔ screen.
 * World space: 2D continuous (x, y). Screen: pixel space. Origin at center of view.
 */

export interface Camera {
  x: number;
  y: number;
  scale: number;
  minScale: number;
  maxScale: number;
}

export function worldToScreen(
  camera: Camera,
  viewWidth: number,
  viewHeight: number,
  wx: number,
  wy: number
): [number, number] {
  const sx = (wx - camera.x) * camera.scale + viewWidth / 2;
  const sy = (wy - camera.y) * camera.scale + viewHeight / 2;
  return [sx, sy];
}

export function screenToWorld(
  camera: Camera,
  viewWidth: number,
  viewHeight: number,
  sx: number,
  sy: number
): [number, number] {
  const wx = (sx - viewWidth / 2) / camera.scale + camera.x;
  const wy = (sy - viewHeight / 2) / camera.scale + camera.y;
  return [wx, wy];
}
