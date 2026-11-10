import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { BrandLockup } from "./BrandMark";

/* Dashboards an admin can jump between from the sidebar. Staff roles are not
 * given any switch targets, so they only ever see their own dashboard. */
const SWITCH_LABELS = {
  operations: ["Operations", "☰"],
  maintenance: ["Maintenance", "⚙"],
  customer: ["Customer Portal", "home"],
};

/* ==========================================================================
   SHARED DASHBOARD SHELL (sidebar + top bar + footer)
   On screens up to 720px wide the sidebar becomes a slide-out menu that is
   opened from the bar at the top of the page.
   ========================================================================== */
export function DashboardShell({
  sidebarLabel,
  navItems,
  page,
  onNavigate,
  onHome,
  eyebrow,
  subtitle,
  robotInfo,
  footerText,
  user,
  onLogout,
  onSwitch,
  switchTargets = [],
  view,
  alerts = 0,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu with the Escape key.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="dashboard">
      <aside
        id={`sidebar-${view}`}
        className={menuOpen ? "sidebar open" : "sidebar"}
        aria-label={`${sidebarLabel} menu`}
      >
        <div>
          <div className="sidebar-head">
            <BrandLockup />
            <button
              className="icon-button sidebar-close"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <Icon g="close" />
            </button>
          </div>

          <div className="sidebar-label">{sidebarLabel}</div>

          <nav className="sidebar-nav" aria-label={`${sidebarLabel} navigation`}>
            {navItems.map((item) => (
              <button
                key={item.label}
                className={page === item.label ? "nav-item active" : "nav-item"}
                onClick={() => {
                  onNavigate(item.label);
                  closeMenu();
                }}
                aria-current={page === item.label ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <span className="nav-icon"><Icon g={item.icon} /></span>
                <span>{item.label}</span>
                {page === item.label && <span className="active-indicator" />}
              </button>
            ))}
          </nav>

          {switchTargets.length > 0 && (
            <>
              <div className="sidebar-divider" />
              <div className="sidebar-label">Areas</div>
              {switchTargets.map((key) => {
                const [label, glyph] = SWITCH_LABELS[key];
                return (
                  <button
                    key={key}
                    className={view === key ? "nav-item switch current" : "nav-item switch"}
                    onClick={() => {
                      onSwitch(key);
                      closeMenu();
                    }}
                    aria-current={view === key ? "true" : undefined}
                  >
                    <span className="nav-icon"><Icon g={glyph} /></span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </>
          )}

          {onHome && (
            <>
              <div className="sidebar-divider" />
              <button
                className="nav-item portal-link"
                onClick={onHome}
                aria-label="Back to main portal"
                title="Back to main portal"
              >
                <span className="nav-icon"><Icon g="⌂" /></span>
                <span>Main Portal</span>
              </button>
            </>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="robot-avatar">UD</div>
          <div className="sidebar-robot-info">
            <strong>{robotInfo.name}</strong>
            <small>{robotInfo.line}</small>
          </div>
          <span className="sidebar-status-dot" title="Simulation mode" />
        </div>
      </aside>

      {menuOpen && <div className="sidebar-backdrop" onClick={closeMenu} aria-hidden="true" />}

      <main className="main-content">
        <div className="mobile-bar">
          <button
            className="icon-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls={`sidebar-${view}`}
          >
            <Icon g="menu" />
          </button>
          <span className="mobile-bar-title">{page}</span>
          <button
            className="icon-button"
            aria-label={alerts ? "1 new notification" : "No new notifications"}
            title={alerts ? "Robot arrived – awaiting PIN" : "No new notifications"}
          >
            <Icon g="bell" />
            {alerts > 0 && <span className="notif-dot" />}
          </button>
        </div>

        <header className="topbar">
          <div className="page-heading">
            <div className="eyebrow">
              UniDelivery <span>/</span> {eyebrow}
            </div>
            <h1>{page}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="topbar-right">
            <div className="status-chip">
              <span className="simulation-dot" />
              Robot: simulation mode
            </div>
            <button
              className="icon-button topbar-bell"
              aria-label={alerts ? "1 new notification" : "No new notifications"}
              title={alerts ? "Robot arrived – awaiting PIN" : "No new notifications"}
            >
              <Icon g="bell" />
              {alerts > 0 && <span className="notif-dot" />}
            </button>
            <div className="profile">
              <span className="profile-avatar">{(user?.email || "U")[0].toUpperCase()}</span>
              <span className="profile-text">
                <strong>{user?.email || "Signed in"}</strong>
                <small>Authorised user</small>
              </span>
              <button className="secondary-button" onClick={onLogout}>Sign out</button>
            </div>
          </div>
        </header>

        {children}

        <footer className="app-footer">
          <span><strong>UniDelivery</strong> · Robotics Management System</span>
          <span>{footerText} <i /> Frontend simulation</span>
        </footer>
      </main>
    </div>
  );
}
