/*
  COMPONENT: InvoiceTable

  Backend veya mock kaynaktan gelen faturaları tablo halinde gösterir.
  Her satırda bir "⋯" işlem menüsü butonu var (güncelle/sil için).
  Paket kolonu, faturanın hangi ürüne ait olduğunu gösterir.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import Badge from "../ui/Badge.jsx";

export default function InvoiceTable({ invoices, loading, onOpenMenu }) {
  const { t, tv } = useLanguage();

  return (
    <div className="invoice-table-wrap">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>{t("invoices_table_id")}</th>
            <th>{t("invoices_table_customer")}</th>
            <th>{t("invoices_table_invoice_date")}</th>
            <th>{t("invoices_table_due_date")}</th>
            <th>{t("invoices_table_amount")}</th>
            <th>{t("invoices_table_package")}</th>
            <th>{t("invoices_table_status")}</th>
            <th>{t("invoices_table_action")}</th>
            <th aria-label={t("invoices_table_actions_aria")} />
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr className="invoice-state-row">
              <td colSpan="9">{t("invoices_loading")}</td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <strong>{invoice.id}</strong>
                </td>
                <td>{invoice.customerName}</td>
                <td>{invoice.invoiceDate}</td>
                <td>{invoice.dueDate}</td>
                <td>
                  <strong>{invoice.amount}</strong>
                </td>
                <td>{invoice.product?.name ?? invoice.productName ?? "—"}</td>
                <td>
                  <Badge tone={invoice.statusTone}>{tv(invoice.status)}</Badge>
                </td>
                <td
                  className={
                    invoice.actionRecommendation === "—"
                      ? "invoice-action invoice-action--empty"
                      : "invoice-action"
                  }
                >
                  {tv(invoice.actionRecommendation)}
                </td>
                <td>
                  <button
                    className="row-menu-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenMenu(invoice);
                    }}
                    aria-label={t("invoices_row_actions_aria", { id: invoice.id })}
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && !invoices.length ? (
        <div className="invoice-empty-state">{t("invoices_empty")}</div>
      ) : null}
    </div>
  );
}
