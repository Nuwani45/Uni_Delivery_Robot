import { useState } from "react";
import { BrandMark, BrandLockup } from "../components/BrandMark";
import { Icon } from "../components/Icon";
import { describeAuthError, registerCustomer, signIn } from "./authService";

const MIN_PASSWORD_LENGTH = 8;

function PasswordField({ id, label, value, onChange, placeholder, autoComplete, hint }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          id={id}
          className="text-input"
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <Icon g={visible ? "eyeOff" : "eye"} />
        </button>
      </div>
      {hint && <p className="auth-hint">{hint}</p>}
    </div>
  );
}

/* Entry point of the application. Handles both sign-in and customer
 * registration. Which portal a person sees afterwards is decided by their
 * role (see App.jsx), not by anything on this screen. */
export function LoginScreen({ notice = "", onNotice = () => {} }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";
  const message = error || notice;

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setError("");
    onNotice("");
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    onNotice("");

    if (isSignup) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
        return;
      }
      if (password !== confirm) {
        setError("The two passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignup) {
        await registerCustomer({ name, email, password });
      } else {
        await signIn(email, password);
      }
    } catch (caught) {
      console.error(isSignup ? "Sign-up error:" : "Login error:", caught);
      const text = describeAuthError(caught, mode);
      setError(text);
      onNotice(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <BrandLockup />
        <svg className="portal-art" viewBox="0 0 600 300" aria-hidden="true">
          <path d="M30 150 H570 M190 150 V80 M190 150 V220 M410 150 V80 M410 150 V220" />
          <circle cx="190" cy="80" r="9" />
          <circle cx="190" cy="220" r="9" />
          <circle cx="410" cy="80" r="9" />
          <circle cx="410" cy="220" r="9" />
          <rect x="30" y="136" width="44" height="28" rx="6" />
        </svg>
        <div className="auth-pitch">
          <h2>Indoor delivery, from request to handover.</h2>
          <p>
            One account for the UniDelivery campus service. Students and staff
            can request deliveries, while the operations and maintenance teams
            manage the robot.
          </p>
        </div>
      </aside>

      <main className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-brand-sm">
            <BrandMark />
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <button
              type="button"
              role="tab"
              id="tab-signin"
              aria-selected={!isSignup}
              className={!isSignup ? "auth-tab active" : "auth-tab"}
              onClick={() => switchMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              id="tab-signup"
              aria-selected={isSignup}
              className={isSignup ? "auth-tab active" : "auth-tab"}
              onClick={() => switchMode("signup")}
            >
              Create account
            </button>
          </div>

          <div>
            <h1>{isSignup ? "Create your account" : "Sign in"}</h1>
            <p className="auth-sub">
              {isSignup
                ? "Register as a customer to use the UniDelivery service."
                : "Use your UniDelivery account to continue."}
            </p>
          </div>

          {isSignup && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                className="text-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              className="text-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@university.edu"
              required
              autoComplete={isSignup ? "email" : "username"}
            />
          </div>

          <PasswordField
            id="auth-password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isSignup ? "Create a password" : "Enter your password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            hint={isSignup ? `At least ${MIN_PASSWORD_LENGTH} characters.` : ""}
          />

          {isSignup && (
            <PasswordField
              id="auth-confirm"
              label="Confirm password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          )}

          {message && <div className="form-error" role="alert">{message}</div>}

          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {loading
              ? isSignup ? "Creating account…" : "Signing in…"
              : isSignup ? "Create account" : "Sign in"}
          </button>

          <p className="auth-foot">
            {isSignup
              ? "New accounts are customer accounts. Staff accounts are set up by an administrator."
              : "Staff and customers use the same sign-in. You'll be taken to the right portal automatically."}
          </p>
        </form>
      </main>
    </div>
  );
}
