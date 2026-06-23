// Lecture audio via la synthèse vocale du navigateur (Web Speech API).
// Aucun fichier son à héberger : le texte du dialogue est lu à voix haute.

export function speak(text, lang = "fr-FR", { onEnd } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return null;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  // Choisit une voix correspondant à la langue si disponible.
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang && v.lang.startsWith(lang.slice(0, 2)));
  if (match) u.voice = match;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
  return u;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function speechSupported() {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}
