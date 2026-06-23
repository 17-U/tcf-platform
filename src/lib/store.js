// Couche de données Firebase (Firestore — plan gratuit, sans Cloud Storage).
// Toutes les fonctions sont ASYNCHRONES (elles renvoient des Promesses).
// L'authentification est gérée séparément dans AuthContext.jsx.
//
// Collections Firestore :
//   users        : { role, name, email, exam, target, note, createdAt }   (id = uid Auth)
//   attempts     : { userId, examId, examName, score, total, percent, finishedAt }
//   submissions  : { userId, moduleId, moduleName, type, content, wordCount,
//                    audioUrl, status, grade, feedback, submittedAt, gradedAt }

import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut as secondarySignOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { firebaseConfig } from "./firebase.js";

function withId(snap) {
  return { id: snap.id, ...snap.data() };
}

// ---------------- Utilisateurs ----------------

export async function getUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(withId);
}

export async function getUser(id) {
  const snap = await getDoc(doc(db, "users", id));
  return snap.exists() ? withId(snap) : null;
}

// Crée un candidat SANS déconnecter l'administrateur.
// Astuce : on utilise une instance Firebase secondaire pour la création du
// compte Auth, puis on écrit son profil avec la session admin (db principal).
export async function addUser(data) {
  const secondary = initializeApp(firebaseConfig, "secondary-" + Date.now());
  const secondaryAuth = getAuth(secondary);
  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email.trim(),
      (data.password || "1234").trim()
    );
    const uid = cred.user.uid;
    const profile = {
      role: "candidate",
      name: data.name?.trim() || "Sans nom",
      email: data.email.trim(),
      exam: data.exam || "TCF Canada",
      target: data.target || "",
      note: data.note || "",
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "users", uid), profile);
    await secondarySignOut(secondaryAuth);
    return { id: uid, ...profile };
  } finally {
    await deleteApp(secondary);
  }
}

export async function updateUser(id, patch) {
  await updateDoc(doc(db, "users", id), patch);
  return getUser(id);
}

// Supprime le profil et les données du candidat.
// NB : le compte d'authentification reste (à retirer dans la console Firebase
// si besoin) — le SDK client ne peut pas supprimer un autre utilisateur Auth.
export async function deleteUser(id) {
  const attempts = await getDocs(query(collection(db, "attempts"), where("userId", "==", id)));
  await Promise.all(attempts.docs.map((d) => deleteDoc(d.ref)));
  const subs = await getDocs(query(collection(db, "submissions"), where("userId", "==", id)));
  await Promise.all(subs.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "users", id));
}

// ---------------- Tentatives (QCM) ----------------

export async function getAttempts() {
  const snap = await getDocs(collection(db, "attempts"));
  return snap.docs.map(withId);
}

export async function getAttemptsByUser(userId) {
  const snap = await getDocs(query(collection(db, "attempts"), where("userId", "==", userId)));
  return snap.docs.map(withId).sort((a, b) => b.finishedAt - a.finishedAt);
}

export async function saveAttempt(attempt) {
  const record = { ...attempt, finishedAt: Date.now() };
  const r = await addDoc(collection(db, "attempts"), record);
  return { id: r.id, ...record };
}

// ---------------- Productions (écrit / oral) ----------------

export async function getSubmissions() {
  const snap = await getDocs(collection(db, "submissions"));
  return snap.docs.map(withId);
}

export async function getSubmissionsByUser(userId) {
  const snap = await getDocs(query(collection(db, "submissions"), where("userId", "==", userId)));
  return snap.docs.map(withId).sort((a, b) => b.submittedAt - a.submittedAt);
}

export async function getPendingSubmissions() {
  const snap = await getDocs(query(collection(db, "submissions"), where("status", "==", "en_attente")));
  return snap.docs.map(withId).sort((a, b) => a.submittedAt - b.submittedAt);
}

export async function saveSubmission(data) {
  // On ignore tout blob audio : sur le plan gratuit, on ne stocke pas de fichier.
  const { audioBlob, ...rest } = data;
  const record = {
    status: "en_attente",
    grade: null,
    feedback: "",
    submittedAt: Date.now(),
    gradedAt: null,
    ...rest,
  };
  const r = await addDoc(collection(db, "submissions"), record);
  return { id: r.id, ...record };
}

export async function gradeSubmission(id, { grade, feedback }) {
  await updateDoc(doc(db, "submissions", id), {
    grade,
    feedback,
    status: "corrige",
    gradedAt: Date.now(),
  });
  const snap = await getDoc(doc(db, "submissions", id));
  return withId(snap);
}
