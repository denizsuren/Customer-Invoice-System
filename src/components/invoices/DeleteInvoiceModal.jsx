import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";

export default function DeleteInvoiceModal({ invoice, deleting, onClose, onConfirm }) {
  return (
    <Modal
      open={Boolean(invoice)}
      title="Faturayı Sil"
      subtitle="Bu işlem geri alınamaz."
      onClose={onClose}
      width="460px"
      footer={
        <>
          <Button onClick={onClose} disabled={deleting}>
            Vazgeç
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Siliniyor..." : "Faturayı Sil"}
          </Button>
        </>
      }
    >
      {invoice ? (
        <div className="delete-confirmation">
          <strong>{invoice.id}</strong>
          <span>{invoice.customerName}</span>
          <span>{invoice.amount}</span>
        </div>
      ) : null}
    </Modal>
  );
}
