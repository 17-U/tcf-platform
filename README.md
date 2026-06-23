# Centre Réussite — Plateforme TCF · TEF · IELTS

Plateforme React (Vite) pour un centre de préparation aux tests de langue
(immigration Canada), avec **Firebase** sur son plan **gratuit Spark** :
authentification et base de données partagée (Firestore). Aucune carte bancaire,
aucun Cloud Storage.

## Fonctionnalités

**Espace administrateur**
- Liste des candidats avec score moyen et nombre de tests
- Création d'un candidat (compte + e-mail/mot de passe, examen visé, objectif)
- Fiche candidat : consignes personnalisées, historique, suppression
- Onglet **Corrections** : note et commente les productions écrites/orales

**Espace candidat**
- Voit la consigne du formateur, passe librement les tests
- Reçoit notes et commentaires dans « Mes résultats »

**Modules (TCF Canada, TEF Canada, IELTS)**
- *Compréhension écrite* — QCM auto-corrigé
- *Compréhension orale* — audio lu par le navigateur, QCM auto-corrigé
- *Production écrite* — sujet + minuteur + compteur de mots, envoyée au formateur
- *Expression orale* — préparation + temps de parole, **réécoute personnelle** ; le formateur la note en séance

---

## 1. Créer le projet Firebase

1. Va sur https://console.firebase.google.com → **Ajouter un projet**.
2. Dans le projet, active :
   - **Authentication** → onglet *Sign-in method* → active **E-mail/Mot de passe**.
   - **Firestore Database** → *Créer une base* (mode production).

   > Pas besoin de **Storage** : la plateforme fonctionne entièrement sur le plan
   > **gratuit Spark** (aucune carte bancaire). Cloud Storage est volontairement
   > non utilisé car il exigerait le plan payant Blaze.
3. **Paramètres du projet** (roue dentée) → *Vos applications* → icône **Web** `</>` →
   enregistre l'app. Copie l'objet `firebaseConfig` affiché.

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```
Remplis `.env` avec les valeurs de ton `firebaseConfig` (apiKey, authDomain, etc.).

## 3. Publier les règles de sécurité

Dans la console Firebase, colle le contenu des fichiers fournis :
- **Firestore** → onglet *Règles* → colle `firestore.rules` → *Publier*.

Ces règles garantissent qu'un candidat ne voit que ses propres données, et que
seul l'administrateur peut gérer les comptes et corriger les copies.

## 4. Créer le compte administrateur

```bash
npm install
node scripts/seed-admin.mjs "admin@centre.cm" "UnMotDePasseFort" "Administrateur"
```
Ce script crée le compte admin et son profil. Tous les **candidats** se créent
ensuite depuis l'interface (espace *Utilisateurs*).

## 5. Lancer en local

```bash
npm run dev
```
Ouvre http://localhost:5173 et connecte-toi avec le compte admin.

---

## Déployer sur Vercel

1. Pousse le dépôt sur GitHub (déjà fait).
2. Sur https://vercel.com → **Add New → Project** → importe le dépôt.
3. Vercel détecte Vite (Build `npm run build`, Output `dist`).
4. **Settings → Environment Variables** : ajoute les 6 variables `VITE_FIREBASE_*`
   (mêmes valeurs que ton `.env`). **Indispensable**, sinon l'app ne se connecte pas.
5. **Deploy**.
6. Dans Firebase → Authentication → *Settings* → **Authorized domains**, ajoute ton
   domaine Vercel (ex : `mon-app.vercel.app`) pour autoriser la connexion.

Le fichier `vercel.json` gère déjà le routage des pages.

---

## Notes

- **Suppression d'un candidat** : supprime son profil et ses données. Le compte
  d'authentification reste (le SDK client ne peut pas supprimer un autre compte
  Auth) ; retire-le si besoin dans Firebase → Authentication.
- **Plan gratuit** : le projet tient entièrement sur le plan Spark (Auth + Firestore),
  sans carte bancaire. Les audios de l'épreuve orale ne sont pas téléversés.
- **Expression orale** : le candidat s'enregistre et se réécoute pour s'auto-évaluer
  (l'audio reste sur son appareil) ; le formateur note la prestation en séance.
- **Compréhension orale** : utilise la synthèse vocale du navigateur (Chrome/Edge
  recommandés) ; un texte de secours s'affiche si l'audio n'est pas disponible.
- **Questions** : modifie `src/lib/questions.js`. Chaque module a un `type`
  (`qcm`, `ecrit`, `oral`) ; pour les QCM, `answer` est l'indice de la bonne réponse.

## Structure

```
src/
  lib/firebase.js      init Firebase (auth, firestore)
  lib/AuthContext.jsx  contexte de connexion (useAuth)
  lib/store.js         couche de données Firestore (async)
  lib/questions.js     modules & banques de questions
  lib/tts.js           lecture audio (compréhension orale)
  components/Layout    barre latérale + en-tête
  pages/               Login, AdminUsers, AdminUserDetail, AdminCorrections,
                       Tests, TestPlayer, WritingPlayer, SpeakingPlayer, MyResults
scripts/seed-admin.mjs création du compte administrateur
firestore.rules        règles Firestore (à publier)
```
