import { useEffect, useRef } from "react";

export default function EditClassModal({
  open,
  classId,
  classNameValue,
  onChangeClassName,
  onClose,
  onUpdate,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit Class ${classId || ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Class
                </h2>
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {classId}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Cập nhật tên cho lớp học này.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
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

        <div className="px-6 pb-6">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700">
              Class Name
            </span>
            <div className="relative mt-2">
              <input
                ref={inputRef}
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={classNameValue}
                onChange={(e) => onChangeClassName(e.target.value)}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                >
                  edit
                </span>
              </span>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            onClick={onUpdate}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
