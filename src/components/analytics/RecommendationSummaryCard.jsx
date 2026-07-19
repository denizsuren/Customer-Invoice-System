/*
  COMPONENT: RecommendationSummaryCard

  Risk analiz motorunun ürettiği tüm öneri tiplerini (recommend_action) ve
  her birinin kaç müşteriyi kapsadığını gösterir. Bir öneriye tıklanınca
  RecommendationListCard'ın o tipi göstermesini sağlar.

  TASARIM: overage-tier-pill sınıfını (analytics.css) yeniden kullanır.
*/

export default function RecommendationSummaryCard({ summary = [], selectedAction, onSelect }) {
  if (!summary.length) return null;

  return (
    <article className="dashboard-card chart-card">
      <div className="card-heading">
        <h2>Öneri Dağılımı</h2>
      </div>

      <div className="overage-list">
        {summary.map((item) => (
          <button
            type="button"
            key={item.action}
            onClick={() => onSelect(item.action)}
            className="overage-row"
            style={{
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              border: item.action === selectedAction ? "2px solid #7c5cff" : undefined,
              background: "none",
            }}
          >
            <div className="overage-row__left">
              <strong>{item.label}</strong>
            </div>
            <div className="overage-row__right">
              <span className={`overage-tier-pill overage-tier-pill--${item.tone}`}>
                {item.count} müşteri
              </span>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}
