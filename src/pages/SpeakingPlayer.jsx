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

export default function SpeakingPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mod = getModule(id);
  const { user } = useAuth();

  // phases : "prep" -> "record" -> "review" -> "sent"
  const [phase, setPhase] = useState("prep");
  const [left, setLeft] = useState(mod?.prepSeconds || 60);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Minuteur des phases prep / record
  useEffect(() => {
    if (phase !== "prep" && phase !== "record") return;
    if (left <= 0) {
      if (phase === "prep") startRecording();
      else stopRecording();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, phase]);

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }, []);

  if (!mod) return <div className="empty">Module introuvable. <a href="/tests">Retour</a></div>;

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setPhase("review");
      };
      recorderRef.current = rec;
      rec.start();
      setLeft(mod.speakSeconds || 120);
      setPhase("record");
    } catch {
      setError("Micro non autorisé. Vous pouvez quand même envoyer : le formateur évaluera en séance.");
      setPhase("review");
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      setPhase("review");
    }
  }

  function retake() {
    setAudioUrl(null);
    setAudioBlob(null);
    setLeft(mod.prepSeconds || 60);
    setPhase("prep");
  }

  async function submit() {
    setBusy(true);
    const note = "Épreuve orale passée — à évaluer en séance (audio non transmis).";
    try {
      await saveSubmission({
        userId: user.id,
        moduleId: mod.id,
        moduleName: mod.name,
        type: "oral",
        content: note,
      });
      setPhase("sent");
    } catch (e) {
      console.error(e);
      setBusy(false);
      alert("Envoi impossible. Vérifiez votre connexion et réessayez.");
    }
  }

  if (phase === "sent") {
    return (
      <div className="login-wrap">
        <div className="card" style={{ maxWidth: 520, width: "100%", padding: 38, textAlign: "center" }}>
          <div className="stamp pass" style={{ margin: "0 auto 22px", transform: "rotate(-6deg)" }}>
            <div><div className="pct" style={{ fontSize: 30 }}>✓</div><div className="lbl">Envoyé</div></div>
          </div>
          <h2 style={{ fontSize: 24 }}>Épreuve transmise</h2>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
            C'est noté : votre formateur sait que vous avez passé cette épreuve. Il l'évaluera
            en séance, et la note apparaîtra dans « Mes résultats ».
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
            <button className="btn" onClick={() => navigate("/tests")}>Autres tests</button>
            <button className="btn ghost" onClick={() => navigate("/mes-resultats")}>Mes résultats</button>
          </div>
        </div>
      </div>
    );
  }

  const warn = left <= 10;
  return (
    <div style={{ minHeight: "100vh", padding: "32px 24px" }}>
      <div className="exam-paper">
        <div className="paper-head">
          <div>
            <span className="eyebrow">{mod.name}</span>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {phase === "prep" && "Préparation"}
              {phase === "record" && "À vous de parler"}
              {phase === "review" && "Réécoute"}
            </div>
          </div>
          {(phase === "prep" || phase === "record") && (
            <div className={"timer" + (warn ? " warn" : "")}>{fmt(left)}</div>
          )}
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 18, borderLeft: "5px solid var(--accent)" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Sujet</div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{mod.prompt}</p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="card" style={{ padding: 26, textAlign: "center" }}>
          {phase === "prep" && (
            <>
              <p className="muted" style={{ marginTop: 0 }}>
                Préparez vos idées. L'enregistrement démarrera automatiquement à la fin du temps,
                ou cliquez quand vous êtes prêt(e).
              </p>
              <button className="btn accent" onClick={startRecording}>Je suis prêt(e) — démarrer</button>
            </>
          )}

          {phase === "record" && (
            <>
              <div className="rec-dot" />
              <p style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: "14px 0" }}>
                Enregistrement en cours…
              </p>
              <button className="btn" onClick={stopRecording}>■ Arrêter</button>
            </>
          )}

          {phase === "review" && (
            <>
              {audioUrl ? (
                <>
                  <p className="muted" style={{ marginTop: 0 }}>
                    Réécoutez-vous pour vous auto-évaluer. L'enregistrement reste sur votre appareil ;
                    le formateur notera votre prise de parole en séance.
                  </p>
                  <audio controls src={audioUrl} style={{ width: "100%", margin: "8px 0 18px" }} />
                </>
              ) : (
                <p className="muted" style={{ marginTop: 0 }}>
                  Aucun enregistrement. Vous pouvez réessayer ou envoyer pour une évaluation en séance.
                </p>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button className="btn ghost" onClick={retake}>Refaire</button>
                <button className="btn accent" onClick={submit} disabled={busy}>{busy ? "Envoi…" : "Envoyer au formateur"}</button>
              </div>
            </>
          )}

          <div style={{ marginTop: 18 }}>
            <button className="btn ghost sm" onClick={() => navigate("/tests")}>Quitter</button>
          </div>
        </div>
      </div>
    </div>
  );
}
