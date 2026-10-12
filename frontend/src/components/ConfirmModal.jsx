function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isProcessing }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        <h3 id="modal-title" className="modal-heading">
          {title || "Confirm Action"}
        </h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel-btn"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-confirm-btn"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
