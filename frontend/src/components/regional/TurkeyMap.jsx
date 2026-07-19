/*
  COMPONENT: TurkeyMap

  Bölgesel sayfası için Türkiye haritası.
  Dış hat, projeye yüklenen "Türkiye Mülki İdare Haritası" görselinden otomatik
  çizilerek (kontur çıkarma + sadeleştirme) birebir alınmıştır; bu yüzden şekil
  gerçek haritayla örtüşür. Şehir konumları enlem/boylamdan, haritanın
  coğrafi uçlarına göre kalibre edilmiş izdüşümle hesaplanır.

  - Balon BÜYÜKLÜĞÜ  -> bölgenin toplam geliri
  - Balon RENGİ      -> gecikmiş ödeme oranı (yeşil düşük, kırmızı yüksek)
  - Üzerine gelince  -> gelir, fatura adedi, ortalama tutar ve gecikme oranı

  Etiketler bileşenin içinde TR/EN olarak gömülüdür (LABELS); i18n dosyasına
  yeni anahtar eklemek gerekmez, ham anahtar adlarının ekranda görünme riski yoktur.
*/

import { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const MAP_WIDTH = 940.0;
const MAP_HEIGHT = 481.0;

/*
  Kalibrasyon: baz haritada anakaranın piksel kutusu ile Türkiye'nin coğrafi
  uçları (batı 26.06°, doğu 44.82°, kuzey 42.10°, güney 35.82°) eşlenmiştir.
*/
const ORIGIN_X = 27.54;
const ORIGIN_Y = 18.36;
const PX_PER_LON = 47.8557;
const PX_PER_LAT = 61.6852;
const LON_WEST = 26.06;
const LAT_NORTH = 42.1;

function project(lon, lat) {
  const x = ORIGIN_X + (lon - LON_WEST) * PX_PER_LON;
  const y = ORIGIN_Y + (LAT_NORTH - lat) * PX_PER_LAT;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

// Baz haritadan çıkarılan Türkiye dış hattı (SVG path).
const OUTLINE_PATH = "M506.7,406.7 L498.5,402.1 L498.5,394.7 L489.3,381.9 L509.5,361.7 L509.5,350.7 L504.9,344.2 L495.7,344.2 L492.0,349.7 L481.9,352.5 L479.2,362.6 L471.8,362.6 L466.3,366.3 L464.5,362.6 L453.5,358.9 L448.0,353.4 L431.4,349.7 L412.2,365.4 L404.8,374.5 L403.9,381.0 L392.9,382.8 L385.5,390.1 L358.0,392.0 L341.5,397.5 L325.0,392.0 L304.8,366.3 L286.4,358.9 L269.9,347.9 L260.7,346.1 L235.0,344.2 L232.2,347.0 L232.2,361.7 L228.6,367.2 L226.7,380.0 L211.1,377.3 L207.5,381.0 L194.6,382.8 L192.8,386.5 L168.9,379.1 L160.6,370.9 L160.6,359.8 L157.0,358.0 L157.0,350.7 L148.7,349.7 L146.9,353.4 L139.5,349.7 L135.9,342.4 L119.3,342.4 L118.4,347.0 L110.2,355.3 L108.3,344.2 L91.8,344.2 L88.1,347.9 L77.1,347.9 L78.9,344.2 L106.5,342.4 L109.2,328.6 L88.1,329.6 L73.4,327.7 L70.7,325.0 L75.3,320.4 L87.2,321.3 L87.2,312.1 L78.9,305.7 L70.7,304.8 L70.7,290.1 L63.3,286.4 L74.4,282.7 L74.4,266.2 L66.1,261.6 L56.9,261.6 L53.2,250.6 L45.9,250.6 L42.2,256.1 L36.7,248.8 L30.3,246.0 L31.2,243.3 L39.5,242.3 L36.7,223.1 L43.1,225.8 L47.7,239.6 L51.4,239.6 L53.2,243.3 L60.6,243.3 L61.5,235.0 L54.2,222.1 L65.2,216.6 L65.2,209.3 L57.8,205.6 L59.7,194.6 L54.2,185.4 L61.5,179.9 L63.3,168.9 L51.4,168.0 L29.4,173.5 L26.6,170.7 L32.1,161.6 L32.1,145.0 L39.5,128.5 L39.5,121.2 L56.0,112.0 L55.1,103.7 L34.9,103.7 L32.1,101.0 L32.1,97.3 L46.8,82.6 L46.8,67.9 L63.3,58.8 L59.7,38.6 L53.2,37.6 L50.5,33.0 L53.2,30.3 L60.6,30.3 L64.3,22.9 L78.9,22.9 L84.5,17.4 L93.6,17.4 L102.8,26.6 L121.2,24.8 L127.6,27.5 L125.8,38.6 L131.3,53.2 L148.7,63.3 L150.5,67.0 L156.1,67.0 L174.4,76.2 L187.3,76.2 L214.8,83.5 L224.0,83.5 L229.5,79.9 L258.9,89.0 L277.2,87.2 L284.6,72.5 L301.1,67.0 L304.8,61.5 L313.9,59.7 L321.3,50.5 L337.8,43.1 L352.5,41.3 L370.9,32.1 L387.4,35.8 L435.1,37.6 L446.1,28.5 L450.7,34.9 L450.7,40.4 L460.8,52.3 L481.0,54.2 L490.2,48.7 L493.9,50.5 L494.8,60.6 L506.7,76.2 L519.6,76.2 L523.2,70.7 L528.8,70.7 L534.3,76.2 L539.8,76.2 L543.4,83.5 L552.6,83.5 L558.1,87.2 L569.1,87.2 L571.0,83.5 L574.6,83.5 L578.3,92.7 L591.2,94.6 L613.2,94.6 L622.4,89.0 L651.8,81.7 L660.9,87.2 L692.1,89.0 L697.7,83.5 L705.0,83.5 L710.5,79.9 L716.0,72.5 L721.5,72.5 L736.2,63.3 L744.5,56.9 L747.2,50.5 L793.1,50.5 L796.8,41.3 L804.1,41.3 L806.0,46.8 L811.5,46.8 L815.2,52.3 L821.6,55.1 L824.3,63.3 L833.5,61.5 L836.3,67.9 L847.3,75.3 L852.8,86.3 L849.1,97.3 L849.1,113.8 L854.6,121.2 L854.6,126.7 L864.7,131.3 L884.9,127.6 L904.2,141.4 L893.2,145.0 L893.2,161.6 L890.4,164.3 L878.5,165.2 L878.5,178.1 L884.0,181.8 L884.0,192.8 L891.3,200.1 L893.2,225.8 L902.4,229.5 L895.0,247.9 L895.0,258.9 L903.3,259.8 L905.1,263.5 L913.4,266.2 L913.4,280.9 L925.3,289.2 L926.2,293.8 L916.1,298.3 L903.3,311.2 L899.6,292.8 L886.8,292.8 L879.4,300.2 L851.9,294.7 L824.3,296.5 L819.7,308.4 L811.5,313.0 L808.7,312.1 L806.0,303.8 L798.6,303.8 L782.1,314.9 L767.4,318.5 L728.9,320.4 L686.6,346.1 L664.6,351.6 L635.2,351.6 L618.7,340.6 L604.0,340.6 L571.0,357.1 L552.6,357.1 L548.9,347.9 L530.6,347.9 L527.8,352.5 L526.0,372.7 L531.5,381.9 L517.7,384.6 L516.8,396.6 Z";

// Büyükşehirler ve bilinen il merkezleri (lon, lat).
const CITY_COORDINATES = {
  istanbul: [28.98, 41.01],
  ankara: [32.86, 39.93],
  izmir: [27.14, 38.42],
  bursa: [29.06, 40.19],
  antalya: [30.71, 36.9],
  adana: [35.32, 37.0],
  konya: [32.49, 37.87],
  gaziantep: [37.38, 37.07],
  mersin: [34.64, 36.81],
  kayseri: [35.49, 38.72],
  eskisehir: [30.52, 39.78],
  diyarbakir: [40.24, 37.91],
  samsun: [36.33, 41.29],
  denizli: [29.09, 37.77],
  sanliurfa: [38.79, 37.16],
  malatya: [38.31, 38.35],
  trabzon: [39.72, 41.0],
  erzurum: [41.27, 39.9],
  van: [43.38, 38.49],
  kocaeli: [29.94, 40.77],
  sakarya: [30.4, 40.77],
  mugla: [28.36, 37.21],
  tekirdag: [27.51, 40.98],
  balikesir: [27.88, 39.65],
  manisa: [27.43, 38.61],
  aydin: [27.84, 37.85],
  hatay: [36.16, 36.2],
  kahramanmaras: [36.92, 37.58],
  mardin: [40.74, 37.31],
  ordu: [37.88, 40.98],
};

// Bileşen içi çeviriler — i18n dosyasından bağımsız, anahtar sızması imkansız.
const LABELS = {
  tr: {
    title: "Türkiye Geneli Bölgesel Dağılım",
    subtitle: "Balon büyüklüğü geliri, rengi gecikme oranını gösterir — detay için şehrin üzerine gelin",
    overdue: "Gecikme oranı",
    revenue: "Toplam gelir",
    invoices: "Fatura adedi",
    average: "Ortalama fatura",
    legendLow: "Düşük gecikme",
    legendHigh: "Yüksek gecikme",
    sizeHint: "Balon büyüklüğü = toplam gelir",
    unmatched: "Haritada konumu tanımlı olmayan bölgeler:",
    empty: "Gösterilecek veri bulunamadı.",
  },
  en: {
    title: "Regional Distribution Across Turkey",
    subtitle: "Bubble size shows revenue, color shows overdue rate — hover a city for details",
    overdue: "Overdue rate",
    revenue: "Total revenue",
    invoices: "Invoice count",
    average: "Average invoice",
    legendLow: "Low overdue",
    legendHigh: "High overdue",
    sizeHint: "Bubble size = total revenue",
    unmatched: "Regions without a map location:",
    empty: "No data to display.",
  },
};

// Türkçe karakterleri sadeleştirip şehir adını CITY_COORDINATES anahtarına çevirir.
function normalizeCityKey(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replaceAll("â", "a")
    .replace(/[\s_-]+/g, "");
}

/*
  DB'den gelen ham bölge adlarını (ISTANBUL, sanli_urfa vb.) kullanıcı dostu
  görünüme çevirir: alt çizgi/fazla boşluk temizlenir, Türkçe kurallara göre
  her kelimenin ilk harfi büyütülür.
*/
function prettyCityName(value) {
  const cleaned = String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "—";

  return cleaned
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
    .join(" ");
}

// Gecikme oranını yeşil (iyi) -> kırmızı (kötü) skalasına çevirir.
function overdueColor(rate) {
  const clamped = Math.max(0, Math.min(100, Number(rate) || 0));
  const hue = 130 - (clamped / 100) * 130;
  return `hsl(${hue}, 62%, 46%)`;
}

function formatMoney(value, locale) {
  return Number(value ?? 0).toLocaleString(locale, {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

export default function TurkeyMap({ items = [] }) {
  const { language, locale } = useLanguage();
  const labels = LABELS[language] ?? LABELS.tr;
  const [hovered, setHovered] = useState(null);

  const { markers, unmatched, maxRevenue } = useMemo(() => {
    const matched = [];
    const missing = [];
    let max = 0;

    items.forEach((item) => {
      const rawName = item.regionName ?? item.city ?? item.name;
      const coords = CITY_COORDINATES[normalizeCityKey(rawName)];
      const revenue = Number(item.totalRevenue ?? 0);
      if (revenue > max) max = revenue;

      if (coords) {
        const [x, y] = project(coords[0], coords[1]);
        matched.push({ ...item, cityName: prettyCityName(rawName), x, y, revenue });
      } else {
        missing.push(prettyCityName(rawName));
      }
    });

    return { markers: matched, unmatched: missing, maxRevenue: max };
  }, [items]);

  const radiusFor = (revenue) => {
    if (maxRevenue <= 0) return 12;
    const ratio = Math.sqrt(revenue / maxRevenue); // alan orantılı ölçek
    return 10 + ratio * 24;
  };

  const hoveredMarker = markers.find((m) => m.regionId === hovered) ?? null;

  return (
    <article className="dashboard-card chart-card turkey-map-card">
      <div className="card-heading">
        <h2>{labels.title}</h2>
        <span>{labels.subtitle}</span>
      </div>

      {markers.length > 0 ? (
        <div className="turkey-map-wrap" style={{ position: "relative" }}>
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            role="img"
            aria-label={labels.title}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <path
              d={OUTLINE_PATH}
              fill="var(--surface-muted, rgba(120, 130, 150, 0.12))"
              stroke="var(--line, #c9ced6)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {markers.map((marker) => {
              const r = radiusFor(marker.revenue);
              const isActive = hovered === marker.regionId;

              return (
                <g
                  key={marker.regionId ?? marker.cityName}
                  onMouseEnter={() => setHovered(marker.regionId)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={r}
                    fill={overdueColor(marker.overdueRatePercentage)}
                    fillOpacity={isActive ? 0.9 : 0.65}
                    stroke="var(--surface, #fff)"
                    strokeWidth={isActive ? 3 : 1.5}
                  />
                  <text
                    x={marker.x}
                    y={marker.y - r - 6}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="var(--text, #2c3038)"
                    style={{ pointerEvents: "none" }}
                  >
                    {marker.cityName}
                  </text>
                </g>
              );
            })}
          </svg>

          {hoveredMarker ? (
            <div
              className="turkey-map-tooltip"
              style={{
                position: "absolute",
                left: `${(hoveredMarker.x / MAP_WIDTH) * 100}%`,
                top: `${(hoveredMarker.y / MAP_HEIGHT) * 100}%`,
                transform: "translate(-50%, calc(-100% - 20px))",
                background: "var(--surface, #fff)",
                border: "1px solid var(--line, #d7dbe2)",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                padding: "10px 14px",
                minWidth: 210,
                pointerEvents: "none",
                zIndex: 5,
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ display: "block", marginBottom: 4 }}>
                {hoveredMarker.cityName}
              </strong>
              <div>
                {labels.overdue}:{" "}
                <strong style={{ color: overdueColor(hoveredMarker.overdueRatePercentage) }}>
                  %{Number(hoveredMarker.overdueRatePercentage ?? 0).toFixed(1)}
                </strong>
              </div>
              <div>{labels.revenue}: {formatMoney(hoveredMarker.totalRevenue, locale)}</div>
              <div>
                {labels.invoices}: {Number(hoveredMarker.totalInvoiceCount ?? 0).toLocaleString(locale)}
              </div>
              <div>{labels.average}: {formatMoney(hoveredMarker.averageInvoiceAmount, locale)}</div>
            </div>
          ) : null}

          <div
            className="turkey-map-legend"
            style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, fontSize: 12 }}
          >
            <span>{labels.legendLow}</span>
            <span
              style={{
                flex: "0 0 140px",
                height: 8,
                borderRadius: 4,
                background: "linear-gradient(90deg, hsl(130,62%,46%), hsl(65,62%,46%), hsl(0,62%,46%))",
              }}
            />
            <span>{labels.legendHigh}</span>
            <span style={{ marginLeft: "auto", opacity: 0.7 }}>{labels.sizeHint}</span>
          </div>

          {unmatched.length > 0 ? (
            <p style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
              {labels.unmatched} {unmatched.join(", ")}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="empty-state">{labels.empty}</div>
      )}
    </article>
  );
}
