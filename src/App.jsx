import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./lib/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Landing from "./pages/Landing.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminUserDetail from "./pages/AdminUserDetail.jsx";
import AdminCorrections from "./pages/AdminCorrections.jsx";
import Tests from "./pages/Tests.jsx";
import TestPlayer from "./pages/TestPlayer.jsx";
import WritingPlayer from "./pages/WritingPlayer.jsx";
import SpeakingPlayer from "./pages/SpeakingPlayer.jsx";
import MyResults from "./pages/MyResults.jsx";

function Splash() {
  return (
    <div className="login-wrap">
      <div className="muted">Chargement…</div>
    </div>
  );
}

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/connexion" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Login />} />
      <Route path="/" element={<Landing />} />

      <Route path="/utilisateurs" element={<Protected role="admin"><Layout><AdminUsers /></Layout></Protected>} />
      <Route path="/utilisateurs/:id" element={<Protected role="admin"><Layout><AdminUserDetail /></Layout></Protected>} />
      <Route path="/corrections" element={<Protected role="admin"><Layout><AdminCorrections /></Layout></Protected>} />

      <Route path="/tests" element={<Protected><Layout><Tests /></Layout></Protected>} />
      <Route path="/tests/qcm/:examId" element={<Protected><TestPlayer /></Protected>} />
      <Route path="/tests/ecrit/:id" element={<Protected><WritingPlayer /></Protected>} />
      <Route path="/tests/oral/:id" element={<Protected><SpeakingPlayer /></Protected>} />
      <Route path="/mes-resultats" element={<Protected><Layout><MyResults /></Layout></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}