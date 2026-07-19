/*
  PAGE: SettingsPage

  Ayarlar ekranının sayfa seviyesindeki merkezidir.
  Dil (tr/en) ve tema (light/dark) tercihlerini LanguageContext ve ThemeContext
  üzerinden yönetir; component'in kendisi localStorage'a dokunmaz.

  Veri akışı:
  SettingsPage -> useLanguage() / useTheme() -> Context (localStorage + <html> attribute)
*/

import { useLanguage } from "../context/LanguageContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <section className="page-content">
      <div className="page-heading">
        <h1>{t("settings_title")}</h1>
        <p>{t("settings_subtitle")}</p>
      </div>

      <div className="settings-grid">
        {/* Dil kartı */}
        <article className="dashboard-card settings-card">
          <div className="card-heading">
            <h2>{t("settings_language_title")}</h2>
          </div>
          <p className="settings-card__desc">{t("settings_language_desc")}</p>

          <div className="segmented-control" role="radiogroup" aria-label={t("settings_language_title")}>
            <button
              type="button"
              role="radio"
              aria-checked={language === "tr"}
              className={`segmented-control__option${language === "tr" ? " segmented-control__option--active" : ""}`}
              onClick={() => setLanguage("tr")}
            >
              Türkçe
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={language === "en"}
              className={`segmented-control__option${language === "en" ? " segmented-control__option--active" : ""}`}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
          </div>
        </article>

        {/* Tema kartı */}
        <article className="dashboard-card settings-card">
          <div className="card-heading">
            <h2>{t("settings_theme_title")}</h2>
          </div>
          <p className="settings-card__desc">{t("settings_theme_desc")}</p>

          <div className="segmented-control" role="radiogroup" aria-label={t("settings_theme_title")}>
            <button
              type="button"
              role="radio"
              aria-checked={theme === "light"}
              className={`segmented-control__option${theme === "light" ? " segmented-control__option--active" : ""}`}
              onClick={() => setTheme("light")}
            >
              ☀️ {t("settings_theme_light")}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={theme === "dark"}
              className={`segmented-control__option${theme === "dark" ? " segmented-control__option--active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              🌙 {t("settings_theme_dark")}
            </button>
          </div>
        </article>
      </div>

      <p className="settings-saved-note">{t("settings_saved_note")}</p>
    </section>
  );
}
