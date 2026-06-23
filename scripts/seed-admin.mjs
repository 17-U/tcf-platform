// Crée le compte administrateur initial dans Firebase.
//
// Pré-requis :
//   1. Dans la console Firebase : activer Authentication -> Email/Password.
//   2. Avoir rempli le fichier .env (mêmes clés que .env.example).
//
// Lancement :
//   node scripts/seed-admin.mjs "admin@centre.cm" "MotDePasseFort" "Administrateur"
//
// Ensuite, connectez-vous avec ces identifiants et créez les candidats
// directement depuis l'espace « Utilisateurs ».

import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// --- Lecture simple du fichier .env ---
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    console.error("Fichier .env introuvable à la racine du projet.");
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const [, , email, password, name = "Administrateur"] = process.argv;

if (!email || !password) {
  console.error('Usage : node scripts/seed-admin.mjs "email" "motdepasse" "Nom"');
  process.exit(1);
}

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    console.log("Compte Auth créé.");
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      console.log("Compte déjà existant — connexion réussie.");
    } else {
      throw e;
    }
  }

  await setDoc(doc(db, "users", uid), {
    role: "admin",
    name,
    email,
    exam: null,
    target: null,
    note: "",
    createdAt: Date.now(),
  });

  console.log(`\n✅ Administrateur prêt : ${email}`);
  console.log("   Connectez-vous, puis créez vos candidats depuis l'espace Utilisateurs.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Échec :", e.message || e);
  process.exit(1);
});
