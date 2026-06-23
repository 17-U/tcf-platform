import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUser, updateUser, deleteUser, getAttemptsByUser, getSubmissionsByUser } from "../lib/store.js";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [u, a, s] = await Promise.all([getUser(id), getAttemptsByUser(id), getSubmissionsByUser(id)]);
      if (!active) return;
      setUser(u);
      setAttempts(a);
      setSubs(s);
      setNote(u?.note || "");
      setTarget(u?.target || "");
      setLoading(false);
    })();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="empty">Chargement…</div>;
  if (!user) return <div className="empty">Candidat introuvable. <Link to="/utilisateurs">Retour</Link></div>;

  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length) : null;

  async function save() {
    const updated = await updateUser(id, { note, target });
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function remove() {
    if (confirm(`Supprimer définitivement ${user.name} et ses données ?`)) {
      await deleteUser(id);
      navigate("/utilisateurs");
    }
  }

  return (
    <>
      <Link to="/utilisateurs" className="eyebrow" style={{ display: "inline-block", marginBottom: 16 }}>← Tous les candidats</Link>

      <div className="card" style={{ padding: 26, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 24 }}>{user.name}</h2>
            <p className="muted" style={{ margin: "6px 0" }}>{user.email}</p>
            <span className="badge">{user.exam}</span>{" "}
            {avg !== null && <span className={"badge " + (avg >= 60 ? "green" : "accent")}>Moyenne {avg}%</span>}
          </div>
          <button className="btn danger" onClick={remove}>Supprimer le candidat</button>
        </div>
      </div>

      <div className="card" style={{ padding: 26, marginBottom: 22 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Suivi & consignes</h3>
        <div className="field"><label>Objectif</label><input className="input" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="ex : NCLC 7 (C1)" /></div>
        <div className="field"><label>Instructions personnalisées</label><textarea className="input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ce que le candidat doit travailler en priorité…" /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn" onClick={save}>Enregistrer</button>
          {saved && <span className="badge green">Enregistré ✓</span>}
        </div>
      </div>

      <div className="section-head"><h2>Productions écrites & orales</h2></div>
      <div className="card" style={{ marginBottom: 22 }}>
        {subs.length === 0 ? (
          <div className="empty">Aucune production envoyée.</div>
        ) : (
          <table className="table">
            <thead><tr><th>Date</th><th>Épreuve</th><th>Type</th><th>Statut</th></tr></thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="muted">{new Date(s.submittedAt).toLocaleDateString("fr-FR")}</td>
                  <td>{s.moduleName}</td>
                  <td><span className="badge">{s.type === "ecrit" ? "Écrit" : "Oral"}</span></td>
                  <td>{s.status === "corrige" ? <span className="badge green">{s.grade}</span> : <Link to="/corrections" className="badge accent">À corriger →</Link>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-head"><h2>Historique des QCM</h2></div>
      <div className="card">
        {attempts.length === 0 ? (
          <div className="empty">Ce candidat n'a pas encore passé de QCM.</div>
        ) : (
          <table className="table">
            <thead><tr><th>Date</th><th>Examen</th><th>Résultat</th><th>Score</th></tr></thead>
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
    </>
  );
}
