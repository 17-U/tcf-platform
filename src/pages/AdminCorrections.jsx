import { useState, useEffect } from "react";
import { getPendingSubmissions, getSubmissions, gradeSubmission, getUsers } from "../lib/store.js";

function Reader({ sub }) {
  if (sub.type === "ecrit") {
    return (
      <div className="card" style={{ padding: 18, background: "var(--paper)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
        {sub.content || "(copie vide)"}
      </div>
    );
  }
  return (
    <div className="card" style={{ padding: 18, background: "var(--paper)" }}>
      <p className="muted" style={{ margin: 0 }}>
        🎤 {sub.content || "Épreuve orale passée — à évaluer en séance."}
      </p>
    </div>
  );
}

function GradeCard({ sub, nameOf, onGraded }) {
  const [grade, setGrade] = useState(sub.grade ?? "");
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await gradeSubmission(sub.id, { grade, feedback });
    setBusy(false);
    onGraded();
  }

  return (
    <div className="card" style={{ padding: 24, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <div>
          <span className="eyebrow">{sub.type === "ecrit" ? "Production écrite" : "Expression orale"}</span>
          <h3 style={{ fontSize: 18, marginTop: 4 }}>{nameOf(sub.userId)}</h3>
          <div className="muted" style={{ fontSize: 13 }}>{sub.moduleName}</div>
        </div>
        <div className="muted" style={{ fontSize: 12, textAlign: "right" }}>
          {new Date(sub.submittedAt).toLocaleString("fr-FR")}
          {sub.wordCount ? <><br />{sub.wordCount} mots</> : null}
        </div>
      </div>

      <Reader sub={sub} />

      <div className="field" style={{ marginTop: 16, maxWidth: 280 }}>
        <label>Note (ex : 14/20 ou NCLC 7)</label>
        <input className="input" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Note attribuée" />
      </div>
      <div className="field">
        <label>Commentaire pour le candidat</label>
        <textarea className="input" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Points forts, points à travailler…" />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn accent" onClick={save} disabled={busy || !grade}>{busy ? "Enregistrement…" : "Valider la correction"}</button>
      </div>
    </div>
  );
}

export default function AdminCorrections() {
  const [pending, setPending] = useState([]);
  const [graded, setGraded] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const [pend, all, users] = await Promise.all([getPendingSubmissions(), getSubmissions(), getUsers()]);
    const map = {};
    users.forEach((u) => { map[u.id] = u.name; });
    setNames(map);
    setPending(pend);
    setGraded(all.filter((s) => s.status === "corrige").sort((a, b) => b.gradedAt - a.gradedAt));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const nameOf = (uid) => names[uid] || "Candidat supprimé";

  if (loading) return <div className="empty">Chargement…</div>;

  return (
    <>
      <div className="section-head">
        <h2>À corriger</h2>
        <span className="badge accent">{pending.length} en attente</span>
      </div>

      {pending.length === 0 ? (
        <div className="card"><div className="empty">Aucune copie en attente. Tout est corrigé 🎉</div></div>
      ) : (
        pending.map((s) => <GradeCard key={s.id} sub={s} nameOf={nameOf} onGraded={load} />)
      )}

      {graded.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 32 }}><h2>Déjà corrigées</h2></div>
          <div className="card">
            <table className="table">
              <thead><tr><th>Candidat</th><th>Épreuve</th><th>Note</th><th>Corrigée le</th></tr></thead>
              <tbody>
                {graded.map((s) => (
                  <tr key={s.id}>
                    <td>{nameOf(s.userId)}</td>
                    <td>{s.moduleName}</td>
                    <td><span className="badge green">{s.grade}</span></td>
                    <td className="muted">{new Date(s.gradedAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
