import Card from "../ui/Card";
import Badge from "../ui/Badge";

export default function StatCard({ icon, label, value, helper }) {
  return (
    <Card className="stat-card">
      <span className="material-symbols-outlined stat-card__icon">{icon}</span>
      <div className="stat-card__badge">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "18px" }}
        >
          {icon}
        </span>
      </div>
      <p className="stat-card__label">{label}</p>
      <h3 className="stat-card__value">{value}</h3>
      <p className="stat-card__helper">{helper}</p>
      <div style={{ marginTop: "0.75rem" }}>
        <Badge variant="encrypted">Secure</Badge>
      </div>
    </Card>
  );
}
