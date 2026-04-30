import Button from "./Button";

export default function Modal({
  open,
  title,
  subtitle,
  ariaLabel,
  children,
  onClose,
  footer,
  header,
  variant,
  className,
  headerClassName,
  showCloseButton = false,
}) {
  if (!open) {
    return null;
  }

  const resolvedAriaLabel =
    typeof title === "string" ? title : ariaLabel || "Dialog";

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`modal ${variant === "premium" ? "modal--premium" : ""} ${className ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={resolvedAriaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`modal__header ${headerClassName ?? ""}`.trim()}>
          {header ? (
            header
          ) : (
            <>
              <div className="modal__header-row">
                <h2 className="modal__title">{title}</h2>
                {showCloseButton ? (
                  <button
                    type="button"
                    className="modal__close"
                    onClick={onClose}
                    aria-label="Close"
                    title="Close"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                ) : null}
              </div>
              {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
            </>
          )}
        </div>
        <div className="modal__body">{children}</div>
        <div className="modal__footer">
          {footer ?? (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
