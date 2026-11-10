/* Static data and route helpers for the Operations Dashboard (simulation only). */

export const operationsNavItems = [
  { label: "Operations Overview", icon: "▦" },
  { label: "Create Delivery", icon: "＋" },
  { label: "Delivery Queue", icon: "☰" },
  { label: "Live Monitoring", icon: "◎" },
  { label: "Delivery Completion", icon: "✓" },
];

// Positions inside the 600 x 300 simulated map. Rooms open onto a corridor at y = 150.
export const DOCK = { x: 60, y: 150 };
export const CORRIDOR_Y = 150;
export const stationLayout = {
  1: { x: 190, y: 80, roomX: 140, roomY: 20 },
  2: { x: 190, y: 220, roomX: 140, roomY: 170 },
  3: { x: 410, y: 80, roomX: 360, roomY: 20 },
  4: { x: 410, y: 220, roomX: 360, roomY: 170 },
};

export const ROBOT_STEP = 6; // pixels moved every 100 ms
export const PREPARING_MS = 2500;
export const COLLECTING_MS = 4000;
export const DEMO_PIN = "1234";

export const statusClass = {
  Pending: "s-pending",
  Preparing: "s-preparing",
  "In Transit": "s-transit",
  Arrived: "s-arrived",
  Completed: "s-completed",
  Cancelled: "s-cancelled",
};

export const initialRobot = {
  phase: "idle", // idle | preparing | outbound | arrived | collecting | returning
  x: DOCK.x,
  y: DOCK.y,
  angle: 0,
  battery: 86,
  activeId: null,
  stationId: null,
  routeIndex: 0,
};

export const lockedDrawers = { 1: "Locked", 2: "Locked" };

// Points the robot still has to reach (excluding where it starts).
export function getRoute(phase, stationId) {
  const layout = stationLayout[stationId];
  if (!layout) return [];
  const junction = { x: layout.x, y: CORRIDOR_Y };
  return phase === "returning"
    ? [junction, DOCK]
    : [junction, { x: layout.x, y: layout.y }];
}

// Full path used for drawing the route line.
export function getPathPoints(phase, stationId) {
  const layout = stationLayout[stationId];
  if (!layout) return [];
  const junction = { x: layout.x, y: CORRIDOR_Y };
  const room = { x: layout.x, y: layout.y };
  return phase === "returning" ? [room, junction, DOCK] : [DOCK, junction, room];
}

export const trackSteps = ["Pending", "Preparing", "In Transit", "Arrived", "Completed"];
