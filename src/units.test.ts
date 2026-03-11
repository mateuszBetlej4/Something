import { describe, it, expect } from "vitest";
import { getUnits, getUnitAppearance, type Unit, type UnitSymbol } from "./units";

describe("units", () => {
  describe("getUnits", () => {
    it("returns non-empty array", () => {
      const list = getUnits();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });

    it("returns same reference on repeated calls (cached)", () => {
      expect(getUnits()).toBe(getUnits());
    });

    it("each unit has id, x, y, ownerId, strength, symbol", () => {
      const symbols: UnitSymbol[] = ["dot", "triangle"];
      for (const u of getUnits()) {
        expect(u).toHaveProperty("id");
        expect(u).toHaveProperty("x");
        expect(u).toHaveProperty("y");
        expect(u).toHaveProperty("ownerId");
        expect(u).toHaveProperty("strength");
        expect(u).toHaveProperty("symbol");
        expect(symbols).toContain(u.symbol);
        expect(u.strength).toBeGreaterThan(0);
        expect(Number.isInteger(u.ownerId)).toBe(true);
      }
    });
  });

  describe("getUnitAppearance", () => {
    it("returns symbol, size, fill, stroke", () => {
      const u: Unit = { id: "a", x: 0, y: 0, ownerId: 1, strength: 2, symbol: "triangle" };
      const app = getUnitAppearance(u);
      expect(["dot", "triangle"]).toContain(app.symbol);
      expect(app.size).toBeGreaterThan(0);
      expect(app.fill).toMatch(/^#[0-9a-f]{6}$/i);
      expect(app.stroke).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("higher strength increases size", () => {
      const u1: Unit = { id: "a", x: 0, y: 0, ownerId: 0, strength: 1, symbol: "dot" };
      const u2: Unit = { id: "b", x: 0, y: 0, ownerId: 0, strength: 5, symbol: "dot" };
      expect(getUnitAppearance(u2).size).toBeGreaterThan(getUnitAppearance(u1).size);
    });

    it("fill matches owner color", () => {
      const u: Unit = { id: "a", x: 0, y: 0, ownerId: 2, strength: 1, symbol: "dot" };
      const app = getUnitAppearance(u);
      expect(app.fill).toBe("#c45c4a");
    });
  });
});
