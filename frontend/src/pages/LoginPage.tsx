import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

type LoginPageProps = { onLogin: () => void };

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("admin@hotelos.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const configuredPassword = localStorage.getItem("hotelos_demo_password") || "admin123";
    const configuredEmail = localStorage.getItem("hotelos_demo_email") || "admin@hotelos.com";
    if (email.trim().toLowerCase() !== configuredEmail.toLowerCase() || password !== configuredPassword) {
      setError(`Invalid credentials. Demo account: ${configuredEmail}`);
      return;
    }
    setError("");
    sessionStorage.setItem("hotelos_authenticated", "true");
    if (remember) localStorage.setItem("hotelos_remember", "true");
    onLogin();
  };

  return (
    <main className="login-page">
      <div className="login-ambient login-ambient-one" />
      <div className="login-ambient login-ambient-two" />
      <div className="login-orbit" aria-hidden="true"><span /><span /><span /></div>
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">H</div>
          <div><strong>HotelOS</strong><span>SMART HOTEL MANAGEMENT</span></div>
        </div>
        <div className="login-heading">
          <span className="eyebrow">SECURE ACCESS</span>
          <h1>Welcome back.</h1>
          <p>Sign in to manage hotel operations, billing and restaurant sales.</p>
        </div>
        <form onSubmit={submit} className="login-form">
          <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
          <label>Password
            <span className="password-field">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </span>
          </label>
          <div className="login-options"><label className="check-row"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label><span>Demo mode</span></div>
          {error && <div className="login-error">{error}</div>}
          <button className="primary-button login-submit" type="submit"><LockKeyhole size={16} /> Sign in <ArrowRight size={16} /></button>
        </form>
        <div className="demo-credentials"><ShieldCheck size={15} /><div><strong>Demo credentials</strong><span>admin@hotelos.com · admin123 (default)</span></div></div>
        <small className="login-note">Portfolio authentication layer. Connect this form to production identity services before real deployment.</small>
      </section>
    </main>
  );
}
