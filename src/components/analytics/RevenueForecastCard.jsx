/*
  COMPONENT: RevenueForecastCard

  Figma'daki Analizler sayfasındaki "Gelecek 2 Yıl Ciro Tahmini" kartının React karşılığıdır.
  Bu component backend'e veya mockData dosyasına doğrudan bağlanmaz.
  Veriyi `forecast` propuyla AnalyticsPage'ten alır.

  Beklenen veri:
  {
    subtitle, averageLabel, averageValue,
    estimates: [{ year, value, change, tone }]
  }

  TASARIM:
  analytics.css -> `.forecast-card`, `.forecast-average`, `.forecast-estimates`
*/

import { useLanguage } from "../../context/LanguageContext.jsx";

export default function RevenueForecastCard({ forecast }) {
  const { tv } = useLanguage();
  if (!forecast) return null;

  const { subtitle, averageLabel, averageValue, estimates = [] } = forecast;

  return (
    <article className="dashboard-card chart-card">
      <div className="card-heading">
        <h2>{tv(subtitle)}</h2>
      </div>

      <div className="forecast-average">
        <span>{tv(averageLabel)}</span>
        <strong>{averageValue}</strong>
      </div>

      <div className="forecast-divider" />

      <div className="forecast-estimates">
        {estimates.map((estimate) => (
          <div className="forecast-estimate" key={estimate.year}>
            <span>{tv(estimate.year)}</span>
            <div className="forecast-estimate__value">
              <strong>{estimate.value}</strong>
              <span className={`badge badge--${estimate.tone ?? "success"}`}>{estimate.change}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
