/*
  COMPONENT: RecommendationListCard

  Seçilen öneri tipine (action) ait müşterileri sayfalı şekilde listeler.
  Kendi verisini kendi çeker (self-contained) — action değiştiğinde
  otomatik olarak ilk sayfadan yeniden yükler.
*/

import { useEffect, useState } from "react";
import { getRecommendationList } from "../../services/analyticsService.js";
import Pagination from "../ui/Pagination.jsx";

export default function RecommendationListCard({ action, actionLabel }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!action) return undefined;

    let active = true;

    const timeoutId = window.setTimeout(() => {
      setLoading(true);

      getRecommendationList(action, 0, 10)
        .then((result) => {
          if (!active) return;

          setItems(result.items ?? []);
          setTotalElements(result.totalElements ?? 0);
          setTotalPages(result.totalPages ?? 1);
        })
        .catch(() => {
          if (!active) return;
          setItems([]);
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [action]);


  const goToPage = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages) return;
    setLoading(true);
    getRecommendationList(action, nextPage, 10).then((result) => {
      setItems(result.items);
      setPage(result.page);
      setLoading(false);
    });
  };

  if (!action) return null;

  return (
    <article className="dashboard-card chart-card">
      <div className="card-heading">
        <h2>{actionLabel} — Müşteri Listesi</h2>
      </div>

      {loading ? (
        <div className="empty-state">Yükleniyor...</div>
      ) : (
        <div className="overage-list">
          {items.map((item) => (
            <div className="overage-row" key={item.customerId}>
              <div className="overage-row__left">
                <strong>{item.customerName}</strong>
                <span>#{item.customerId}</span>
              </div>
              <div className="overage-row__right">
                <span className="overage-tier-pill">
                  {item.behaviorCategory ?? "—"}
                  {item.riskScore != null ? ` · ${item.riskScore}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={goToPage} />
    </article>
  );
}
