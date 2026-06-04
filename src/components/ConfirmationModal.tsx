type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmation: boolean) => void;
  title: string;
  message: string;
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div
        className="confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="confirmation-modal-label">Confirm action</p>
        <h3 id="confirmation-modal-title">{title}</h3>
        <p className="confirmation-modal-message">{message}</p>

        <div className="confirmation-modal-actions">
          <button
            type="button"
            className="confirmation-modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="confirmation-modal-confirm"
            onClick={() => onConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
