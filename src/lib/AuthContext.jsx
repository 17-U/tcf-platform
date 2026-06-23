import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { uid, email, role, name, ... }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        const profile = snap.exists() ? snap.data() : {};
        setUser({ uid: fbUser.uid, id: fbUser.uid, email: fbUser.email, ...profile });
      } catch {
        setUser({ uid: fbUser.uid, id: fbUser.uid, email: fbUser.email });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    const profile = snap.exists() ? snap.data() : {};
    const full = { uid: cred.user.uid, id: cred.user.uid, email: cred.user.email, ...profile };
    setUser(full);
    return full;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
