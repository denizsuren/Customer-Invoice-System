import Modal from "../ui/Modal.jsx";

export default function InvoiceActionsModal({ invoice, onClose, onEdit, onDelete }) {
  return (
    <Modal open={Boolean(invoice)} title="Fatura İşlemleri" subtitle={invoice?.id} onClose={onClose} width="360px">
      <div className="menu-list">
        <button onClick={onEdit}>Güncelle</button>
        <button className="menu-list__danger" onClick={onDelete}>
          Sil
        </button>
      </div>
    </Modal>
  );
}
