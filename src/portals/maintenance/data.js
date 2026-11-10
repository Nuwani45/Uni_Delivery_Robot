/* Static data for the Maintenance Dashboard (simulation only). */

export const initialMotors = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  pwm: 0,
  direction: "Forward",
  running: false,
}));

export const navigationItems = [
  { label: "Overview", icon: "▦" },
  { label: "Motor Control", icon: "⚙" },
  { label: "Mapping & Navigation", icon: "⌖" },
  { label: "Cooling System", icon: "❄" },
  { label: "Indicators", icon: "◉" },
  { label: "Sensor Monitoring", icon: "⌁" },
  { label: "Manual Control", icon: "✥" },
];

export const navigationDiagnostics = [
  ["SLAM", "Not connected"],
  ["Map Data", "Not available"],
  ["Robot Position", "Not available"],
  ["Path Planning", "Not active"],
  ["Obstacle Avoidance", "Not connected"],
  ["Marker Recognition", "Not connected"],
  ["Wheel Odometry", "Not connected"],
  ["IMU Localisation", "Not connected"],
];

export const sensorReadings = [
  ["LiDAR / ToF", "Not connected"],
  ["RGB Camera", "Not connected"],
  ["RGB Colour Sensor", "Not connected"],
  ["Temperature", "-- °C"],
  ["Battery Voltage", "-- V"],
  ["Wheel Encoders", "Not connected"],
  ["IMU", "Not connected"],
  ["Obstacle Sensors", "Not connected"],
];
