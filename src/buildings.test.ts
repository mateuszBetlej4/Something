import { describe, it, expect } from "vitest";
import {
  getBuildings,
  getBuildingAppearance,
  type Building,
  type BuildingType,
} from "./buildings";

describe("buildings", () => {
  describe("getBuildings", () => {
    it("returns non-empty array", () => {
      const list = getBuildings();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });

    it("returns same reference on repeated calls (cached)", () => {
      expect(getBuildings()).toBe(getBuildings());
    });

    it("each building has id, type, x, y, level, ownerId", () => {
      const types: BuildingType[] = ["refinery", "factory", "farm", "base", "port", "hub"];
      for (const b of getBuildings()) {
        expect(b).toHaveProperty("id");
        expect(b).toHaveProperty("type");
        expect(b).toHaveProperty("x");
        expect(b).toHaveProperty("y");
        expect(b).toHaveProperty("level");
        expect(b).toHaveProperty("ownerId");
        expect(types).toContain(b.type);
        expect(b.level).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(b.ownerId)).toBe(true);
      }
    });
  });

  describe("getBuildingAppearance", () => {
    it("returns shape, size, fill, stroke for every type", () => {
      const types: BuildingType[] = ["refinery", "factory", "farm", "base", "port", "hub"];
      for (const type of types) {
        const b: Building = { id: "t", type, x: 0, y: 0, level: 1, ownerId: 0 };
        const app = getBuildingAppearance(b);
        expect(["rect", "circle"]).toContain(app.shape);
        expect(app.size).toBeGreaterThan(0);
        expect(app.fill).toMatch(/^#[0-9a-f]{6}$/i);
        expect(app.stroke).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it("higher level increases size", () => {
      const b1: Building = { id: "a", type: "factory", x: 0, y: 0, level: 1, ownerId: 0 };
      const b2: Building = { id: "b", type: "factory", x: 0, y: 0, level: 3, ownerId: 0 };
      expect(getBuildingAppearance(b2).size).toBeGreaterThan(getBuildingAppearance(b1).size);
    });

    it("port and hub use circle shape", () => {
      const port: Building = { id: "p", type: "port", x: 0, y: 0, level: 1, ownerId: 0 };
      const hub: Building = { id: "h", type: "hub", x: 0, y: 0, level: 1, ownerId: 0 };
      expect(getBuildingAppearance(port).shape).toBe("circle");
      expect(getBuildingAppearance(hub).shape).toBe("circle");
    });

    it("factory and refinery use rect shape", () => {
      const factory: Building = { id: "f", type: "factory", x: 0, y: 0, level: 1, ownerId: 0 };
      const refinery: Building = { id: "r", type: "refinery", x: 0, y: 0, level: 1, ownerId: 0 };
      expect(getBuildingAppearance(factory).shape).toBe("rect");
      expect(getBuildingAppearance(refinery).shape).toBe("rect");
    });
  });
});
