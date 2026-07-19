import { useLanguage } from "../context/LanguageContext.jsx";

export default function PlaceholderPage({ title }) {
  const { t } = useLanguage();

  return (
    <section className="page-content">
      <div className="page-heading">
        <h1>{title}</h1>
        <p>{t("placeholder_page_subtitle")}</p>
      </div>
      <div className="placeholder-card">
        <strong>{t("placeholder_page_title", { title })}</strong>
        <span>{t("placeholder_page_desc")}</span>
      </div>
    </section>
  );
}
