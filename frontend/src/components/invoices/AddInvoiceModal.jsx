import { useLanguage } from "../../context/LanguageContext.jsx";
import Modal from "../ui/Modal.jsx";
import InvoiceForm from "./InvoiceForm.jsx";

export default function AddInvoiceModal({ open, submitting, onClose, onSubmit }) {
  const { t } = useLanguage();

  return (
    <Modal
      open={open}
      title={t("invoices_add_modal_title")}
      subtitle={t("invoices_add_modal_subtitle")}
      onClose={onClose}
    >
      <InvoiceForm
        submitLabel={t("invoices_add_submit")}
        submitting={submitting}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
