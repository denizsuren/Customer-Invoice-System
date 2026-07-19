/*
  COMPONENT: CustomerActionsModal

  Tablodaki üç nokta butonuna basıldığında açılan işlem menüsüdür.
*/

import { useLanguage } from "../../context/LanguageContext.jsx";
import Modal from "../ui/Modal.jsx";

export default function CustomerActionsModal({
  customer,
  onClose,
  onOpenDetail,
  onEdit,
  onDelete,
}) {
  const { t } = useLanguage();

  return (
    <Modal
      open={Boolean(customer)}
      title={t("customers_actions_title")}
      subtitle={customer?.name}
      onClose={onClose}
      width="360px"
    >
      <div className="menu-list">
        <button onClick={onOpenDetail}>{t("customers_actions_open_detail")}</button>
        <button onClick={onEdit}>{t("customers_actions_update")}</button>
        <button className="menu-list__danger" onClick={onDelete}>
          {t("customers_actions_delete")}
        </button>
      </div>
    </Modal>
  );
}
