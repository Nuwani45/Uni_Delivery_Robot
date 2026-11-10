import { useCallback, useEffect, useState } from "react";
import { getUserRole } from "./authService";

/* Loads the signed-in user's role from Firestore.
 * status: "idle" (nobody signed in) | "loading" | "ready" | "error"
 * When status is "error", error holds the Firebase error (see error.code).
 * When status is "ready", role is a valid role string or null (no role set). */
export function useUserRole(user) {
  const uid = user?.uid ?? null;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, role: null, error: null });

  const key = uid ? `${uid}:${attempt}` : null;

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;

    getUserRole(uid)
      .then((role) => {
        if (!cancelled) setResult({ key, role, error: null });
      })
      .catch((error) => {
        console.error("Could not load the user role:", error);
        if (!cancelled) setResult({ key, role: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [key, uid]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  if (!key) return { status: "idle", role: null, retry };
  if (result.key !== key) return { status: "loading", role: null, retry };
  if (result.error) return { status: "error", role: null, error: result.error, retry };
  return { status: "ready", role: result.role, retry };
}
