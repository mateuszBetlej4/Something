import { describe, it, expect } from "vitest";
import {
  getCells,
  getCellAt,
  getCellColor,
  getBorderSegments,
  getWorldBounds,
  CELL_SIZE,
  MAP_CELLS_X,
  MAP_CELLS_Y,
  type Cell,
  type Biome,
} from "./terrain";

describe("terrain", () => {
  describe("getCells", () => {
    it("returns correct number of cells", () => {
      const cells = getCells();
      expect(cells.length).toBe(MAP_CELLS_X * MAP_CELLS_Y);
    });

    it("returns same reference on repeated calls (cached)", () => {
      expect(getCells()).toBe(getCells());
    });

    it("each cell has wx, wy, elevation, biome, ownerId", () => {
      const cells = getCells();
      const biomes: Biome[] = ["water", "lowland", "highland", "mountain"];
      for (const c of cells) {
        expect(c).toHaveProperty("wx");
        expect(c).toHaveProperty("wy");
        expect(c).toHaveProperty("elevation");
        expect(c).toHaveProperty("biome");
        expect(c).toHaveProperty("ownerId");
        expect(typeof c.wx).toBe("number");
        expect(typeof c.wy).toBe("number");
        expect(c.elevation).toBeGreaterThanOrEqual(0);
        expect(c.elevation).toBeLessThanOrEqual(1);
        expect(biomes).toContain(c.biome);
        expect(Number.isInteger(c.ownerId)).toBe(true);
        expect(c.ownerId).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("getCellAt", () => {
    it("returns cell for valid grid coords", () => {
      const c = getCellAt(0, 0);
      expect(c).toBeDefined();
      expect(c!.wx).toBe(CELL_SIZE / 2);
      expect(c!.wy).toBe(CELL_SIZE / 2);
    });

    it("returns undefined for out-of-bounds", () => {
      expect(getCellAt(-1, 0)).toBeUndefined();
      expect(getCellAt(0, -1)).toBeUndefined();
      expect(getCellAt(MAP_CELLS_X, 0)).toBeUndefined();
      expect(getCellAt(0, MAP_CELLS_Y)).toBeUndefined();
    });

    it("matches getCells index", () => {
      const cells = getCells();
      for (let gy = 0; gy < Math.min(3, MAP_CELLS_Y); gy++) {
        for (let gx = 0; gx < Math.min(3, MAP_CELLS_X); gx++) {
          const fromAt = getCellAt(gx, gy);
          const fromArr = cells[gy * MAP_CELLS_X + gx];
          expect(fromAt).toBe(fromArr);
        }
      }
    });
  });

  describe("getCellColor", () => {
    it("returns hex color string", () => {
      const cells = getCells();
      for (let i = 0; i < Math.min(10, cells.length); i++) {
        const color = getCellColor(cells[i]!);
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it("water cells get water base color tint", () => {
      const waterCell: Cell = {
        wx: 0,
        wy: 0,
        elevation: 0.2,
        biome: "water",
        ownerId: 0,
      };
      const color = getCellColor(waterCell);
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe("getBorderSegments", () => {
    it("returns array of segments with x1,y1,x2,y2", () => {
      const segs = getBorderSegments();
      expect(Array.isArray(segs)).toBe(true);
      for (const s of segs.slice(0, 20)) {
        expect(s).toHaveProperty("x1");
        expect(s).toHaveProperty("y1");
        expect(s).toHaveProperty("x2");
        expect(s).toHaveProperty("y2");
        expect(typeof s.x1).toBe("number");
        expect(typeof s.y2).toBe("number");
      }
    });

    it("has some segments (we have 4 blobs + neutral so borders exist)", () => {
      const segs = getBorderSegments();
      expect(segs.length).toBeGreaterThan(0);
    });
  });

  describe("getWorldBounds", () => {
    it("returns map extent in world units", () => {
      const b = getWorldBounds();
      expect(b.x).toBe(0);
      expect(b.y).toBe(0);
      expect(b.w).toBe(MAP_CELLS_X * CELL_SIZE);
      expect(b.h).toBe(MAP_CELLS_Y * CELL_SIZE);
    });
  });
});
