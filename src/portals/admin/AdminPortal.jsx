import { Icon } from "../../components/Icon";

const AREAS = [
  {
    key: "customer",
    glyph: "home",
    kicker: "Students and staff",
    title: "Customer Portal",
    text: "Preview the customer experience: service information, delivery request entry point, account and help.",
    action: "Open customer portal",
  },
  {
    key: "operations",
    glyph: "☰",
    kicker: "Authorised operators",
    title: "Operations Dashboard",
    text: "Manage deliveries, select destinations and monitor the robot's delivery activities.",
    action: "Open operations dashboard",
  },
  {
    key: "maintenance",
    glyph: "⚙",
    kicker: "Technical team",
    title: "Maintenance Dashboard",
    text: "Monitor and manage robot hardware, sensors, navigation and technical systems.",
    action: "Open maintenance dashboard",
  },
];

/* LANDING PORTAL (administrators only)
 * Admins can open all three areas from here. Every other role goes straight
 * to its own portal and never sees this page. */
export function AdminPortal({ onOpen, onLogout }) {
  return (
    <div className="portal">
      <svg className="portal-art" viewBox="0 0 600 300" aria-hidden="true">
        <path d="M30 150 H570 M190 150 V80 M190 150 V220 M410 150 V80 M410 150 V220" />
        <circle cx="190" cy="80" r="9" />
        <circle cx="190" cy="220" r="9" />
        <circle cx="410" cy="80" r="9" />
        <circle cx="410" cy="220" r="9" />
        <rect x="30" y="136" width="44" height="28" rx="6" />
      </svg>

      <div className="portal-inner portal-inner-wide">
        <div className="portal-hero">
          <div className="portal-mark">U<span>D</span></div>
          <h1>UniDelivery</h1>
          <div className="portal-subtitle">Administrator portal</div>
          <p>
            Welcome to the UniDelivery control portal. Choose an area to open:
            the customer experience, robot operations or hardware maintenance.
          </p>
        </div>

        <div className="portal-cards portal-cards-three">
          {AREAS.map((area) => (
            <article
              key={area.key}
              className="portal-card"
              onClick={() => onOpen(area.key)}
            >
              <div className="portal-card-icon"><Icon g={area.glyph} /></div>
              <div className="section-kicker">{area.kicker}</div>
              <h2>{area.title}</h2>
              <p>{area.text}</p>
              <button
                className="primary-button portal-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(area.key);
                }}
              >
                {area.action}
              </button>
            </article>
          ))}
        </div>

        <div className="portal-note">
          <span className="simulation-dot" />
          Frontend simulation. No robot hardware is connected yet.
        </div>
        <button className="secondary-button portal-signout" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
