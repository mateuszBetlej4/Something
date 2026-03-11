/**
 * UI: panels, resource bars, and programmatic icons (no textures).
 * All layout in screen pixels; drawn on top of game view.
 */

export interface ResourceDisplay {
  id: string;
  label: string;
  value: number;
  max: number;
  color: string; // fill color for bar
}

const PANEL_PADDING = 12;
const BAR_HEIGHT = 18;
const BAR_GAP = 8;
const PANEL_TOP = 8;
const PANEL_HEIGHT = 120;

let placeholderResources: ResourceDisplay[] | null = null;

export function getResourceDisplays(): ResourceDisplay[] {
  if (placeholderResources) return placeholderResources;
  placeholderResources = [
    { id: "energy", label: "Energy", value: 450, max: 500, color: "#e8c547" },
    { id: "food", label: "Food", value: 280, max: 400, color: "#6b8e23" },
    { id: "industry", label: "Industry", value: 120, max: 200, color: "#4a4a4a" },
  ];
  return placeholderResources;
}

export function getResourceBarWidth(value: number, max: number, trackWidth: number): number {
  if (max <= 0) return 0;
  const t = Math.max(0, Math.min(1, value / max));
  return Math.round(t * trackWidth);
}

export function getPanelBounds(screenWidth: number): { x: number; y: number; w: number; h: number } {
  const w = Math.min(280, screenWidth - 16);
  return {
    x: screenWidth - w - 12,
    y: PANEL_TOP,
    w,
    h: PANEL_HEIGHT,
  };
}

export function getResourceBarY(index: number): number {
  return PANEL_TOP + PANEL_PADDING + index * (BAR_HEIGHT + BAR_GAP);
}

export const UI = {
  panelBg: "#2a2a3e",
  panelStroke: "#4a4a6a",
  barTrack: "#1a1a2a",
  textColor: "#e0e0e0",
  fontSize: 14,
};

export function renderUI(
  ctx: CanvasRenderingContext2D,
  screenWidth: number,
  screenHeight: number
): void {
  const resources = getResourceDisplays();
  const bounds = getPanelBounds(screenWidth);
  const labelWidth = 72;
  const barTrackWidth = bounds.w - PANEL_PADDING * 2 - labelWidth - 8;

  // Panel background and border
  ctx.fillStyle = UI.panelBg;
  ctx.strokeStyle = UI.panelStroke;
  ctx.lineWidth = 2;
  ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);

  ctx.font = `${UI.fontSize}px sans-serif`;
  ctx.fillStyle = UI.textColor;

  for (let i = 0; i < resources.length; i++) {
    const r = resources[i]!;
    const barY = getResourceBarY(i);

    // Icon: small circle (programmatic)
    const iconX = bounds.x + PANEL_PADDING + 8;
    const iconY = barY + BAR_HEIGHT / 2;
    ctx.fillStyle = r.color;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = UI.textColor;
    ctx.fillText(r.label, bounds.x + PANEL_PADDING + 22, barY + BAR_HEIGHT - 4);

    // Bar track
    const trackX = bounds.x + PANEL_PADDING + labelWidth;
    ctx.fillStyle = UI.barTrack;
    ctx.fillRect(trackX, barY, barTrackWidth, BAR_HEIGHT);

    // Bar fill
    const fillWidth = getResourceBarWidth(r.value, r.max, barTrackWidth);
    if (fillWidth > 0) {
      ctx.fillStyle = r.color;
      ctx.fillRect(trackX, barY, fillWidth, BAR_HEIGHT);
    }

    // Bar outline
    ctx.strokeStyle = UI.panelStroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(trackX, barY, barTrackWidth, BAR_HEIGHT);
  }
}
