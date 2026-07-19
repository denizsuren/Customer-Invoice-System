import { useEffect, useState } from "react";
import AddInvoiceModal from "../components/invoices/AddInvoiceModal";
import DeleteInvoiceModal from "../components/invoices/DeleteInvoiceModal";
import InvoiceActionsModal from "../components/invoices/InvoiceActionsModal";
import InvoiceTable from "../components/invoices/InvoiceTable";
import UpdateInvoiceModal from "../components/invoices/UpdateInvoiceModal";
import StatCard from "../components/dashboard/StatCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import StatusMessage from "../components/ui/StatusMessage";
import { useLanguage } from "../context/LanguageContext";
import useInvoices from "../hooks/useInvoices";
import { getInvoiceSummary } from "../services/invoiceService";

/*
  Büyük tutarları Figma'daki gibi kompakt yazar: 14.800.000 -> "14,8M ₺".
  Milyon altı değerler binlik ayraçla tam yazılır.
*/
function compactMoney(value, locale) {
  const numeric = Number(value ?? 0);
  if (numeric >= 1_000_000) {
    return `${(numeric / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}M ₺`;
  }
  return `${numeric.toLocaleString(locale, { maximumFractionDigits: 0 })} ₺`;
}

export default function InvoicesPage() {
  const {
    invoices,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    pendingAction,
    search,
    goToPage,
    reload,
    addInvoice,
    editInvoice,
    removeInvoice,
  } = useInvoices();
  const { t, tv, locale } = useLanguage();
  const [summary, setSummary] = useState(null);

  // Özet kartları listeden bağımsız yüklenir; başarısız olursa kartlar gizlenir.
  useEffect(() => {
    let active = true;
    getInvoiceSummary().then((result) => {
      if (active) setSummary(result);
    });
    return () => {
      active = false;
    };
  }, []);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [menuInvoice, setMenuInvoice] = useState(null);
  const [editInvoiceTarget, setEditInvoiceTarget] = useState(null);
  const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState(null);
  const [notice, setNotice] = useState(null);

  const runSearch = (nextStatus = statusFilter) => {
    search({ query: searchText.trim(), status: nextStatus });
  };

  const handleAdd = async (form) => {
    try {
      await addInvoice(form);
      setAddOpen(false);
      setNotice({
        title: t("invoices_notice_add_title"),
        message: t("invoices_notice_add_message"),
      });
    } catch {
      // Hata zaten useInvoices içindeki error state'i üzerinden gösteriliyor.
    }
  };

  const handleUpdate = async (form) => {
    if (!editInvoiceTarget) return;

    try {
      await editInvoice(editInvoiceTarget.customerId, editInvoiceTarget.invoiceId, form);
      setEditInvoiceTarget(null);
      setNotice({
        title: t("invoices_notice_update_title"),
        message: t("invoices_notice_update_message", { id: editInvoiceTarget.id }),
      });
    } catch {
      // Hata zaten error state'inde.
    }
  };

  const handleDelete = async () => {
    if (!deleteInvoiceTarget) return;

    try {
      const deletedId = deleteInvoiceTarget.id;
      await removeInvoice(deleteInvoiceTarget.customerId, deleteInvoiceTarget.invoiceId);
      setDeleteInvoiceTarget(null);
      setNotice({
        title: t("invoices_notice_delete_title"),
        message: t("invoices_notice_delete_message", { id: deletedId }),
      });
    } catch {
      // Hata zaten error state'inde.
    }
  };

  return (
    <section className="page-content">
      <div className="page-heading">
        <h1>{t("invoices_title")}</h1>
        <p>{t("invoices_subtitle")}</p>
      </div>

      {error ? (
        <StatusMessage tone="danger" action={<Button onClick={reload}>{t("button_retry")}</Button>}>
          {tv(error)}
        </StatusMessage>
      ) : null}

      {summary ? (
        <div className="stats-grid">
          <StatCard
            label={t("invoices_stat_annual")}
            value={compactMoney(summary.expectedAnnualRevenue, locale)}
            change={t("invoices_stat_annual_sub")}
          />
          <StatCard
            label={t("invoices_stat_mobile")}
            value={`%${Number(summary.mobileChannelRate ?? 0).toLocaleString(locale, { maximumFractionDigits: 1 })}`}
            change={`${summary.mobileTopRegion} ${t("invoices_stat_mobile_sub")}`}
          />
          <StatCard
            tone="warning"
            label={t("invoices_stat_overdue")}
            value={Number(summary.overdueCount ?? 0).toLocaleString(locale)}
            change={t("invoices_stat_overdue_sub")}
          />
          <StatCard
            tone="danger"
            label={t("invoices_stat_overage")}
            value={Number(summary.overageCount ?? 0).toLocaleString(locale)}
            change={t("invoices_stat_overage_sub").replace(
              "{amount}",
              Number(summary.averageOverageAmount ?? 0).toLocaleString(locale),
            )}
          />
        </div>
      ) : null}

      <div className="customer-toolbar invoice-toolbar">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") runSearch();
          }}
          placeholder={t("invoices_search_placeholder")}
          aria-label={t("invoices_search_aria")}
        />
        <select
          className="invoice-toolbar__filter"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            runSearch(event.target.value);
          }}
        >
          <option value="">{t("invoices_status_all")}</option>
          <option value="PAID">{t("invoices_status_paid")}</option>
          <option value="UNPAID">{t("invoices_status_pending")}</option>
          <option value="OVERDUE">{t("invoices_status_overdue")}</option>
        </select>
        <Button onClick={() => runSearch()}>{t("invoices_search_button")}</Button>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          {t("invoices_add_button")}
        </Button>
      </div>

      <InvoiceTable
        invoices={invoices}
        loading={loading}
        onOpenMenu={(invoice) => setMenuInvoice(invoice)}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={goToPage}
      />

      <AddInvoiceModal
        open={addOpen}
        submitting={pendingAction === "create"}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />

      <InvoiceActionsModal
        invoice={menuInvoice}
        onClose={() => setMenuInvoice(null)}
        onEdit={() => {
          setEditInvoiceTarget(menuInvoice);
          setMenuInvoice(null);
        }}
        onDelete={() => {
          setDeleteInvoiceTarget(menuInvoice);
          setMenuInvoice(null);
        }}
      />

      <UpdateInvoiceModal
        invoice={editInvoiceTarget}
        submitting={pendingAction === "update"}
        onClose={() => setEditInvoiceTarget(null)}
        onSubmit={handleUpdate}
      />

      <DeleteInvoiceModal
        invoice={deleteInvoiceTarget}
        deleting={pendingAction === "delete"}
        onClose={() => setDeleteInvoiceTarget(null)}
        onConfirm={handleDelete}
      />

      <Modal
        open={Boolean(notice)}
        title={notice?.title ?? t("invoices_notice_default_title")}
        subtitle={notice?.message}
        onClose={() => setNotice(null)}
        width="420px"
        footer={
          <Button variant="primary" onClick={() => setNotice(null)}>
            {t("button_ok")}
          </Button>
        }
      >
        <div className="success-symbol">✓</div>
      </Modal>
    </section>
  );
}
