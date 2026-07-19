/*
  COMPONENT: AddCustomerModal

  Yeni müşteri ekleme modalını oluşturur.
  Modalın dış çerçevesini `Modal`, form alanlarını ise `CustomerForm` yönetir.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import CustomerForm from "./CustomerForm.jsx";
import Modal from "../ui/Modal.jsx";

export default function AddCustomerModal({ open, submitting, onClose, onSubmit }) {
  const { t } = useLanguage();

  return (
    <Modal
      open={open}
      title={t("customers_add_title")}
      subtitle={t("customers_add_subtitle")}
      onClose={onClose}
    >
      <CustomerForm
        submitLabel={t("customers_add_submit")}
        submitting={submitting}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
