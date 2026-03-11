import { describe, it, expect } from "vitest";
import {
  getResourceDisplays,
  getResourceBarWidth,
  getPanelBounds,
  getResourceBarY,
  UI,
} from "./ui";

describe("ui", () => {
  describe("getResourceDisplays", () => {
    it("returns non-empty array", () => {
      const list = getResourceDisplays();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });

    it("returns same reference on repeated calls (cached)", () => {
      expect(getResourceDisplays()).toBe(getResourceDisplays());
    });

    it("each resource has id, label, value, max, color", () => {
      for (const r of getResourceDisplays()) {
        expect(r).toHaveProperty("id");
        expect(r).toHaveProperty("label");
        expect(r).toHaveProperty("value");
        expect(r).toHaveProperty("max");
        expect(r).toHaveProperty("color");
        expect(r.value).toBeGreaterThanOrEqual(0);
        expect(r.max).toBeGreaterThan(0);
        expect(r.color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });
  });

  describe("getResourceBarWidth", () => {
    it("returns 0 when max is 0", () => {
      expect(getResourceBarWidth(10, 0, 100)).toBe(0);
    });

    it("returns 0 when value is 0", () => {
      expect(getResourceBarWidth(0, 100, 100)).toBe(0);
    });

    it("returns full track when value >= max", () => {
      expect(getResourceBarWidth(100, 100, 200)).toBe(200);
      expect(getResourceBarWidth(150, 100, 200)).toBe(200);
    });

    it("returns proportional width", () => {
      expect(getResourceBarWidth(50, 100, 100)).toBe(50);
      expect(getResourceBarWidth(25, 100, 100)).toBe(25);
    });

    it("clamps to track width", () => {
      expect(getResourceBarWidth(100, 50, 80)).toBe(80);
    });
  });

  describe("getPanelBounds", () => {
    it("returns x, y, w, h with panel on right side", () => {
      const b = getPanelBounds(800);
      expect(b.x).toBe(800 - b.w - 12);
      expect(b.y).toBe(8);
      expect(b.w).toBeLessThanOrEqual(280);
      expect(b.h).toBe(120);
    });

    it("panel width fits screen when narrow", () => {
      const b = getPanelBounds(200);
      expect(b.w).toBeLessThanOrEqual(200 - 16);
    });
  });

  describe("getResourceBarY", () => {
    it("increases with index", () => {
      expect(getResourceBarY(1)).toBeGreaterThan(getResourceBarY(0));
      expect(getResourceBarY(2)).toBeGreaterThan(getResourceBarY(1));
    });
  });

  describe("UI constants", () => {
    it("has expected color and font keys", () => {
      expect(UI.panelBg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(UI.textColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(UI.fontSize).toBe(14);
    });
  });
});
