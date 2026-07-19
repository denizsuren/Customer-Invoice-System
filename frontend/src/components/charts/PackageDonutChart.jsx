/*
  COMPONENT: PackageDonutChart

  Paket dağılımını donut grafik olarak gösterir.
  Veri backend'den yüzde veya adet olarak gelebilir;
  component toplamı hesaplayıp her parçanın oranını kendi çıkarır.

  Beklenen veri:
  [{ label: "İnternet ağırlıklı", value: 45, tone: "accent" }]

  TASARIM:
  dashboard.css -> `.donut-layout`, `.donut-chart`, `.donut-segment`, `.donut-legend`
*/

import { useLanguage } from "../../context/LanguageContext.jsx";

const radius = 48;
const circumference = 2 * Math.PI * radius;

// Backend'in tasarım rengini doğrudan belirlemesi yerine sınırlı tone değerleri kullanılır.
const toneColors = {
  accent: "#4F46E5", // indigo
  blue: "#0284C7",   // mavi
  teal: "#0D9488",   // teal
  purple: "#9333EA", // mor
  orange: "#EA580C", // turuncu
  rose: "#E11D48",   // rose
  gray: "#475569",   // koyu gri
};

/*
  NOT: Eski sürümde 3. ve 4. dilimlere "gray" ve "line" tonları atanıyordu.
  --line bir kenarlık rengi olduğundan o dilim track ile aynı renkte kalıyor,
  grafik "yüklenmiyor" gibi görünüyordu. Artık tanımsız/zayıf tonlar için
  index bazlı belirgin bir palet kullanılır.
*/
const fallbackPalette = ["accent", "blue", "teal", "purple", "orange", "rose", "gray"];

function resolveSegmentColor(tone, index) {
  if (tone && tone !== "line" && toneColors[tone]) return toneColors[tone];
  return toneColors[fallbackPalette[index % fallbackPalette.length]];
}

export default function PackageDonutChart({ data = [], totalLines = 0, title, subtitle }) {
  const { locale, t, tv } = useLanguage();
  const visibleTitle = title ?? t("chart_package_title");
  const visibleSubtitle = subtitle ?? t("chart_package_subtitle");
  const formatCount = (value) => new Intl.NumberFormat(locale).format(Number(value) || 0);
  const totalValue = data.reduce((total, segment) => total + (Number(segment.value) || 0), 0);

  // Her segment için SVG çizgi uzunluğu ve başlangıç konumu hesaplanır.
  const segments = data.reduce((result, segment) => {
    const accumulatedValue = result.reduce((total, item) => total + item.numericValue, 0);
    const numericValue = Number(segment.value) || 0;
    const ratio = totalValue > 0 ? numericValue / totalValue : 0;
    const segmentLength = ratio * circumference;
    const accumulatedRatio = totalValue > 0 ? accumulatedValue / totalValue : 0;

    return [
      ...result,
      {
        ...segment,
        numericValue,
        percentage: Math.round(ratio * 100),
        segmentLength,
        dashOffset: -accumulatedRatio * circumference,
      },
    ];
  }, []);

  return (
    <article className="dashboard-card chart-card">
      <div className="card-heading">
        <h2>{visibleTitle}</h2>
        <span>{visibleSubtitle}</span>
      </div>

      {segments.length > 0 && totalValue > 0 ? (
        <div className="donut-layout">
          <div className="donut-chart-wrap">
            <svg className="donut-chart" viewBox="0 0 120 120" role="img" aria-label={visibleTitle}>
              <circle cx="60" cy="60" r={radius} className="donut-track" />

              {segments.map((segment, index) => (
                <circle
                  key={`${segment.label}-${index}`}
                  cx="60"
                  cy="60"
                  r={radius}
                  className="donut-segment"
                  stroke={resolveSegmentColor(segment.tone, index)}
                  strokeDasharray={`${segment.segmentLength} ${
                    circumference - segment.segmentLength
                  }`}
                  strokeDashoffset={segment.dashOffset}
                  style={{
                    "--segment-length": segment.segmentLength,
                    "--circle-length": circumference,
                    animationDelay: `${index * 0.12}s`,
                  }}
                />
              ))}
            </svg>

            <div className="donut-center">
              <strong>{formatCount(totalLines)}</strong>
              <span>{t("chart_line_count_label")}</span>
            </div>
          </div>

          <div className="donut-legend">
            {segments.map((segment, index) => (
              <div key={`${segment.label}-${index}`}>
                <span
                  className="legend-dot"
                  style={{ background: resolveSegmentColor(segment.tone, index) }}
                />
                <span>
                  {tv(segment.label)} · %{segment.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">{t("chart_package_empty")}</div>
      )}
    </article>
  );
}
