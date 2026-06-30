"use client";

import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import App from "../../App.jsx";
import { AuthProvider } from "../../contexts/AuthContext.jsx";

export default function FusionDashboardClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-50 text-sm font-medium text-zinc-500">
        Loading Fusion OS...
      </div>
    );
  }

  return (
    <BrowserRouter basename="/dashboard">
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
