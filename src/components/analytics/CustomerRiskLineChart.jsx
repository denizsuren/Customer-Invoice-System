import { useLanguage } from "../../context/LanguageContext.jsx";

const CATEGORY_ORDER = ["guvenilir", "normal", "riskli"];

const CATEGORY_CLASS = {
  guvenilir: "safe",
  normal: "normal",
  riskli: "risky",
};

function normalizeCategory(value) {
  const normalized = String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace("ü", "u");

  if (normalized.includes("riskli")) return "riskli";
  if (normalized.includes("orta") || normalized.includes("normal")) return "normal";
  if (normalized.includes("guven") || normalized.includes("güven")) return "guvenilir";

  return "normal";
}

export default function CustomerRiskLineChart({ items = [] }) {
  const { t } = useLanguage();

  const counts = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});

  items.forEach((item) => {
    const category = normalizeCategory(item.category);
    counts[category] += Number(item.count ?? item.customerCount ?? 0);
  });

  const total = CATEGORY_ORDER.reduce((sum, category) => sum + counts[category], 0);

  if (!total) return null;

  const chartItems = CATEGORY_ORDER.map((category) => {
    const count = counts[category];
    const percentage = total ? (count / total) * 100 : 0;

    return {
      category,
      count,
      percentage,
      className: CATEGORY_CLASS[category],
      label: t(`risk_category_${category}`),
    };
  });

  return (
    <article className="dashboard-card chart-card risk-line-card">
      <div className="card-heading">
        <h2>{t("risk_distribution_title")}</h2>
      </div>

      <p className="risk-line-subtitle">{t("risk_distribution_subtitle")}</p>

      <div
        className="risk-line-track"
        role="img"
        aria-label={t("risk_distribution_aria")}
      >
        {chartItems.map((item) =>
          item.count > 0 ? (
            <div
              key={item.category}
              className={`risk-line-segment risk-line-segment--${item.className}`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.label}: ${item.percentage.toFixed(1)}%`}
            />
          ) : null,
        )}
      </div>

      <div className="risk-line-legend">
        {chartItems.map((item) => (
          <div className="risk-line-legend__item" key={item.category}>
            <span className={`risk-line-dot risk-line-dot--${item.className}`} />
            <div>
              <strong>{item.label}</strong>
              <span>
                {item.count.toLocaleString("tr-TR")} · %{item.percentage.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
