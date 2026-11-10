/* Shared SVG icon set. Glyph keys from the original dashboards are kept as-is. */

const ICONS = {
  bell: (<><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/></>),
  "▦": (<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>),
  "⚙": (<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></>),
  "⌖": (<><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></>),
  "❄": (<><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/></>),
  "◉": (<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/></>),
  "⌁": (<><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></>),
  "✥": (<><path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/></>),
  "＋": (<><path d="M12 5v14M5 12h14"/></>),
  "☰": (<><path d="M4 6h16M4 12h16M4 18h16"/></>),
  "◎": (<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></>),
  "✓": (<><path d="M5 13l4 4L19 7"/></>),
  "⌂": (<><path d="M3 11l9-8 9 8M5 10v10h14V10"/></>),
  "◈": (<><path d="M12 3l9 9-9 9-9-9z"/></>),
  "♨": (<><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/></>),
  "▤": (<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 12h18M10 8h4M10 16h4"/></>),
  "◌": (<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  /* Added for the Customer Portal, mobile navigation and sign-in */
  home: (<><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></>),
  info: (<><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5v.01"/></>),
  package: (<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5"/><path d="M12 12v9"/></>),
  user: (<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></>),
  help: (<><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7"/><path d="M12 17v.01"/></>),
  menu: (<><path d="M4 7h16M4 12h16M4 17h16"/></>),
  close: (<><path d="M6 6l12 12M18 6L6 18"/></>),
  eye: (<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>),
  eyeOff: (<><path d="M3 3l18 18"/><path d="M10.6 5.1A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4"/><path d="M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>),
  logout: (<><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M16 8l4 4-4 4"/><path d="M20 12H9"/></>),
  pin: (<><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></>),
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>),
  clock: (<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  arrowRight: (<><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>),
  shield: (<><path d="M12 3l8 3v6c0 4.5-3.4 7.7-8 9-4.6-1.3-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></>),
};

export function Icon({ g }) {
  return ICONS[g] ? (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{ICONS[g]}</svg>
  ) : (
    g
  );
}
