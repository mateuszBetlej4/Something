/**
 * Routes: lines between buildings (trade routes, supply lines).
 * Each route has from/to building ids; positions resolved from building list.
 */

import type { Building } from "./buildings";

export interface Route {
  id: string;
  fromBuildingId: string;
  toBuildingId: string;
}

export interface RouteSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

let placeholderRoutes: Route[] | null = null;

export function getRoutes(): Route[] {
  if (placeholderRoutes) return placeholderRoutes;
  placeholderRoutes = [
    { id: "r1", fromBuildingId: "b1", toBuildingId: "b3" },
    { id: "r2", fromBuildingId: "b2", toBuildingId: "b6" },
    { id: "r3", fromBuildingId: "b4", toBuildingId: "b5" },
  ];
  return placeholderRoutes;
}

export function getRouteSegment(route: Route, buildings: Building[]): RouteSegment | null {
  const fromB = buildings.find((b) => b.id === route.fromBuildingId);
  const toB = buildings.find((b) => b.id === route.toBuildingId);
  if (!fromB || !toB) return null;
  return { x1: fromB.x, y1: fromB.y, x2: toB.x, y2: toB.y };
}

export function getRouteSegments(routes: Route[], buildings: Building[]): RouteSegment[] {
  const out: RouteSegment[] = [];
  for (const r of routes) {
    const seg = getRouteSegment(r, buildings);
    if (seg) out.push(seg);
  }
  return out;
}
