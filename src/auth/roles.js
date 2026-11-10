
/* Role definitions for UniDelivery.
 * A user's role is stored in Firestore at users/{uid} in a field named "role".
 */

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

/* Returns the views each role is allowed to access. */
export function allowedViews(role) {
  switch (role) {
    case ROLES.ADMIN:
      return ["portal", "customer", "operations", "maintenance"];

    case ROLES.CUSTOMER:
      return ["customer"];

    case ROLES.MAINTENANCE:
      return ["maintenance", "operations"];

    case ROLES.OPERATIONS:
      return ["operations", "maintenance"];

    default:
      return [];
  }
}

/* Determines the initial view after login. */
export function homeView(role) {
  return allowedViews(role)[0] ?? null;
}
