// src/App.tsx
import { Routes, Route } from "react-router";
import DashboardComponent from "./pages/dashboard";
import { LandingPage } from "./components/landing-page";
import { Login } from "./pages/login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/*<Route path="/login" element={<Login />} />*/}
      <Route path="/dashboard" element={<DashboardComponent />} />
      {/*<Route path="*" element={<NotFound />} />*/}
    </Routes>
  );
}
