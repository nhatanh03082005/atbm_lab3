import { cx } from "../../lib/helpers";

export default function Input({
  label,
  helperText,
  className,
  rightElement,
  ...props
}) {
  return (
    <label className={cx("form-field", className)}>
      {label ? <span>{label}</span> : null}
      <div style={{ position: "relative" }}>
        <input className="input focus-ring" {...props} />
        {rightElement ? rightElement : null}
      </div>
      {helperText ? (
        <small style={{ color: "var(--on-surface-variant)" }}>
          {helperText}
        </small>
      ) : null}
    </label>
  );
}
