import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getModule } from "../lib/questions.js";
import { saveSubmission } from "../lib/store.js";
import { useAuth } from "../lib/AuthContext.jsx";

function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function WritingPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mod = getModule(id);
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [left, setLeft] = useState((mod?.minutes || 20) * 60);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    if (sent || !mod) return;
    if (left <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, sent]);

  if (!mod) return <div className="empty">Module introuvable. <a href="/tests">Retour</a></div>;

  const words = countWords(text);
  const enough = words >= (mod.minWords || 0);

  async function submit() {
    if (submitted.current) return;
    submitted.current = true;
    setBusy(true);
    try {
      await saveSubmission({
        userId: user.id,
        moduleId: mod.id,
        moduleName: mod.name,
        type: "ecrit",
        content: text,
        wordCount: words,
      });
      setSent(true);
    } catch (e) {
      console.error(e);
      submitted.current = false;
      setBusy(false);
      alert("Envoi impossible. Vérifiez votre connexion et réessayez.");
    }
  }

  if (sent) {
    return (
      <div className="login-wrap">
        <div className="card" style={{ maxWidth: 520, width: "100%", padding: 38, textAlign: "center" }}>
          <div className="stamp pass" style={{ margin: "0 auto 22px", transform: "rotate(-6deg)" }}>
            <div><div className="pct" style={{ fontSize: 30 }}>✓</div><div className="lbl">Envoyé</div></div>
          </div>
          <h2 style={{ fontSize: 24 }}>Copie transmise</h2>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
            Votre production écrite ({words} mots) a été envoyée à votre formateur.
            Vous verrez la correction et la note dans « Mes résultats ».
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
            <button className="btn" onClick={() => navigate("/tests")}>Autres tests</button>
            <button className="btn ghost" onClick={() => navigate("/mes-resultats")}>Mes résultats</button>
          </div>
        </div>
      </div>
    );
  }

  const warn = left <= 60;
  return (
    <div style={{ minHeight: "100vh", padding: "32px 24px" }}>
      <div className="exam-paper">
        <div className="paper-head">
          <div>
            <span className="eyebrow">{mod.name}</span>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Production écrite</div>
          </div>
          <div className={"timer" + (warn ? " warn" : "")}>{fmt(left)}</div>
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 18, borderLeft: "5px solid var(--accent)" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Sujet</div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{mod.prompt}</p>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <textarea
            className="input"
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Rédigez votre réponse ici…"
            style={{ resize: "vertical", lineHeight: 1.6 }}
            autoFocus
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span className={"badge " + (enough ? "green" : "accent")}>
              {words} mot{words > 1 ? "s" : ""} / {mod.minWords} min.
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn ghost" onClick={() => navigate("/tests")}>Quitter</button>
              <button className="btn accent" onClick={submit} disabled={busy || words === 0}>{busy ? "Envoi…" : "Envoyer la copie"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
