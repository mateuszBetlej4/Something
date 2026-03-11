import { describe, it, expect } from "vitest";
import {
  worldToScreen,
  screenToWorld,
  type Camera,
} from "./camera";

const viewWidth = 800;
const viewHeight = 600;

function cameraAt(overrides: Partial<Camera> = {}): Camera {
  return {
    x: 0,
    y: 0,
    scale: 1,
    minScale: 0.1,
    maxScale: 5,
    ...overrides,
  };
}

describe("camera", () => {
  describe("worldToScreen", () => {
    it("centers world origin at view center when camera at 0,0 scale 1", () => {
      const cam = cameraAt();
      const [sx, sy] = worldToScreen(cam, viewWidth, viewHeight, 0, 0);
      expect(sx).toBe(viewWidth / 2);
      expect(sy).toBe(viewHeight / 2);
    });

    it("applies camera offset (pan)", () => {
      const cam = cameraAt({ x: 100, y: 50 });
      const [sx, sy] = worldToScreen(cam, viewWidth, viewHeight, 100, 50);
      expect(sx).toBe(viewWidth / 2);
      expect(sy).toBe(viewHeight / 2);
    });

    it("applies scale (zoom)", () => {
      const cam = cameraAt({ scale: 2 });
      const [sx] = worldToScreen(cam, viewWidth, viewHeight, 100, 0);
      // world 100 → (100 - 0) * 2 + 400 = 600
      expect(sx).toBe(viewWidth / 2 + 100 * 2);
    });
  });

  describe("screenToWorld", () => {
    it("maps view center to world origin when camera at 0,0 scale 1", () => {
      const cam = cameraAt();
      const [wx, wy] = screenToWorld(cam, viewWidth, viewHeight, viewWidth / 2, viewHeight / 2);
      expect(wx).toBe(0);
      expect(wy).toBe(0);
    });

    it("applies inverse scale", () => {
      const cam = cameraAt({ scale: 2 });
      const [wx] = screenToWorld(cam, viewWidth, viewHeight, viewWidth / 2 + 200, viewHeight / 2);
      expect(wx).toBe(100);
    });
  });

  describe("round-trip", () => {
    it("world → screen → world returns original (scale 1)", () => {
      const cam = cameraAt();
      const [sx, sy] = worldToScreen(cam, viewWidth, viewHeight, 42, -17);
      const [wx, wy] = screenToWorld(cam, viewWidth, viewHeight, sx, sy);
      expect(wx).toBeCloseTo(42, 10);
      expect(wy).toBeCloseTo(-17, 10);
    });

    it("world → screen → world returns original (panned and zoomed)", () => {
      const cam = cameraAt({ x: -50, y: 100, scale: 1.5 });
      const [sx, sy] = worldToScreen(cam, viewWidth, viewHeight, 42, -17);
      const [wx, wy] = screenToWorld(cam, viewWidth, viewHeight, sx, sy);
      expect(wx).toBeCloseTo(42, 10);
      expect(wy).toBeCloseTo(-17, 10);
    });
  });
});
