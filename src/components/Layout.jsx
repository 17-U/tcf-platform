import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { getPendingSubmissions } from "../lib/store.js";

function Icon({ d }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  test: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  chart: "M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let active = true;
    if (isAdmin) {
      getPendingSubmissions()
        .then((list) => active && setPending(list.length))
        .catch(() => {});
    }
    return () => { active = false; };
  }, [isAdmin]);

  async function handleLogout() {
    await logout();
    navigate("/connexion");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="mark">
            <svg width="18" height="18" viewBox="0 0 32 32"><path d="M16 4l1.7 4.4 4.2-1.3-1.7 4.1 3.8 1.7-3.6 1.9 2.3 4-4.3-1 .3 4.5L16 25l-2.7-1.4.3-4.5-4.3 1 2.3-4-3.6-1.9 3.8-1.7L4 8.5l4.2 1.3L16 4z" fill="#fff"/></svg>
          </span>
          <div>
            <strong>Centre Réussite</strong>
            <span>TCF · TEF · IELTS</span>
          </div>
        </div>

        {isAdmin && (
          <NavLink to="/utilisateurs" className="nav-link">
            <Icon d={ICONS.users} /> Utilisateurs
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/corrections" className="nav-link">
            <Icon d={ICONS.inbox} /> Corrections
            {pending > 0 && <span className="nav-count">{pending}</span>}
          </NavLink>
        )}
        <NavLink to="/tests" className="nav-link">
          <Icon d={ICONS.test} /> Tests
        </NavLink>
        {!isAdmin && (
          <NavLink to="/mes-resultats" className="nav-link">
            <Icon d={ICONS.chart} /> Mes résultats
          </NavLink>
        )}

        <div className="nav-spacer" />
        <button className="nav-link" onClick={handleLogout} style={{ background: "none", border: "none", width: "100%" }}>
          <Icon d={ICONS.logout} /> Se déconnecter
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>{isAdmin ? "Espace administrateur" : "Espace candidat"}</h1>
          <div className="who">{user?.name || user?.email}</div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
