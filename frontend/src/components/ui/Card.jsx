import { cx } from "../../lib/helpers";

export default function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  flat = false,
}) {
  return (
    <section className={cx("card", flat && "card--flat", className)}>
      {(title || subtitle || actions) && (
        <header className="card__header">
          <div>
            {title ? <h2 className="card__title">{title}</h2> : null}
            {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="page-toolbar">{actions}</div> : null}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
