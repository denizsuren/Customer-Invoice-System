/*
  COMPONENT: HorizontalBarChart

  Figma'daki Bölgesel sayfasındaki yatay çubuk (bar) grafiklerin React karşılığıdır.
  Hem "Şehirlere Göre Gelir" hem de "Mobil Ödeme Analizi" kartlarında kullanılır;
  aradaki tek fark renk (accent/blue) ve gösterilen birimdir.

  Bu component backend'e veya mockData dosyasına doğrudan bağlanmaz.
  Veriyi `data` propuyla RegionalPage'ten alır.

  Beklenen veri:
  [{ label: "İstanbul", value: 412 }]

  TASARIM:
  regional.css -> `.hbar-row`, `.hbar-track`, `.hbar-fill`
*/

import { useLanguage } from "../../context/LanguageContext.jsx";

export default function HorizontalBarChart({
  data = [],
  title,
  subtitle,
  unit = "",
  color = "accent",
  formatValue = (value) => value,
}) {
  const { t, tv } = useLanguage();

  // Boş array geldiğinde Math.max(...[]) -Infinity verir; 1 ekleyerek hesabı güvenli tutuyoruz.
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value) || 0));

  return (
    <article className="dashboard-card chart-card">
      <div className="card-heading">
        <h2>{title}</h2>
      </div>

      {subtitle ? <p className="hbar-subtitle">{tv(subtitle)}</p> : null}

      {data.length ? (
        <div className="hbar-list" role="img" aria-label={`${title} ${t("chart_aria_suffix")}`}>
          {data.map((item, index) => {
            const numericValue = Number(item.value) || 0;
            const fillPercent = (numericValue / maxValue) * 100;

            return (
              <div className="hbar-row" key={item.label}>
                <div className="hbar-row__labels">
                  <span>{tv(item.label)}</span>
                  <strong>
                    {formatValue(numericValue)} {tv(unit)}
                  </strong>
                </div>

                <div className="hbar-track">
                  <div
                    className={`hbar-fill hbar-fill--${color}`}
                    style={{
                      width: `${Math.max(3, fillPercent)}%`,
                      animationDelay: `${index * 0.07}s`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">{t("regional_empty")}</div>
      )}
    </article>
  );
}
