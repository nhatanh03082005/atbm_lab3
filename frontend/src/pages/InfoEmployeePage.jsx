import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import PageTitle from "../components/common/PageTitle";
import { formatCurrencyVND, getInitials } from "../lib/helpers";
import { useEffect, useState } from "react";

const ICON_MAP = {
  "Employee ID": "badge",
  Name: "person",
  Email: "mail",
  Salary: "paid",
};

export default function InfoEmployeePage() {
  const [employeeProfile, setEmployeeProfile] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setEmployeeProfile(JSON.parse(user));
    }
  }, []);

  if (!employeeProfile) return <p>Loading...</p>;

  const summaryItems = [
    {
      label: "Employee ID",
      value: employeeProfile.MANV,
      icon: ICON_MAP["Employee ID"],
    },
    {
      label: "Name",
      value: employeeProfile.HOTEN,
      icon: ICON_MAP["Name"],
    },
    { label: "Email", value: employeeProfile.EMAIL, icon: ICON_MAP["Email"] },
    {
      label: "Salary",
      value: formatCurrencyVND(employeeProfile.LUONGCB),
      icon: ICON_MAP["Salary"],
      isHighlight: true,
    },
  ];

  const userInitials = getInitials(employeeProfile.HOTEN);

  return (
    <div className="panel-stack">
      <PageTitle eyebrow="Profile" title="Employee Information" />

      <div className="profile-layout-modern">
        {/* Left Side: Identity */}
        <div className="profile-sidebar-modern">
          <div className="profile-avatar-modern">{userInitials}</div>
          <h2 className="profile-name-modern">{employeeProfile.HOTEN}</h2>
          <p className="profile-role-modern">Staff Member</p>
          <div className="profile-status-modern">
            <Badge variant="success">Active</Badge>
          </div>
        </div>

        {/* Right Side: Details Grid */}
        <div className="profile-details-modern">
          <h3 className="profile-details-title">Account Details</h3>
          <div className="profile-stats-grid">
            {summaryItems.map((item) => (
              <div key={item.label} className="profile-stat-box">
                <div className="profile-stat-icon">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="profile-stat-content">
                  <span className="profile-stat-label">{item.label}</span>
                  <span
                    className={`profile-stat-value ${item.isHighlight ? "profile-stat-value--highlight" : ""}`}
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
