/*
  COMPONENT: CityRevenueBarChart

  Şehir bazlı gelir verisini sütun grafik olarak çizer.
  Bu component backend'e veya mockData dosyasına doğrudan bağlanmaz.
  Veriyi `data` propuyla DashboardPage'ten alır.

  Beklenen veri:
  [{ city: "İstanbul", value: 412, group: "Büyükşehir" }]

  ETKİLEŞİM (Figma tasarımına uygun):
  Bir sütunun üzerine gelindiğinde sütunun arkası yumuşak bir gölgeyle
  vurgulanır ve üstünde şehir adı + gelir + şehir grubunu gösteren küçük bir
  tooltip kutusu belirir. Dokunmatik ekranda sütuna dokununca da çalışır.

  TASARIM:
  dashboard.css -> `.bar-chart`, `.bar-column`, `.bar-fill`, `.chart-legend`
*/

import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function CityRevenueBarChart({ data = [], title, subtitle }) {
  const { t, tv, locale } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const visibleTitle = title ?? t("chart_city_revenue_title");
  const visibleSubtitle = subtitle ?? t("chart_city_revenue_subtitle");

  // Boş array geldiğinde Math.max(...[]) -Infinity verir; 1 ekleyerek hesabı güvenli tutuyoruz.
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value) || 0));

  return (
    <article className="dashboard-card chart-card chart-card--wide">
      <div className="card-heading">
        <h2>{visibleTitle}</h2>
        <span>{visibleSubtitle}</span>
      </div>

      {data.length ? (
        <div className="bar-chart" role="img" aria-label={`${visibleTitle} ${t("chart_aria_suffix")}`}>
          {data.map((item, index) => {
            const numericValue = Number(item.value) || 0;
            const isHovered = hoveredIndex === index;

            return (
              <div
                className="bar-column"
                key={item.city}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(index)}
                style={{
                  position: "relative",
                  // Hover'da sütunun arkası yumuşakça gölgelenir (Figma davranışı).
                  background: isHovered ? "var(--surface-muted, rgba(124, 111, 208, 0.10))" : "transparent",
                  borderRadius: 10,
                  transition: "background 0.15s ease",
                  cursor: "default",
                }}
              >
                {/* Hover tooltip: şehir + gelir + grup, sütunun üstünde küçük bir kutu */}
                {isHovered ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: "calc(100% + 8px)",
                      transform: "translateX(-50%)",
                      background: "var(--surface, #fff)",
                      border: "1px solid var(--line, #d7dbe2)",
                      borderRadius: 8,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.14)",
                      padding: "8px 12px",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      zIndex: 5,
                      fontSize: 13,
                      lineHeight: 1.5,
                      textAlign: "left",
                    }}
                  >
                    <strong style={{ display: "block" }}>{tv(item.city)}</strong>
                    <span style={{ color: "var(--accent)", fontWeight: 600, display: "block" }}>
                      {numericValue.toLocaleString(locale, { maximumFractionDigits: 0 })} ₺
                    </span>
                    <span style={{ opacity: 0.65, fontSize: 12 }}>{tv(item.group)}</span>
                  </div>
                ) : null}

                <span className="bar-value" style={{ animationDelay: `${0.35 + index * 0.08}s` }}>
                  {numericValue}
                </span>

                <div className="bar-track">
                  <div
                    className={`bar-fill ${
                      item.group === "Büyükşehir" ? "bar-fill--accent" : "bar-fill--blue"
                    }`}
                    style={{
                      // En küçük değer bile görünür olsun diye minimum 18px kullanılır.
                      height: `${Math.max(18, (numericValue / maxValue) * 124)}px`,
                      animationDelay: `${index * 0.08}s`,
                    }}
                  />
                </div>

                <span>{tv(item.city)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">{t("chart_city_revenue_empty")}</div>
      )}

      <div className="chart-legend">
        <span>
          <i className="legend-dot legend-dot--accent" /> {tv("Büyükşehir")}
        </span>
        <span>
          <i className="legend-dot legend-dot--blue" /> {tv("Bölge merkezi")}
        </span>
      </div>
    </article>
  );
}
