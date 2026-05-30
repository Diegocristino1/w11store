import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../winning-eleven-store.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
