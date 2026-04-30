import Button from "../ui/Button";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state card">
      <div className="empty-state__icon material-symbols-outlined">inbox</div>
      <h3 className="title-sm">{title}</h3>
      {description ? <p className="body-sm">{description}</p> : null}
      {actionLabel ? (
        <div style={{ marginTop: "1rem" }}>
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
