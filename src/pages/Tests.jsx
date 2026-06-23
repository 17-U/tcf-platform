import { useNavigate } from "react-router-dom";
import { MODULES } from "../lib/questions.js";
import { useAuth } from "../lib/AuthContext.jsx";

const TYPE_LABEL = {
  qcm: "Auto-corrigé",
  ecrit: "Corrigé par le formateur",
  oral: "Corrigé par le formateur",
};

function routeFor(m) {
  if (m.type === "ecrit") return `/tests/ecrit/${m.id}`;
  if (m.type === "oral") return `/tests/oral/${m.id}`;
  return `/tests/qcm/${m.id}`;
}

function meta(m) {
  if (m.type === "qcm") {
    const audio = m.audioScript ? "écoute + " : "";
    return `${audio}${m.questions.length} questions · ${m.minutes} min`;
  }
  if (m.type === "ecrit") return `${m.minWords} mots min · ${m.minutes} min`;
  if (m.type === "oral") return `${m.prepSeconds}s de prépa · ${m.speakSeconds}s de parole`;
  return "";
}

function Group({ title, modules, navigate }) {
  if (!modules.length) return null;
  return (
    <section style={{ marginBottom: 30 }}>
      <div className="section-head"><h2>{title}</h2></div>
      <div className="exam-grid">
        {modules.map((m) => (
          <div key={m.id} className="card exam-card">
            <span className="bar" style={{ background: m.color }} />
            <span className="eyebrow">{meta(m)}</span>
            <h3>{m.name}</h3>
            <p className="meta">{m.skill}</p>
            <span className={"badge " + (m.type === "qcm" ? "green" : "")} style={{ alignSelf: "flex-start" }}>
              {TYPE_LABEL[m.type]}
            </span>
            <button className="btn" style={{ marginTop: 12, alignSelf: "flex-start" }} onClick={() => navigate(routeFor(m))}>
              Commencer
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Tests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCandidate = user?.role === "candidate";

  const ecrit = MODULES.filter((m) => m.category === "Écrit");
  const oral = MODULES.filter((m) => m.category === "Oral");

  return (
    <>
      {isCandidate && user.note && (
        <div className="card" style={{ padding: 20, marginBottom: 24, borderLeft: "5px solid var(--accent)" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Consigne de votre formateur</div>
          <p style={{ margin: 0 }}>{user.note}</p>
        </div>
      )}

      <p className="muted" style={{ fontSize: 13, marginBottom: 22 }}>
        Passez les tests autant de fois que vous voulez. Les QCM sont corrigés immédiatement ;
        les productions écrites et orales sont corrigées par votre formateur.
      </p>

      <Group title="Épreuves écrites" modules={ecrit} navigate={navigate} />
      <Group title="Épreuves orales" modules={oral} navigate={navigate} />
    </>
  );
}
