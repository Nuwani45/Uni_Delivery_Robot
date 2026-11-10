import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { ROLES, normaliseRole } from "./roles";

/* While a new account is being registered, the role lookup must wait until the
 * customer profile document has been written; otherwise the app could read the
 * user document before it exists and wrongly show "access not set up". */
let registrationGate = null;

/* Firestore waits quietly (instead of failing) when the database does not
 * exist yet or the device is offline, so every Firestore call is given a time
 * limit. That way the person sees an error instead of an endless spinner. */
const FIRESTORE_TIMEOUT_MS = 12000;

function withTimeout(promise, ms = FIRESTORE_TIMEOUT_MS) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error("Firestore did not respond in time");
      error.code = "app/timeout";
      reject(error);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function logOut() {
  return signOut(auth);
}

/* Creates a Firebase account and its Firestore profile with the "customer"
 * role. Only the customer role can be self-assigned (enforced by the Firestore
 * security rules in docs/firestore.rules). Staff roles are set by an admin. */
export async function registerCustomer({ name, email, password }) {
  let release;
  registrationGate = new Promise((resolve) => {
    release = resolve;
  });

  try {
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);

    try {
      await withTimeout(
        setDoc(doc(db, "users", credential.user.uid), {
          role: ROLES.CUSTOMER,
          email: cleanEmail,
          displayName: cleanName,
          createdAt: serverTimestamp(),
        }),
      );
    } catch (profileError) {
      // Roll back so the person is not left with an account that has no role.
      try {
        await deleteUser(credential.user);
      } catch (rollbackError) {
        console.error("Could not roll back the new account:", rollbackError);
      }
      const error = new Error("profile-not-saved");
      error.code = "app/profile-not-saved";
      error.cause = profileError;
      throw error;
    }

    try {
      await updateProfile(credential.user, { displayName: cleanName });
    } catch (nameError) {
      // Not critical: the name is also stored in the Firestore profile.
      console.error("Could not set the display name:", nameError);
    }
    return credential.user;
  } finally {
    release();
    registrationGate = null;
  }
}

/* Reads the role for a user. Resolves to a valid role string, or null when the
 * profile document is missing or contains an unknown role. Rejects if
 * Firestore cannot be reached or the rules deny the read. */
export async function getUserRole(uid) {
  if (registrationGate) await registrationGate;
  const snapshot = await withTimeout(getDoc(doc(db, "users", uid)));
  if (!snapshot.exists()) return null;
  return normaliseRole(snapshot.data().role);
}

/* Maps a Firebase error to a message that is safe to show to the person. */
export function describeAuthError(error, mode = "signin") {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a stronger password with at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is not enabled for this project.";
    case "app/profile-not-saved":
      return "We couldn't finish creating your account, so nothing was saved. Please try again in a moment. If this keeps happening, check that Firestore is set up for this project.";
    default:
      return mode === "signup"
        ? "Unable to create the account. Please try again."
        : "Unable to sign in. Please try again.";
  }
}
