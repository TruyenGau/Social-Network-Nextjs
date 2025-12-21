"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface IThemeContext {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<IThemeContext | null>(null);

export const ThemeModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<ThemeMode>("light");

  // Load từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
    if (saved) setMode(saved);
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme-mode", next);
      return next;
    });
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx)
    throw new Error("useThemeMode must be used inside ThemeModeProvider");
  return ctx;
};
