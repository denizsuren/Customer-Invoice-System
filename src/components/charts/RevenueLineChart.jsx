/*
  COMPONENT: RevenueLineChart

  Aylık gelir verisini SVG çizgi grafik olarak çizer.
  Mock veriyi doğrudan import etmez; `data` propunu kullanır.
  Min/max değerleri backend verisine göre otomatik hesaplandığı için
  veri aralığı değiştiğinde grafik ekran dışına taşmaz.

  ETKİLEŞİM (Figma tasarımına uygun):
  Fare grafiğin üzerindeyken yatay konuma en yakın veri noktası bulunur;
  o noktada dikey bir kılavuz çizgisi + büyütülmüş nokta vurgusu çizilir ve
  üstünde ay adı ile tutarı gösteren bir tooltip kutusu belirir.
  Dokunmatik ekranlarda da çalışır (onTouchMove aynı hesabı kullanır).

  Beklenen veri:
  [{ month: "Şub", value: 920 }]

  TASARIM:
  dashboard.css -> `.line-chart`, `.revenue-line`, `.revenue-point`, `.chart-grid-line`
*/

import { useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const width = 660;
const height = 205;
const chartLeft = 52;
const chartRight = 618;
const chartTop = 28;
const chartBottom = 176;
const tickCount = 4;

/*
  Backend aylık geliri "2026-05" (yyyy-MM) formatında gönderir. Bu yardımcı,
  o değeri dile uygun ay adına çevirir: tooltip'te uzun ("Mayıs" / "May"),
  eksende kısa ("May" / "Haz") biçim kullanılır. Değer yyyy-MM kalıbına
  uymuyorsa (örn. mock verideki "Şub") null döner ve çağıran taraf tv() ile
  eski davranışa düşer.
*/
function formatMonthName(raw, locale, style) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(raw ?? ""));
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  const label = date.toLocaleDateString(locale, { month: style });

  // tr-TR uzun ay adlarını küçük harfle verir ("mayıs"); baş harfi büyütülür.
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}

function formatAxisValue(value) {
  return (value / 1000).toFixed(1).replace(".", ",");
}

function calculateScale(data) {
  const values = data.map((point) => Number(point.value)).filter(Number.isFinite);

  if (!values.length) {
    return { minValue: 0, maxValue: 1 };
  }

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const difference = rawMax - rawMin;
  const padding = Math.max(difference * 0.2, rawMax * 0.05, 1);

  return {
    minValue: Math.max(0, Math.floor((rawMin - padding) / 100) * 100),
    maxValue: Math.ceil((rawMax + padding) / 100) * 100,
  };
}

export default function RevenueLineChart({ data = [], title, subtitle }) {
  const { t, tv, locale } = useLanguage();
  const svgRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const visibleTitle = title ?? t("chart_revenue_trend_title");
  const visibleSubtitle = subtitle ?? t("chart_revenue_trend_subtitle");
  const { minValue, maxValue } = calculateScale(data);
  const valueRange = Math.max(1, maxValue - minValue);

  const points = data.map((point, index) => {
    // Tek veri noktası gelirse grafiğin ortasına yerleştirilir.
    const x =
      data.length === 1
        ? (chartLeft + chartRight) / 2
        : chartLeft + ((chartRight - chartLeft) * index) / (data.length - 1);
    const numericValue = Number(point.value) || 0;
    const y = chartBottom - ((numericValue - minValue) / valueRange) * (chartBottom - chartTop);

    return { ...point, value: numericValue, x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const ratio = index / (tickCount - 1);
    return maxValue - ratio * valueRange;
  });

  /*
    Ekrandaki fare konumunu SVG'nin viewBox koordinatına çevirip yatayda en
    yakın veri noktasını bulur. Noktanın tam üstüne gelmek gerekmez; grafik
    alanında gezinmek yeterlidir (Figma'daki davranış da bu şekilde).
  */
  const updateHoverFromClientX = (clientX) => {
    const svg = svgRef.current;
    if (!svg || !points.length) return;

    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * width;

    let nearest = 0;
    let nearestDistance = Infinity;
    points.forEach((point, index) => {
      const distance = Math.abs(point.x - svgX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    setHoveredIndex(nearest);
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <article className="dashboard-card chart-card chart-card--wide">
      <div className="card-heading">
        <h2>{visibleTitle}</h2>
        <span>{visibleSubtitle}</span>
      </div>

      {points.length ? (
        <div style={{ position: "relative" }}>
          <svg
            ref={svgRef}
            className="line-chart"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={visibleTitle}
            onMouseMove={(event) => updateHoverFromClientX(event.clientX)}
            onMouseLeave={() => setHoveredIndex(null)}
            onTouchMove={(event) => updateHoverFromClientX(event.touches[0]?.clientX)}
            onTouchEnd={() => setHoveredIndex(null)}
          >
            {ticks.map((value, index) => {
              const y = chartTop + (index * (chartBottom - chartTop)) / (tickCount - 1);

              return (
                <g key={`${value}-${index}`}>
                  <line x1="42" y1={y} x2="630" y2={y} className="chart-grid-line" />
                  <text x="8" y={y + 4} className="chart-axis-label">
                    {formatAxisValue(value)}
                  </text>
                </g>
              );
            })}

            {/* Hover: seçili noktadan aşağı inen dikey kılavuz çizgisi */}
            {hoveredPoint ? (
              <line
                x1={hoveredPoint.x}
                y1={chartTop - 6}
                x2={hoveredPoint.x}
                y2={chartBottom}
                stroke="var(--accent)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.55"
                pointerEvents="none"
              />
            ) : null}

            <path d={path} className="revenue-line" pathLength="1" />

            {points.map((point, index) => (
              <g key={`${point.month}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  className="revenue-point"
                  style={{ animationDelay: `${0.45 + index * 0.08}s` }}
                />
                <text x={point.x} y="197" textAnchor="middle" className="chart-axis-label">
                  {formatMonthName(point.month, locale, "short") ?? tv(point.month)}
                </text>
              </g>
            ))}

            {/* Hover: seçili noktanın vurgu halkası (nokta animasyonunu bozmadan üstüne çizilir) */}
            {hoveredPoint ? (
              <g pointerEvents="none">
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="9"
                  fill="var(--accent)"
                  opacity="0.15"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="5.5"
                  fill="var(--accent)"
                  stroke="var(--surface, #fff)"
                  strokeWidth="2"
                />
              </g>
            ) : null}
          </svg>

          {/*
            Tooltip, SVG yerine HTML olarak çizilir: yazı tipi/gölge/kenarlık
            temadan gelir ve viewBox ölçeklemesinden etkilenmez. Konumu,
            noktanın SVG koordinatının yüzdeye çevrilmesiyle hesaplanır.
          */}
          {hoveredPoint ? (
            <div
              style={{
                position: "absolute",
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100}%`,
                transform: "translate(-50%, calc(-100% - 14px))",
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
              }}
            >
              <strong style={{ display: "block" }}>
                {formatMonthName(hoveredPoint.month, locale, "long") ?? tv(hoveredPoint.month)}
              </strong>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {Number(hoveredPoint.value).toLocaleString(locale, { maximumFractionDigits: 0 })} ₺
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="empty-state">{t("chart_revenue_empty")}</div>
      )}
    </article>
  );
}
