/**
 * Units/armies: minimal model for rendering (position, owner, strength).
 * Draw as dot or triangle; color = owner, size = strength.
 */

export type UnitSymbol = "dot" | "triangle";

export interface Unit {
  id: string;
  x: number;
  y: number;
  ownerId: number;
  strength: number; // 1..10 or similar; drives visual size
  symbol: UnitSymbol;
}

const OWNER_COLORS: Record<number, string> = {
  0: "#808080",
  1: "#4a6fa5",
  2: "#c45c4a",
  3: "#6a9a5a",
  4: "#9a7a4a",
  5: "#7a5a9a",
};

const BASE_SIZE = 6;
const STRENGTH_SCALE = 1.5; // size = BASE_SIZE + strength * STRENGTH_SCALE

export interface UnitAppearance {
  symbol: UnitSymbol;
  size: number; // world units (radius for dot, half-height for triangle)
  fill: string;
  stroke: string;
}

export function getUnitAppearance(u: Unit): UnitAppearance {
  const size = BASE_SIZE + u.strength * STRENGTH_SCALE;
  const fill = OWNER_COLORS[u.ownerId] ?? "#808080";
  const stroke = darken(fill, 0.3);
  return { symbol: u.symbol, size, fill, stroke };
}

function darken(hex: string, amount: number): string {
  const r = Math.round(Math.max(0, parseInt(hex.slice(1, 3), 16) - 255 * amount));
  const g = Math.round(Math.max(0, parseInt(hex.slice(3, 5), 16) - 255 * amount));
  const b = Math.round(Math.max(0, parseInt(hex.slice(5, 7), 16) - 255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

let placeholderUnits: Unit[] | null = null;

export function getUnits(): Unit[] {
  if (placeholderUnits) return placeholderUnits;
  placeholderUnits = [
    { id: "u1", x: 450, y: 450, ownerId: 1, strength: 3, symbol: "triangle" },
    { id: "u2", x: 650, y: 650, ownerId: 2, strength: 5, symbol: "triangle" },
    { id: "u3", x: 350, y: 1100, ownerId: 4, strength: 2, symbol: "dot" },
    { id: "u4", x: 1300, y: 600, ownerId: 3, strength: 4, symbol: "triangle" },
  ];
  return placeholderUnits;
}
