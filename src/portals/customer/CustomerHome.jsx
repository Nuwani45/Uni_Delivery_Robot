import { Icon } from "../../components/Icon";
import { PLANNED_FLOW, SERVICE_STATUS } from "./customerContent";

function firstName(user) {
  const source = user?.displayName || user?.email || "";
  const word = source.split(/[\s@]/)[0];
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
}

const QUICK_LINKS = [
  { id: "request", icon: "package", title: "Request a delivery", text: "Preview the request form." },
  { id: "service", icon: "info", title: "Service information", text: "How UniDelivery works." },
  { id: "help", icon: "help", title: "Help and support", text: "Answers to common questions." },
];

export function CustomerHome({ user, onNavigate }) {
  const name = firstName(user);

  return (
    <div className="c-page">
      <section className="c-hero">
        <p className="c-eyebrow">Welcome to UniDelivery</p>
        <h1>{name ? `Hello, ${name}` : "Hello"}</h1>
        <p className="c-lead">
          Campus deliveries by autonomous robot, made simple for students and staff.
        </p>
        <button className="c-btn c-btn-primary" onClick={() => onNavigate("request")}>
          Request a delivery
          <Icon g="arrowRight" />
        </button>
      </section>

      <section className="c-card c-status" aria-label="Service status">
        <span className="c-status-dot" aria-hidden="true" />
        <div>
          <h2>Service status: {SERVICE_STATUS.label}</h2>
          <p>{SERVICE_STATUS.detail}</p>
        </div>
      </section>

      <section aria-labelledby="quick-links-title">
        <h2 id="quick-links-title" className="c-section-title">Where to next</h2>
        <div className="c-grid c-grid-3">
          {QUICK_LINKS.map((link) => (
            <button key={link.id} className="c-card c-link-card" onClick={() => onNavigate(link.id)}>
              <span className="c-icon-tile"><Icon g={link.icon} /></span>
              <span className="c-link-text">
                <strong>{link.title}</strong>
                <small>{link.text}</small>
              </span>
              <span className="c-link-arrow" aria-hidden="true"><Icon g="arrowRight" /></span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title" className="c-section-title">How it will work</h2>
        <ol className="c-steps">
          {PLANNED_FLOW.map((step, index) => (
            <li key={step.title} className="c-card c-step">
              <span className="c-step-number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
