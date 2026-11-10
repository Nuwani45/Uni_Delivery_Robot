import { BrandMark } from "../components/BrandMark";

/* Shown to a signed-in person who cannot be given access to any portal.
 * variant "no-role": the account has no valid role in Firestore.
 * variant "error":   the role could not be checked (network, rules, etc.). */
const ERROR_HINTS = {
  "permission-denied":
    "Firestore rejected the request. Publish the security rules from docs/firestore.rules.",
  "app/timeout":
    "Firestore did not respond. Create the Firestore database in the Firebase console, and check your internet connection.",
  unavailable:
    "Firestore could not be reached. Check your internet connection and that the Firestore database exists.",
};

export function AccessScreen({ variant, user, error, onRetry, onLogout }) {
  const isError = variant === "error";
  const code = error?.code || "";

  return (
    <div className="auth-loading access-screen">
      <div className="access-card" role="alert">
        <BrandMark />
        <h1>{isError ? "We couldn't check your account" : "Your account isn't set up yet"}</h1>
        <p>
          {isError ? (
            <>
              UniDelivery couldn't load your account details. Check your
              connection and try again. If this keeps happening, contact an
              administrator.
            </>
          ) : (
            <>
              You're signed in as <strong>{user?.email}</strong>, but no
              UniDelivery role has been assigned to this account. Ask an
              administrator to assign one, then check again.
            </>
          )}
        </p>
        {isError && code && (
          <p className="access-detail">
            Details: <code>{code}</code>. {ERROR_HINTS[code] || "See the browser console for more information."}
          </p>
        )}
        <div className="access-actions">
          <button className="primary-button" onClick={onRetry}>
            {isError ? "Try again" : "Check again"}
          </button>
          <button className="secondary-button" onClick={onLogout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
