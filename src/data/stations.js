/* Shared station data used by the Maintenance, Operations and Customer portals. */

export const initialStations = [
  { id: 1, color: "Red", room: "Room 01", symbol: "R", registered: true },
  { id: 2, color: "Blue", room: "Room 02", symbol: "B", registered: true },
  { id: 3, color: "Green", room: "Room 03", symbol: "G", registered: true },
  { id: 4, color: "Yellow", room: "Room 04", symbol: "Y", registered: true },
];

export const pad = (number) => String(number).padStart(2, "0");

export const stationName = (station) => `Station ${pad(station.id)} – ${station.room}`;
