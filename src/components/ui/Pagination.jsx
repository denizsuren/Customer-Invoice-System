/*
  COMPONENT: Pagination

  Basit "Önceki / Sonraki" ve sayfa göstergesi. Sayfa numarası 0-indexed
  geliyor (backend Spring Data Pageable ile uyumlu), ekranda 1-indexed gösterilir.
*/

export default function Pagination({ page, totalPages, totalElements, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 0}
      >
        ← Önceki
      </button>

      <span className="pagination-info">
        Sayfa {page + 1} / {totalPages} · {totalElements} kayıt
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Sonraki →
      </button>
    </div>
  );
}
