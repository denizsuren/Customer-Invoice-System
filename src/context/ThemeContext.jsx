/* eslint-disable react-refresh/only-export-components */
/*
  CONTEXT: ThemeContext

  Uygulama genelinde açık/koyu tema durumunu yönetir.
  localStorage'da saklanır ve <html data-theme="dark|light"> attribute'u üzerinden
  base.css'teki renk değişkenlerini değiştirir.

  Kullanım:
  const { theme, toggleTheme } = useTheme();
*/

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pia-theme";
const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;

  // Kayıtlı tercih yoksa işletim sisteminin koyu mod ayarına bakar.
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Tema değiştikçe localStorage'a yazar ve <html data-theme="..."> attribute'unu günceller.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme, ThemeProvider içinde kullanılmalı.");
  }

  return context;
}
