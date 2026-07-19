/*
  PAGE: LoginPage

  Uygulama açıldığında kullanıcıdan yönetici bilgilerini alan tam ekran giriş sayfasıdır.
  Sol panel kurumsal kimliği, sağ panel giriş formunu gösterir.

  Form gönderildiğinde authService.login ile backend'deki POST /api/auth/login
  çağrılır; kimlik doğruysa App.jsx'teki onLogin çalışır, yanlışsa backend'in
  mesajı ("E-posta veya şifre hatalı") formun altında gösterilir.

  TASARIM:
  pages.css -> `.login-page`, `.login-brand-panel`, `.login-form-card` ve alt sınıflar
*/

import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { login } from "../services/authService.js";

export default function LoginPage({ onLogin }) {
  const { t } = useLanguage();

  // Inputları React state'ine bağlayarak kontrollü form oluşturuyoruz.
  const [form, setForm] = useState({
    email: "admin@example.com",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    // HTML formunun sayfayı yenilemesini engeller.
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Backend'de kimlik doğrulaması yapılır (BCrypt karşılaştırması sunucuda).
      const admin = await login(form.email, form.password);
      onLogin(admin);
    } catch (err) {
      // Backend 401 döndüğünde mesajı formda gösteriyoruz; şifre alanını sıfırla.
      setError(err?.message ?? "Giriş yapılamadı, lütfen tekrar deneyin.");
      setForm((current) => ({ ...current, password: "" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <strong>PiA</strong>
            <span className="login-brand-divider" />
            <span>
              {t("brand_sub_line_1")}
              <br />
              {t("brand_sub_line_2")}
            </span>
          </div>

          <div className="login-welcome-copy">
            <h1>
              {t("login_title_line_1")}
              <br />
              {t("login_title_line_2")}
            </h1>
            <p>{t("login_description")}</p>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <form className="login-form-card" onSubmit={handleSubmit}>
          <div className="login-form-heading">
            <h2>{t("login_heading")}</h2>
            <p>{t("login_subtitle")}</p>
          </div>

          <div className="login-fields">
            <label className="login-field">
              <span>{t("login_email_label")}</span>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                autoComplete="email"
              />
            </label>

            <label className="login-field">
              <span className="login-password-label">
                <span>{t("login_password_label")}</span>
              </span>

              <input
                required
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
            </label>
          </div>

          {error ? (
            <p role="alert" style={{ color: "#c0392b", fontSize: 13, margin: "4px 0 0" }}>
              {error}
            </p>
          ) : null}

          <Button
            className="login-submit-button"
            variant="primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "..." : t("login_submit")}
          </Button>
        </form>
      </section>
    </main>
  );
}
