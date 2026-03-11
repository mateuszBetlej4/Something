/**
 * Buildings: minimal model for rendering (type, position, level).
 * Full model (links, inputs/outputs) comes in Data model (C).
 * Draw as rect or circle; size and color depend on type and level.
 */

export type BuildingType =
  | "refinery"
  | "factory"
  | "farm"
  | "base"
  | "port"
  | "hub";

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  level: number;
  ownerId: number;
}

export type BuildingShape = "rect" | "circle";

export interface BuildingAppearance {
  shape: BuildingShape;
  size: number; // world units (half-width for rect, radius for circle)
  fill: string;
  stroke: string;
}

const TYPE_COLORS: Record<BuildingType, string> = {
  refinery: "#8b4513",
  factory: "#4a4a4a",
  farm: "#6b8e23",
  base: "#8b0000",
  port: "#4682b4",
  hub: "#2e8b57",
};

const BASE_SIZES: Record<BuildingType, number> = {
  refinery: 14,
  factory: 18,
  farm: 12,
  base: 22,
  port: 16,
  hub: 20,
};

export function getBuildingAppearance(b: Building): BuildingAppearance {
  const baseSize = BASE_SIZES[b.type] ?? 15;
  const size = baseSize * (0.8 + 0.2 * b.level);
  const fill = TYPE_COLORS[b.type] ?? "#555";
  const stroke = brighten(fill, 0.4);
  const shape: BuildingShape = b.type === "port" || b.type === "hub" ? "circle" : "rect";
  return { shape, size, fill, stroke };
}

function brighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 255 * amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 255 * amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 255 * amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

let placeholderBuildings: Building[] | null = null;

export function getBuildings(): Building[] {
  if (placeholderBuildings) return placeholderBuildings;
  placeholderBuildings = [
    { id: "b1", type: "factory", x: 400, y: 400, level: 1, ownerId: 1 },
    { id: "b2", type: "refinery", x: 600, y: 600, level: 2, ownerId: 2 },
    { id: "b3", type: "farm", x: 800, y: 300, level: 1, ownerId: 1 },
    { id: "b4", type: "base", x: 1200, y: 800, level: 1, ownerId: 3 },
    { id: "b5", type: "port", x: 300, y: 1200, level: 1, ownerId: 4 },
    { id: "b6", type: "hub", x: 1500, y: 500, level: 2, ownerId: 2 },
  ];
  return placeholderBuildings;
}
