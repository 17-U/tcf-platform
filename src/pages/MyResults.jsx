import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { getAttemptsByUser, getSubmissionsByUser } from "../lib/store.js";

export default function MyResults() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [a, s] = await Promise.all([getAttemptsByUser(user.id), getSubmissionsByUser(user.id)]);
      if (!active) return;
      setAttempts(a);
      setSubs(s);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user.id]);

  if (loading) return <div className="empty">Chargement…</div>;

  const best = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null;
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length) : null;

  return (
    <>
      <div className="stat-grid">
        <div className="card stat"><div className="k">QCM passés</div><div className="v">{attempts.length}</div></div>
        <div className="card stat"><div className="k">Meilleur score</div><div className="v">{best !== null ? best + "%" : "—"}</div></div>
        <div className="card stat"><div className="k">Moyenne</div><div className="v">{avg !== null ? avg + "%" : "—"}</div></div>
      </div>

      <div className="section-head"><h2>QCM auto-corrigés</h2></div>
      <div className="card" style={{ marginBottom: 30 }}>
        {attempts.length === 0 ? (
          <div className="empty">Pas encore de QCM passé.<br /><Link to="/tests" className="btn" style={{ marginTop: 14 }}>Commencer un test</Link></div>
        ) : (
          <table className="table">
            <thead><tr><th>Date</th><th>Épreuve</th><th>Score</th><th>Résultat</th></tr></thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="muted">{new Date(a.finishedAt).toLocaleString("fr-FR")}</td>
                  <td>{a.examName}</td>
                  <td className="mono">{a.score}/{a.total}</td>
                  <td><span className={"badge " + (a.percent >= 60 ? "green" : "accent")}>{a.percent}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-head"><h2>Productions écrites & orales</h2></div>
      <div className="card">
        {subs.length === 0 ? (
          <div className="empty">Aucune production envoyée pour l'instant.</div>
        ) : (
          subs.map((s) => (
            <div key={s.id} style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span className="eyebrow">{s.type === "ecrit" ? "Écrit" : "Oral"}</span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{s.moduleName}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{new Date(s.submittedAt).toLocaleString("fr-FR")}</div>
                </div>
                {s.status === "corrige" ? <span className="badge green">Note : {s.grade}</span> : <span className="badge">En attente de correction</span>}
              </div>
              {s.status === "corrige" && s.feedback && (
                <div className="card" style={{ padding: 14, marginTop: 12, background: "var(--paper)" }}>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Commentaire du formateur</div>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{s.feedback}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
