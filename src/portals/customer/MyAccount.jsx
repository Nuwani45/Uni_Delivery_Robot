import { ROLE_LABELS } from "../../auth/roles";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function MyAccount({ user, role, onLogout }) {
  const display = user?.displayName || "";
  const initial = (display || user?.email || "U").charAt(0).toUpperCase();

  const rows = [
    ["Name", display || "Not set"],
    ["Email", user?.email || "Not available"],
    ["Account type", ROLE_LABELS[role] || "Not available"],
    ["Email verified", user?.emailVerified ? "Yes" : "No"],
    ["Member since", formatDate(user?.metadata?.creationTime)],
  ];

  return (
    <div className="c-page">
      <header className="c-page-head">
        <p className="c-eyebrow">My account</p>
        <h1>Your profile</h1>
      </header>

      <section className="c-card c-account">
        <div className="c-account-head">
          <span className="c-avatar c-avatar-lg" aria-hidden="true">{initial}</span>
          <div>
            <h2>{display || user?.email}</h2>
            <p>{ROLE_LABELS[role] || "UniDelivery user"}</p>
          </div>
        </div>

        <dl className="c-details">
          {rows.map(([label, value]) => (
            <div key={label} className="c-detail-row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="c-account-actions">
          <button className="c-btn c-btn-secondary" disabled title="Profile editing is not available yet">
            Edit profile (coming soon)
          </button>
          <button className="c-btn c-btn-primary" onClick={onLogout}>Sign out</button>
        </div>
      </section>
    </div>
  );
}
