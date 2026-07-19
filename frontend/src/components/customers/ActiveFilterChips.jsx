/*
  COMPONENT: ActiveFilterChips

  Müşteriler sayfasında arama/filtre sonucunun hemen altında görünen
  aktif filtre chiplerini ve toplam sonuç sayısını gösterir.

  `chips` array'i artık { key, label } objeleriyle gelir.
  key filtre state'ini sıfırlamak, label ise seçili dile göre ekranda göstermek içindir.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ActiveFilterChips({ chips, resultCount, onRemove, onClear }) {
  const { t } = useLanguage();

  return (
    <div className="active-filters">
      <span>{t("customers_active_filters")}</span>
      {chips.map((chip) => (
        <button key={chip.key} className="filter-chip" onClick={() => onRemove(chip.key)}>
          {chip.label} <span>×</span>
        </button>
      ))}

      {chips.length ? (
        <button className="clear-button" onClick={onClear}>
          {t("customers_clear_filters")}
        </button>
      ) : null}
      <span className="result-count">{t("customers_result_count", { count: resultCount })}</span>
    </div>
  );
}
