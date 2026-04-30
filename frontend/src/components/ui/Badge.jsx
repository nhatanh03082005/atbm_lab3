import { cx } from "../../lib/helpers";

const badgeVariants = {
  active: "badge--active",
  encrypted: "badge--encrypted",
  pending: "badge--pending",
  draft: "badge--draft",
  archived: "badge--archived",
  danger: "badge--danger",
  success: "badge--success",
};

export default function Badge({ variant = "active", children, className }) {
  return (
    <span className={cx("badge", badgeVariants[variant], className)}>
      {children}
    </span>
  );
}
