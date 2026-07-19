/*
  COMPONENT: RecommendationCard

  Dashboard'daki kısa öneri listesini gösterir.
  Öneriler backend'den DashboardPage'e, oradan bu componente prop olarak gelir.

  TASARIM:
  dashboard.css -> `.recommendation-card`
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import Button from "../ui/Button.jsx";

export default function RecommendationCard({ recommendations = [], onOpenAll }) {
  const { t, tv } = useLanguage();

  return (
    <article className="dashboard-card recommendation-card">
      <div className="card-heading">
        <h2>{t("recommendation_engine_title")}</h2>
        <span>{t("recommendation_engine_subtitle")}</span>
      </div>

      {recommendations.length ? (
        <ul>
          {recommendations.map((item, index) => (
            // Aynı başlıktan iki tane gelme ihtimaline karşı index de key'e eklenir.
            <li key={`${item.title}-${index}`}>• {tv(item.title)}</li>
          ))}
        </ul>
      ) : (
        <p className="muted-copy">{t("recommendation_empty")}</p>
      )}

      <Button variant="primary" onClick={onOpenAll} disabled={!recommendations.length}>
        {t("recommendation_show_all")}
      </Button>
    </article>
  );
}
