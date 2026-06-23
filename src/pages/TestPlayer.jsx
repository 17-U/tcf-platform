import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getModule } from "../lib/questions.js";
import { saveAttempt } from "../lib/store.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { speak, stopSpeaking, speechSupported } from "../lib/tts.js";

function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function TestPlayer() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = getModule(examId);
  const { user } = useAuth();

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [left, setLeft] = useState((exam?.minutes || 10) * 60);
  const submitted = useRef(false);

  // Audio (compréhension orale)
  const hasAudio = !!exam?.audioScript;
  const [playing, setPlaying] = useState(false);
  const [replays, setReplays] = useState(0);
  const maxReplays = exam?.maxReplays ?? 2;

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (done || !exam) return;
    if (left <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, done]);

  if (!exam) {
    return <div className="empty">Test introuvable. <a href="/tests">Retour</a></div>;
  }

  function playAudio() {
    if (replays >= maxReplays || playing) return;
    setPlaying(true);
    setReplays((r) => r + 1);
    speak(exam.audioScript, exam.lang || "fr-FR", { onEnd: () => setPlaying(false) });
  }

  const total = exam.questions.length;
  const q = exam.questions[idx];
  const answered = Object.keys(answers).length;

  function choose(choiceIndex) {
    setAnswers({ ...answers, [idx]: choiceIndex });
  }

  async function finish() {
    if (submitted.current) return;
    submitted.current = true;
    stopSpeaking();
    let score = 0;
    exam.questions.forEach((item, i) => {
      if (answers[i] === item.answer) score++;
    });
    const percent = Math.round((score / total) * 100);
    setResult({ score, percent });
    setDone(true);
    try { await saveAttempt({ userId: user.id, examId: exam.id, examName: exam.name, score, total, percent }); } catch (e) { console.error(e); }
  }

  if (done && result) {
    const pass = result.percent >= 60;
    return (
      <div className="login-wrap">
        <div className="card" style={{ maxWidth: 560, width: "100%", padding: 38 }}>
          <span className="eyebrow">{exam.name} · Résultat</span>
          <div className="result-row" style={{ marginTop: 22 }}>
            <div className={"stamp " + (pass ? "pass" : "fail")}>
              <div>
                <div className="pct">{result.percent}%</div>
                <div className="lbl">{pass ? "Réussi" : "À revoir"}</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <h2 style={{ fontSize: 26 }}>{result.score} / {total}</h2>
              <p className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
                {pass
                  ? "Bon travail ! Recommencez pour viser encore plus haut."
                  : "Pas encore l'objectif. Revoyez les points faibles et retentez le test librement."}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button className="btn" onClick={() => navigate("/tests")}>Autres tests</button>
            <button className="btn ghost" onClick={() => navigate("/mes-resultats")}>Mes résultats</button>
          </div>
        </div>
      </div>
    );
  }

  const warn = left <= 30;
  return (
    <div style={{ minHeight: "100vh", padding: "32px 24px" }}>
      <div className="exam-paper">
        <div className="paper-head">
          <div>
            <span className="eyebrow">{exam.name}</span>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              Question {idx + 1} sur {total} · {answered} répondue{answered > 1 ? "s" : ""}
            </div>
          </div>
          <div className={"timer" + (warn ? " warn" : "")}>{fmt(left)}</div>
        </div>

        <div className="progress-bar"><span style={{ width: `${((idx + 1) / total) * 100}%` }} /></div>

        {hasAudio && (
          <div className="card audio-box">
            <div>
              <div className="eyebrow">Document audio</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {speechSupported()
                  ? `Écoutes restantes : ${maxReplays - replays} sur ${maxReplays}`
                  : "Audio non disponible sur ce navigateur — le texte est affiché ci-dessous."}
              </div>
            </div>
            {speechSupported() ? (
              <button className="btn accent" onClick={playAudio} disabled={playing || replays >= maxReplays}>
                {playing ? "▶ Lecture…" : replays >= maxReplays ? "Écoutes épuisées" : "▶ Écouter"}
              </button>
            ) : (
              <details className="fallback"><summary>Afficher le texte</summary><p>{exam.audioScript}</p></details>
            )}
          </div>
        )}

        <div className="card qcard">
          <div className="qnum">Q{String(idx + 1).padStart(2, "0")}</div>
          <div className="qtext">{q.q}</div>
          {q.choices.map((choice, i) => {
            const selected = answers[idx] === i;
            return (
              <button key={i} className={"choice" + (selected ? " selected" : "")} onClick={() => choose(i)}>
                <span className="key">{String.fromCharCode(65 + i)}</span>
                {choice}
              </button>
            );
          })}
        </div>

        <div className="paper-foot">
          <button className="btn ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Précédent</button>
          {idx < total - 1 ? (
            <button className="btn" onClick={() => setIdx(idx + 1)}>Suivant →</button>
          ) : (
            <button className="btn accent" onClick={finish}>Terminer le test</button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button className="btn ghost sm" onClick={() => { stopSpeaking(); navigate("/tests"); }}>Quitter sans enregistrer</button>
        </div>
      </div>
    </div>
  );
}
