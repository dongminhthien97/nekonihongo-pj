import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* SAI: font-['M_PLUS_Rounded_1c'] */}
    {/* ĐÚNG: font-mplus (hoặc font-fredoka) */}
    <div className="font-mplus antialiased">
      <App />
    </div>
  </React.StrictMode>
);
