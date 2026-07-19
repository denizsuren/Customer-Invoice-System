/*
  COMPONENT: UpdateCustomerModal

  Seçilen müşterinin bilgilerini güncellemek için kullanılan modaldır.
  AddCustomerModal ile aynı CustomerForm componentini kullanır.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import CustomerForm from "./CustomerForm.jsx";
import Modal from "../ui/Modal.jsx";

export default function UpdateCustomerModal({ customer, submitting, onClose, onSubmit }) {
  const { t } = useLanguage();

  return (
    <Modal
      open={Boolean(customer)}
      title={t("customers_update_title")}
      subtitle={customer ? t("customers_update_subtitle", { name: customer.name, id: customer.id }) : ""}
      onClose={onClose}
    >
      {customer ? (
        <CustomerForm
          key={customer.id}
          initialValues={customer}
          phoneLocked
          submitLabel={t("customers_update_submit")}
          submitting={submitting}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}
