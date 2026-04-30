export default function PageTitle({ title, subtitle, eyebrow, actions }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? (
          <p className="page-header__eyebrow label-caps">{eyebrow}</p>
        ) : null}
        <h1 className="page-header__title">{title}</h1>
        {subtitle ? (
          <p className="page-header__subtitle body-sm">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="page-toolbar">{actions}</div> : null}
    </div>
  );
}
