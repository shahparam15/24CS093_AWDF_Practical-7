function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = "info", message } = toast;

  return (
    <div
      className={`toast-notification toast-${type}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="toast-icon" aria-hidden="true">
        {type === "success" && "✓"}
        {type === "error" && "⚠️"}
        {type === "info" && "ℹ️"}
      </span>
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}

export default Toast;
