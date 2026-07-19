/*
  COMPONENT: CustomerToolbar

  Müşteriler sayfasının üstündeki arama kutusu, filtreler ve müşteri ekle butonlarını oluşturur.
  Arama state'i bu componentte tutulmaz; `search` ve `onSearch` CustomersPage.jsx'ten gelir.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import Button from "../ui/Button.jsx";

export default function CustomerToolbar({ search, onSearch, onOpenFilters, onAddCustomer }) {
  const { t } = useLanguage();

  return (
    <div className="customer-toolbar">
      <input
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={t("customers_search_placeholder")}
        aria-label={t("customers_search_aria")}
      />
      <Button onClick={onOpenFilters}>{t("customers_filters_button")}</Button>
      <Button variant="primary" onClick={onAddCustomer}>
        {t("customers_add_button")}
      </Button>
    </div>
  );
}
