import { cx } from "../../lib/helpers";

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...props
}) {
  return (
    <Component
      className={cx("btn", `btn--${variant}`, `btn--${size}`, className)}
      type={Component === "button" ? type : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}
