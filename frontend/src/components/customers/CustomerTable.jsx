/*
  COMPONENT: CustomerTable

  Müşteri listesini tablo halinde gösterir.
  Yükleniyor, boş liste, satıra tıklama ve üç nokta menüsü durumlarını yönetir.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import { getCustomerTagTone } from "../../utils/customerFilter.js";
import Badge from "../ui/Badge.jsx";

export default function CustomerTable({ customers, loading, onOpenCustomer, onOpenMenu }) {
  const { t, tv } = useLanguage();

  return (
    <div className="table-wrap">
      <table className="customer-table">
        <thead>
          <tr>
            <th>{t("customers_table_customer")}</th>
            <th>{t("customers_table_line_type")}</th>
            <th>{t("customers_table_city")}</th>
            <th>{t("customers_table_age_range")}</th>
            <th>{t("customers_table_tag")}</th>
            <th>{t("customers_table_last_invoice")}</th>
            <th>{t("customers_table_status")}</th>
            <th aria-label={t("customers_table_actions_aria")} />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="table-state-row">
              <td colSpan="8">{t("customers_loading")}</td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id} onClick={() => onOpenCustomer(customer)}>
                <td>
                  <strong>{customer.name}</strong> <span>#{customer.id}</span>
                </td>
                <td>{tv(customer.lineType)}</td>
                <td>{tv(customer.city)}</td>
                <td>{customer.ageGroup || "—"}</td>
                <td>
                  <Badge tone={getCustomerTagTone(customer.tag)}>{tv(customer.tag)}</Badge>
                </td>
                <td>{customer.lastInvoice}</td>
                <td>
                  <Badge tone={customer.statusTone}>{tv(customer.status)}</Badge>
                </td>
                <td>
                  <button
                    className="row-menu-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenMenu(customer);
                    }}
                    aria-label={t("customers_row_actions_aria", { name: customer.name })}
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && !customers.length ? <div className="empty-state">{t("customers_empty")}</div> : null}
    </div>
  );
}
