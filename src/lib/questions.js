// Modules d'examen de la plateforme.
// Chaque module a un "type" qui détermine comment il se passe et se corrige :
//   - "qcm"   : questions à choix multiples, corrigé automatiquement.
//               (peut inclure un audio -> compréhension orale)
//   - "ecrit" : production écrite, corrigée par le formateur.
//   - "oral"  : expression orale (enregistrement), corrigée par le formateur.
//
// "category" sert juste à regrouper l'affichage : "Écrit" ou "Oral".
// "lang" = langue de lecture de l'audio (fr-FR ou en-US).

export const MODULES = [
  // ---------- COMPRÉHENSION ÉCRITE (QCM auto-corrigé) ----------
  {
    id: "tcf-ce",
    type: "qcm",
    category: "Écrit",
    name: "TCF Canada — Compréhension écrite",
    skill: "Lexique, grammaire et structures",
    color: "#0b1f3a",
    minutes: 12,
    questions: [
      { q: "Choisissez la phrase correcte.", choices: ["Il faut que tu viennes demain.", "Il faut que tu viens demain.", "Il faut que tu venir demain.", "Il faut que tu viendras demain."], answer: 0 },
      { q: "« Bien qu'il ___ fatigué, il a continué. »", choices: ["est", "était", "soit", "sera"], answer: 2 },
      { q: "Synonyme de « rapidement » :", choices: ["lentement", "promptement", "rarement", "à peine"], answer: 1 },
      { q: "« Je m'attends ___ ce qu'il réussisse. »", choices: ["de", "à", "pour", "sur"], answer: 1 },
      { q: "Identifiez le registre soutenu.", choices: ["Y a un souci.", "C'est mort.", "Un problème est survenu.", "Ça craint."], answer: 2 },
      { q: "« Si j'avais su, je ___ autrement. »", choices: ["agirais", "aurais agi", "agissais", "agirai"], answer: 1 },
    ],
  },
  {
    id: "tef-ce",
    type: "qcm",
    category: "Écrit",
    name: "TEF Canada — Compréhension écrite",
    skill: "Lexique & compréhension",
    color: "#1f7a5a",
    minutes: 10,
    questions: [
      { q: "« Une démarche fastidieuse » est une démarche…", choices: ["rapide", "ennuyeuse et longue", "facile", "gratuite"], answer: 1 },
      { q: "« Il a réussi ___ ses efforts. »", choices: ["malgré", "grâce à", "à cause de", "sans"], answer: 1 },
      { q: "Contraire de « accroître » :", choices: ["augmenter", "diminuer", "maintenir", "doubler"], answer: 1 },
      { q: "« D'ores et déjà » signifie…", choices: ["plus tard", "jamais", "dès maintenant", "peut-être"], answer: 2 },
      { q: "« Prendre une décision » = …", choices: ["trancher", "flâner", "patienter", "hésiter"], answer: 0 },
    ],
  },
  {
    id: "ielts-reading",
    type: "qcm",
    category: "Écrit",
    name: "IELTS — Reading",
    skill: "Vocabulary & grammar",
    color: "#d8472b",
    minutes: 10,
    questions: [
      { q: "Choose the correct sentence.", choices: ["She has worked here since five years.", "She has worked here for five years.", "She is working here since five years.", "She works here for five years."], answer: 1 },
      { q: "A synonym for 'significant' is…", choices: ["minor", "substantial", "rare", "brief"], answer: 1 },
      { q: "'The results were ___ with our hypothesis.'", choices: ["consistent", "consisting", "consist", "consistency"], answer: 0 },
      { q: "Which is a formal linking word?", choices: ["so", "plus", "moreover", "and"], answer: 2 },
      { q: "'If it ___ tomorrow, we'll cancel.'", choices: ["rains", "will rain", "rained", "would rain"], answer: 0 },
    ],
  },

  // ---------- COMPRÉHENSION ORALE (QCM auto-corrigé + audio) ----------
  {
    id: "tcf-co",
    type: "qcm",
    category: "Oral",
    name: "TCF Canada — Compréhension orale",
    skill: "Écoute d'un dialogue",
    color: "#0b1f3a",
    minutes: 8,
    lang: "fr-FR",
    maxReplays: 2,
    audioScript:
      "Bonjour, je voudrais réserver une table pour ce soir, vers vingt heures. " +
      "Nous serons quatre personnes. Est-ce que vous avez encore de la place en terrasse ? " +
      "Très bien, c'est noté au nom de Martin. Merci beaucoup, à ce soir.",
    questions: [
      { q: "À quelle heure la personne veut-elle réserver ?", choices: ["18 h", "19 h", "20 h", "21 h"], answer: 2 },
      { q: "Pour combien de personnes ?", choices: ["Deux", "Trois", "Quatre", "Cinq"], answer: 2 },
      { q: "Où la personne souhaite-t-elle s'installer ?", choices: ["En salle", "En terrasse", "Au bar", "En cuisine"], answer: 1 },
      { q: "À quel nom est la réservation ?", choices: ["Marin", "Martin", "Martins", "Marc"], answer: 1 },
    ],
  },
  {
    id: "ielts-listening",
    type: "qcm",
    category: "Oral",
    name: "IELTS — Listening",
    skill: "Listening to an announcement",
    color: "#d8472b",
    minutes: 8,
    lang: "en-US",
    maxReplays: 2,
    audioScript:
      "Attention passengers. The train to Toronto departing from platform four " +
      "has been delayed by twenty minutes due to a signal problem. " +
      "Passengers travelling to Ottawa should change at the next station. " +
      "We apologise for any inconvenience.",
    questions: [
      { q: "Which platform is mentioned?", choices: ["Two", "Three", "Four", "Five"], answer: 2 },
      { q: "How long is the delay?", choices: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"], answer: 2 },
      { q: "What caused the delay?", choices: ["Bad weather", "A signal problem", "Staff shortage", "An accident"], answer: 1 },
      { q: "Passengers to Ottawa should…", choices: ["wait on platform four", "change at the next station", "take a bus", "buy a new ticket"], answer: 1 },
    ],
  },

  // ---------- PRODUCTION ÉCRITE (corrigée par le formateur) ----------
  {
    id: "tcf-ee",
    type: "ecrit",
    category: "Écrit",
    name: "TCF Canada — Expression écrite (tâche 2)",
    skill: "Rédaction d'un message",
    color: "#0b1f3a",
    minutes: 20,
    minWords: 120,
    prompt:
      "Vous venez d'emménager dans un nouvel appartement. Écrivez un courriel à un(e) ami(e) " +
      "pour lui décrire votre nouveau logement et votre quartier, et l'inviter à vous rendre visite. " +
      "(120 à 150 mots)",
  },
  {
    id: "ielts-writing",
    type: "ecrit",
    category: "Écrit",
    name: "IELTS — Writing Task 2",
    skill: "Opinion essay",
    color: "#d8472b",
    minutes: 40,
    minWords: 250,
    prompt:
      "Some people think that public transport should be free for everyone. " +
      "To what extent do you agree or disagree? Give reasons and examples. " +
      "Write at least 250 words.",
  },

  // ---------- EXPRESSION ORALE (corrigée par le formateur) ----------
  {
    id: "tcf-eo",
    type: "oral",
    category: "Oral",
    name: "TCF Canada — Expression orale (tâche 2)",
    skill: "Présentation orale",
    color: "#0b1f3a",
    prepSeconds: 60,
    speakSeconds: 120,
    prompt:
      "Présentez votre ville idéale. Où se situe-t-elle ? Comment sont les transports, les loisirs, " +
      "le travail ? Expliquez pourquoi vous aimeriez y vivre.",
  },
  {
    id: "ielts-speaking",
    type: "oral",
    category: "Oral",
    name: "IELTS — Speaking Part 2",
    skill: "Cue card",
    color: "#d8472b",
    prepSeconds: 60,
    speakSeconds: 120,
    prompt:
      "Describe a skill you would like to learn. You should say: what it is, why you want to learn it, " +
      "how you would learn it, and how it would help you in the future.",
  },
];

export function getModule(id) {
  return MODULES.find((m) => m.id === id) || null;
}

// Compat : ancien nom utilisé ailleurs.
export const EXAMS = MODULES;
export const getExam = getModule;
