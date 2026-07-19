/*
  COMPONENT: DeleteCustomerModal

  Bir müşteriyi silmeden önce kullanıcıdan son onayı alır.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";

export default function DeleteCustomerModal({ customer, deleting, onClose, onConfirm }) {
  const { t } = useLanguage();

  return (
    <Modal
      open={Boolean(customer)}
      title={t("customers_delete_title")}
      subtitle={t("customers_delete_subtitle")}
      onClose={onClose}
      width="460px"
      footer={
        <>
          <Button onClick={onClose} disabled={deleting}>
            {t("button_cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? t("customers_delete_loading") : t("customers_delete_confirm")}
          </Button>
        </>
      }
    >
      {customer ? (
        <div className="delete-confirmation">
          <strong>{customer.name}</strong>
          <span>{t("customers_delete_id", { id: customer.id })}</span>
          <span>{customer.phone}</span>
        </div>
      ) : null}
    </Modal>
  );
}
