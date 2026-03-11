import { describe, it, expect } from "vitest";
import { getRoutes, getRouteSegment, getRouteSegments, type Route } from "./routes";
import { getBuildings } from "./buildings";

describe("routes", () => {
  describe("getRoutes", () => {
    it("returns non-empty array", () => {
      const list = getRoutes();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });

    it("returns same reference on repeated calls (cached)", () => {
      expect(getRoutes()).toBe(getRoutes());
    });

    it("each route has id, fromBuildingId, toBuildingId", () => {
      for (const r of getRoutes()) {
        expect(r).toHaveProperty("id");
        expect(r).toHaveProperty("fromBuildingId");
        expect(r).toHaveProperty("toBuildingId");
        expect(typeof r.fromBuildingId).toBe("string");
        expect(typeof r.toBuildingId).toBe("string");
      }
    });
  });

  describe("getRouteSegment", () => {
    it("returns segment with x1,y1,x2,y2 when buildings exist", () => {
      const buildings = getBuildings();
      const route: Route = { id: "r1", fromBuildingId: "b1", toBuildingId: "b3" };
      const seg = getRouteSegment(route, buildings);
      expect(seg).not.toBeNull();
      expect(seg!).toHaveProperty("x1");
      expect(seg!).toHaveProperty("y1");
      expect(seg!).toHaveProperty("x2");
      expect(seg!).toHaveProperty("y2");
      const b1 = buildings.find((b) => b.id === "b1")!;
      const b3 = buildings.find((b) => b.id === "b3")!;
      expect(seg!.x1).toBe(b1.x);
      expect(seg!.y1).toBe(b1.y);
      expect(seg!.x2).toBe(b3.x);
      expect(seg!.y2).toBe(b3.y);
    });

    it("returns null when from building missing", () => {
      const buildings = getBuildings().filter((b) => b.id !== "b1");
      const route: Route = { id: "r", fromBuildingId: "b1", toBuildingId: "b3" };
      expect(getRouteSegment(route, buildings)).toBeNull();
    });

    it("returns null when to building missing", () => {
      const buildings = getBuildings().filter((b) => b.id !== "b3");
      const route: Route = { id: "r", fromBuildingId: "b1", toBuildingId: "b3" };
      expect(getRouteSegment(route, buildings)).toBeNull();
    });
  });

  describe("getRouteSegments", () => {
    it("returns one segment per route when all buildings present", () => {
      const routes = getRoutes();
      const buildings = getBuildings();
      const segs = getRouteSegments(routes, buildings);
      expect(segs.length).toBe(routes.length);
    });

    it("skips routes with missing buildings", () => {
      const routeMissing: Route = { id: "x", fromBuildingId: "none", toBuildingId: "b1" };
      const buildings = getBuildings();
      const segs = getRouteSegments([routeMissing], buildings);
      expect(segs.length).toBe(0);
    });
  });
});
