
import { useEffect, useState } from "react";
import { ROLES, allowedViews, homeView } from "./auth/roles";
import { logOut } from "./auth/authService";
import { AdminPortal } from "./portals/admin/AdminPortal";
import { CustomerPortal } from "./portals/customer/CustomerPortal";
import { MaintenanceDashboard } from "./portals/maintenance/MaintenanceDashboard";
import { OperationsDashboard } from "./portals/operations/OperationsDashboard";

export function Workspace({ user, role }) {
  const views = allowedViews(role);
  const isAdmin = role === ROLES.ADMIN;

  const [view, setView] = useState(() => homeView(role));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Only allow views assigned to the user's role.
  const current = views.includes(view) ? view : homeView(role);
  const can = (name) => views.includes(name);

  const goHome = isAdmin ? () => setView("portal") : undefined;

  // Dashboard switching permissions.
  const switchTargets = isAdmin
    ? ["operations", "maintenance", "customer"]
    : [ROLES.MAINTENANCE, ROLES.OPERATIONS].includes(role)
      ? ["operations", "maintenance"]
      : [];

  return (
    <>
      {can("portal") && (
        <div hidden={current !== "portal"}>
          <AdminPortal onOpen={setView} onLogout={logOut} />
        </div>
      )}

      {can("customer") && (
        <div hidden={current !== "customer"}>
          <CustomerPortal
            user={user}
            role={role}
            onLogout={logOut}
            onBack={goHome}
          />
        </div>
      )}

      {can("maintenance") && (
        <div hidden={current !== "maintenance"}>
          <MaintenanceDashboard
            onHome={goHome}
            user={user}
            onLogout={logOut}
            onSwitch={setView}
            switchTargets={switchTargets}
          />
        </div>
      )}

      {can("operations") && (
        <div hidden={current !== "operations"}>
          <OperationsDashboard
            onHome={goHome}
            user={user}
            onLogout={logOut}
            onSwitch={setView}
            switchTargets={switchTargets}
          />
        </div>
      )}
    </>
  );
}
