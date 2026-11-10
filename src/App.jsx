import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { logOut } from "./auth/authService";
import { useUserRole } from "./auth/useUserRole";
import { LoginScreen } from "./auth/LoginScreen";
import { AccessScreen } from "./auth/AccessScreen";
import { Workspace } from "./Workspace";
import "./App.css";
import "./styles/auth.css";
import "./styles/responsive.css";
import "./styles/customer.css";

/* ==========================================================================
   APP ROOT
   1. Wait for Firebase to report whether someone is signed in.
   2. Not signed in  -> sign in / create account screen.
   3. Signed in      -> look up the role in Firestore (users/{uid}).
   4. Role missing   -> "account not set up" screen (no portal access).
   5. Valid role     -> the portal(s) that role may use (see Workspace.jsx).
   ========================================================================== */
function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState("");
  const { status, role, error, retry } = useUserRole(user);

  // Check whether a Firebase user is signed in.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Wait until Firebase checks the authentication state.
  if (authLoading) {
    return <div className="auth-loading">Loading UniDelivery…</div>;
  }

  // Show the sign-in screen if nobody is signed in.
  if (!user) {
    return <LoginScreen notice={authNotice} onNotice={setAuthNotice} />;
  }

  if (status === "loading" || status === "idle") {
    return <div className="auth-loading">Loading your account…</div>;
  }

  if (status === "error") {
    return <AccessScreen variant="error" user={user} error={error} onRetry={retry} onLogout={logOut} />;
  }

  if (!role) {
    return <AccessScreen variant="no-role" user={user} onRetry={retry} onLogout={logOut} />;
  }

  return <Workspace key={user.uid} user={user} role={role} />;
}

export default App;
