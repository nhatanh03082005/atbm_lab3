export default function DeleteConfirmModal({
  open,
  entityName = "item",
  itemId,
  onCancel,
  onConfirm,
  deleting = false,
}) {
  const title = `Delete ${entityName}`;
  const subtitle = itemId
    ? `This action will permanently delete ${entityName} ${itemId}.`
    : `This action will permanently delete this ${entityName}.`;

  const handleClose = () => {
    if (!deleting) {
      onCancel();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 bg-white px-6 pb-4 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-red-600">{title}</h2>
                {itemId ? (
                  <span className="inline-flex items-center rounded-md border border-red-600 bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                    {itemId}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={deleting}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Close"
              title="Close"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                close
              </span>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <p className="m-0 text-sm text-gray-600">{subtitle}</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="material-symbols-outlined text-amber-600"
              style={{ fontSize: 20 }}
              aria-hidden="true"
            >
              warning
            </span>
            <p className="m-0 text-sm text-gray-600">
              You cannot undo this operation after deletion.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#b91c1c")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#dc2626")}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
