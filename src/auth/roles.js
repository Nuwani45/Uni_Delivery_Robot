/* Role definitions for UniDelivery.
 * A user's role is stored in Firestore at users/{uid} in a field named "role".
 * Roles are assigned by an administrator in the Firebase console, except
 * "customer", which new sign-ups receive automatically. */

export const ROLES = {
  CUSTOMER: "customer",
  MAINTENANCE: "maintenance",
  OPERATIONS: "operations",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  customer: "Customer",
  maintenance: "Maintenance staff",
  operations: "Operations staff",
  admin: "Administrator",
};

/* Returns a valid role string, or null if the value is missing or unknown. */
export function normaliseRole(value) {
  if (typeof value !== "string") return null;
  const role = value.trim().toLowerCase();
  return Object.values(ROLES).includes(role) ? role : null;
}

/* The views (portals) each role may open. Admins also get the "portal"
 * landing page that links to all three areas. */
export function allowedViews(role) {
  switch (role) {
    case ROLES.ADMIN:
      return ["portal", "customer", "operations", "maintenance"];
    case ROLES.CUSTOMER:
      return ["customer"];
    case ROLES.MAINTENANCE:
      return ["maintenance"];
    case ROLES.OPERATIONS:
      return ["operations"];
    default:
      return [];
  }
}

export function homeView(role) {
  return allowedViews(role)[0] ?? null;
}
