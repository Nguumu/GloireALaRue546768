"use client";

import { useEffect, useState } from "react";
import { Button } from "@tcg/ui";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme") as Theme | null;
    setTheme(stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  }, []);

  if (!theme) return <div className="h-8 w-8" />;

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Basculer le thème clair/sombre"
      onClick={() => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </Button>
  );
}
