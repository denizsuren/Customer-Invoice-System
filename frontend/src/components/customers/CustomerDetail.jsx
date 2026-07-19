/*
  COMPONENT: CustomerDetail

  Seçilen müşterinin temel bilgilerini gösterir.
  Faturalı müşterilerde "Fatura Özeti", faturasız müşterilerde
  "Yükleme Geçmişi" (recharge) bölümü gösterilir — ikisi karşılıklı dışlar.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import { getCustomerTagTone } from "../../utils/customerFilter.js";
import Badge from "../ui/Badge.jsx";

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";

  return Number(value).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

function getInvoiceDate(invoice) {
  return invoice.invoiceDate ?? invoice.dueDate ?? invoice.paymentDate ?? "";
}

function formatInvoiceMonth(invoice, locale) {
  const dateValue = getInvoiceDate(invoice);
  if (!dateValue) return "—";

  return new Date(dateValue).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

// Not: karşılaştırmalar tam eşleşme (===) ile yapılıyor — "UNPAID" içinde "PAID"
// geçtiği için .includes() kullanmak yanlış eşleşmeye yol açıyordu.
function normalizePaymentStatus(status, dueDate, dueAmount) {
  const value = String(status ?? "").toUpperCase();
  const hasDebt = Number(dueAmount ?? 0) > 0;
  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

  if (value === "PAID" || value.includes("ÖDENDİ")) return "Ödendi";
  if (value === "OVERDUE" || value.includes("LATE") || (hasDebt && isOverdue)) {
    return "Gecikmiş Ödeme";
  }
  if (value === "UNPAID" || value.includes("PENDING") || hasDebt) return "Bekliyor";

  return status || "Yeni kayıt";
}

function getStatusTone(statusLabel) {
  if (statusLabel === "Ödendi") return "success";
  if (statusLabel === "Gecikmiş Ödeme") return "danger";
  if (statusLabel === "Yeni kayıt") return "success";

  return "warning";
}

function getLatestSixInvoices(invoices = []) {
  return [...invoices]
    .filter((invoice) => invoice.invoiceId && invoice.invoiceAmount !== null && invoice.invoiceAmount !== undefined)
    .sort((first, second) => new Date(getInvoiceDate(second)) - new Date(getInvoiceDate(first)))
    .slice(0, 6);
}

function formatRechargeDate(recharge, locale) {
  if (!recharge.rechargeDate) return "—";

  return new Date(recharge.rechargeDate).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getRechargeChannelLabel(channel) {
  const value = String(channel ?? "").toLowerCase();
  if (value === "mobile_app") return "Mobil Uygulama";
  if (value === "online") return "Online";
  if (value === "bayi") return "Bayi";
  return channel || "—";
}

export default function CustomerDetail({ customer, loadingExtra = false }) {
  const { t, tv, locale } = useLanguage();

  if (!customer) return null;

  const invoices = getLatestSixInvoices(customer.invoices);
  const recharges = customer.recharges ?? [];
  const isPrepaid = customer.lineType === "Faturasız";

  return (
    <div className="customer-detail">
      <div className="customer-detail__top">
        <div className="avatar avatar--large">
          {customer.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div>
          <strong>{customer.phone}</strong>
          <span>{customer.email}</span>
          <Badge tone={getCustomerTagTone(customer.tag)}>
            {t("customers_detail_badge", { tag: tv(customer.tag) })}
          </Badge>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <span>{t("customers_table_line_type")}</span>
          <strong>{tv(customer.lineType)}</strong>
        </div>
        <div>
          <span>{t("customers_detail_package")}</span>
          <strong>{tv(customer.packageName)}</strong>
        </div>
        <div>
          <span>{t("customers_table_city")}</span>
          <strong>{tv(customer.city)}</strong>
        </div>
        <div>
          <span>{t("customers_table_age_range")}</span>
          <strong>{customer.ageGroup || "—"}</strong>
        </div>
      </div>

      {isPrepaid ? (
        <>
          <h3>Yükleme Geçmişi</h3>
          <div className="invoice-list">
            {loadingExtra ? (
              <div>
                <span>Yükleniyor...</span>
                <strong>—</strong>
                <Badge tone="neutral">…</Badge>
              </div>
            ) : recharges.length ? (
              recharges.map((recharge) => (
                <div key={recharge.rechargeId}>
                  <span>{formatRechargeDate(recharge, locale)}</span>
                  <strong>{formatMoney(recharge.rechargeAmount)}</strong>
                  <Badge tone="neutral">{getRechargeChannelLabel(recharge.rechargeChannel)}</Badge>
                </div>
              ))
            ) : (
              <div>
                <span>Yükleme kaydı bulunamadı</span>
                <strong>—</strong>
                <Badge tone="neutral">—</Badge>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <h3>{t("customers_detail_invoice_summary")}</h3>
          <div className="invoice-list">
            {loadingExtra ? (
              <div>
                <span>{t("customers_detail_loading_invoices")}</span>
                <strong>—</strong>
                <Badge tone="neutral">…</Badge>
              </div>
            ) : invoices.length ? (
              invoices.map((invoice) => {
                const status = normalizePaymentStatus(
                  invoice.paymentStatus,
                  invoice.dueDate,
                  invoice.dueAmount,
                );

                return (
                  <div key={invoice.invoiceId ?? `${invoice.customerId}-${getInvoiceDate(invoice)}`}>
                    <span>{formatInvoiceMonth(invoice, locale)}</span>
                    <strong>{formatMoney(invoice.invoiceAmount)}</strong>
                    <Badge tone={getStatusTone(status)}>{tv(status)}</Badge>
                  </div>
                );
              })
            ) : (
              <div>
                <span>{t("customers_detail_no_invoices")}</span>
                <strong>—</strong>
                <Badge tone="neutral">—</Badge>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
