import { useLanguage } from "../../context/LanguageContext.jsx";
import Modal from "../ui/Modal.jsx";
import InvoiceForm from "./InvoiceForm.jsx";

export default function UpdateInvoiceModal({ invoice, submitting, onClose, onSubmit }) {
  const { t } = useLanguage();

  return (
    <Modal
      open={Boolean(invoice)}
      title={t("invoices_update_modal_title")}
      subtitle={invoice ? `${invoice.customerName} — ${invoice.id}` : ""}
      onClose={onClose}
    >
      {invoice ? (
        <InvoiceForm
          key={invoice.invoiceId}
          initialValues={{
            productId: invoice.product?.productId ?? "",
            paymentChannel: invoice.paymentChannel ?? "online",
            invoiceAmount: invoice.invoiceAmount ?? "",
            dueAmount: invoice.dueAmount ?? "",
            overageAmount: invoice.overageAmount ?? "0",
            invoiceDate: invoice.rawInvoiceDate ?? "",
            dueDate: invoice.rawDueDate ?? "",
            paymentDate: invoice.rawPaymentDate ?? "",
          }}
          lockedCustomer={{ customerId: invoice.customerId, customerName: invoice.customerName }}
          submitLabel={t("invoices_update_submit")}
          submitting={submitting}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}
