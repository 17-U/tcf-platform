import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === "admin" ? "/utilisateurs" : "/tests", { replace: true });
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
        setError("E-mail ou mot de passe incorrect.");
      } else if (code.includes("too-many-requests")) {
        setError("Trop de tentatives. Réessayez dans quelques minutes.");
      } else {
        setError("Connexion impossible. Vérifiez votre configuration Firebase.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div className="logo">
          <span className="mark">
            <svg width="20" height="20" viewBox="0 0 32 32"><path d="M16 4l1.7 4.4 4.2-1.3-1.7 4.1 3.8 1.7-3.6 1.9 2.3 4-4.3-1 .3 4.5L16 25l-2.7-1.4.3-4.5-4.3 1 2.3-4-3.6-1.9 3.8-1.7L4 8.5l4.2 1.3L16 4z" fill="#fff" /></svg>
          </span>
          <span className="eyebrow">Centre Réussite</span>
        </div>
        <h1>Connexion à la plateforme</h1>
        <p className="sub">Préparez votre TCF, TEF ou IELTS et passez vos tests en ligne.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>E-mail</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@example.com" autoFocus />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                style={{ paddingRight: 70 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--slate)",
                  fontSize: 13, fontWeight: 600, padding: "6px 8px",
                }}
              >
                {showPw ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
          <button className="btn" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="hint">
          Les comptes candidats sont créés par l'administrateur depuis l'espace « Utilisateurs ».
        </p>
      </div>
    </div>
  );
}