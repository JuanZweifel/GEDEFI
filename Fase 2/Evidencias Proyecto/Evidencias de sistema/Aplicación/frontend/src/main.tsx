import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router"
import App from "./App.tsx";
import { AuthProvider } from "./contexts/authContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
      <App />
  </BrowserRouter>
);

