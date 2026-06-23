import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, getAttempts, addUser } from "../lib/store.js";

function initials(name) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    const [u, a] = await Promise.all([getUsers(), getAttempts()]);
    setUsers(u);
    setAttempts(a);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const candidates = users.filter((u) => u.role === "candidate");
  const attemptsOf = (id) => attempts.filter((a) => a.userId === id);
  const avgOf = (id) => {
    const list = attemptsOf(id);
    if (!list.length) return null;
    return Math.round(list.reduce((s, a) => s + a.percent, 0) / list.length);
  };

  async function handleAdd(data, setErr) {
    try {
      await addUser(data);
      setOpen(false);
      await load();
    } catch (e) {
      const code = e?.code || "";
      if (code.includes("email-already-in-use")) setErr("Cet e-mail est déjà utilisé.");
      else if (code.includes("weak-password")) setErr("Mot de passe trop court (6 caractères min.).");
      else if (code.includes("invalid-email")) setErr("E-mail invalide.");
      else setErr("Création impossible. Vérifiez la configuration Firebase.");
    }
  }

  if (loading) return <div className="empty">Chargement…</div>;

  return (
    <>
      <div className="stat-grid">
        <div className="card stat"><div className="k">Candidats</div><div className="v">{candidates.length}</div></div>
        <div className="card stat"><div className="k">Tests passés</div><div className="v">{attempts.length}</div></div>
        <div className="card stat">
          <div className="k">Score moyen</div>
          <div className="v">
            {attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length) + "%" : "—"}
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>Candidats inscrits</h2>
        <button className="btn accent" onClick={() => setOpen(true)}>+ Ajouter un candidat</button>
      </div>

      <div className="card">
        {candidates.length === 0 ? (
          <div className="empty">Aucun candidat pour l'instant. Ajoutez-en un pour commencer.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Candidat</th><th>Examen visé</th><th>Objectif</th><th>Tests</th><th>Moyenne</th></tr>
            </thead>
            <tbody>
              {candidates.map((u) => {
                const avg = avgOf(u.id);
                return (
                  <tr key={u.id} className="clickable" onClick={() => navigate(`/utilisateurs/${u.id}`)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar">{initials(u.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge">{u.exam}</span></td>
                    <td className="muted">{u.target || "—"}</td>
                    <td className="mono">{attemptsOf(u.id).length}</td>
                    <td>{avg === null ? <span className="muted">—</span> : <span className={"badge " + (avg >= 60 ? "green" : "accent")}>{avg}%</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {open && <AddUserModal onClose={() => setOpen(false)} onAdd={handleAdd} />}
    </>
  );
}

function AddUserModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", exam: "TCF Canada", target: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setErr("");
    setBusy(true);
    await onAdd(form, setErr);
    setBusy(false);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <h2>Nouveau candidat</h2>
        {err && <div className="error">{err}</div>}
        <div className="field">
          <label>Nom complet</label>
          <input className="input" value={form.name} onChange={set("name")} autoFocus />
        </div>
        <div className="row2">
          <div className="field"><label>E-mail (identifiant)</label><input className="input" value={form.email} onChange={set("email")} /></div>
          <div className="field"><label>Mot de passe</label><input className="input" value={form.password} onChange={set("password")} placeholder="6 caractères min." /></div>
        </div>
        <div className="row2">
          <div className="field">
            <label>Examen visé</label>
            <select className="select" value={form.exam} onChange={set("exam")}>
              <option>TCF Canada</option><option>TEF Canada</option><option>IELTS</option>
            </select>
          </div>
          <div className="field"><label>Objectif</label><input className="input" value={form.target} onChange={set("target")} placeholder="ex : NCLC 7" /></div>
        </div>
        <div className="field">
          <label>Consigne / suivi</label>
          <textarea className="input" rows={3} value={form.note} onChange={set("note")} placeholder="Instructions personnalisées pour ce candidat" />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn accent" onClick={submit} disabled={busy || !form.name || !form.email || !form.password}>
            {busy ? "Création…" : "Créer le candidat"}
          </button>
        </div>
      </div>
    </div>
  );
}
