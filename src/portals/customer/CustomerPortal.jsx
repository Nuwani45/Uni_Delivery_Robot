import { useState } from "react";
import { BrandMark } from "../../components/BrandMark";
import { Icon } from "../../components/Icon";
import { CustomerHome } from "./CustomerHome";
import { RequestDelivery } from "./RequestDelivery";
import { ServiceInfo } from "./ServiceInfo";
import { HelpSupport } from "./HelpSupport";
import { MyAccount } from "./MyAccount";

const PAGES = [
  { id: "home", label: "Home", short: "Home", icon: "home" },
  { id: "request", label: "Request delivery", short: "Request", icon: "package" },
  { id: "service", label: "Service info", short: "Service", icon: "info" },
  { id: "help", label: "Help and support", short: "Help", icon: "help" },
  { id: "account", label: "My account", short: "Account", icon: "user" },
];

/* CUSTOMER PORTAL
 * Light, simple layout for students and staff using the service. Top
 * navigation on larger screens, a bottom tab bar on phones.
 * onBack is only passed for administrators previewing this portal. */
export function CustomerPortal({ user, role, onLogout, onBack }) {
  const [page, setPage] = useState("home");

  function go(id) {
    setPage(id);
    window.scrollTo(0, 0);
  }

  const initial = (user?.displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="customer-app">
      {onBack && (
        <div className="c-adminbar">
          <span>Administrator preview of the customer portal</span>
          <button className="c-adminbar-btn" onClick={onBack}>Back to main portal</button>
        </div>
      )}

      <header className="c-header">
        <div className="c-header-inner">
          <button className="c-brand" onClick={() => go("home")} aria-label="UniDelivery home">
            <BrandMark />
            <span className="c-brand-name">UniDelivery</span>
          </button>

          <nav className="c-nav" aria-label="Customer navigation">
            {PAGES.map((item) => (
              <button
                key={item.id}
                className={page === item.id ? "c-nav-link active" : "c-nav-link"}
                onClick={() => go(item.id)}
                aria-current={page === item.id ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="c-user">
            <span className="c-avatar" aria-hidden="true">{initial}</span>
            <button className="c-btn c-btn-ghost c-signout" onClick={onLogout}>
              <Icon g="logout" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="c-main">
        {page === "home" && <CustomerHome user={user} onNavigate={go} />}
        {page === "request" && <RequestDelivery user={user} />}
        {page === "service" && <ServiceInfo />}
        {page === "help" && <HelpSupport />}
        {page === "account" && <MyAccount user={user} role={role} onLogout={onLogout} />}
      </main>

      <footer className="c-footer">
        <span><strong>UniDelivery</strong> · Autonomous campus delivery</span>
        <span>Service in development</span>
      </footer>

      <nav className="c-tabbar" aria-label="Customer navigation (mobile)">
        {PAGES.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "c-tab active" : "c-tab"}
            onClick={() => go(item.id)}
            aria-current={page === item.id ? "page" : undefined}
          >
            <Icon g={item.icon} />
            <span>{item.short}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
