import { useEffect, useState } from "react";
import "./Toast.css";

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__content">{message}</div>
      <button
        type="button"
        className="toast__close"
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
