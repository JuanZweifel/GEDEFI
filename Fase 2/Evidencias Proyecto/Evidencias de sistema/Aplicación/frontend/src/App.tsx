// src/App.tsx
import { Routes, Route, Navigate } from "react-router";
import DashboardComponent from "./pages/dashboard";
import { LandingPage } from "./components/landing-page";
import { Login } from "./pages/login";
import { ResetPassword } from "./pages/reset-password";
import { useAuth, ProtectedRoute } from "./contexts/authContext";

export default function App() {

  const { token } = useAuth();

  if (token === undefined) {
    // TODO: Make it pretty 💅
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* Rutas públicas*/}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={!token ? <Login onSuccess={() => { }} onCancel={() => { }} /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/reset-password" element={<ResetPassword />} />



      {/* Rutas privada */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardComponent />
          </ProtectedRoute>
        }
      />
      {/*<Route path="*" element={<NotFound />} />*/}
    </Routes>
  );
}
