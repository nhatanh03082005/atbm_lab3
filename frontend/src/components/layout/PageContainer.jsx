import { cx } from "../../lib/helpers";

export default function PageContainer({ children, className }) {
  return <div className={cx("page-container", className)}>{children}</div>;
}
