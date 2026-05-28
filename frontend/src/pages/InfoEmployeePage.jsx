import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import PageTitle from "../components/common/PageTitle";
import { formatCurrencyVND, getInitials } from "../lib/helpers";
import { useEffect, useState } from "react";
import { decryptRSAWithPassword } from "../utils";

const ICON_MAP = {
  "Employee ID": "badge",
  Name: "person",
  Email: "mail",
  Salary: "paid",
};

export default function InfoEmployeePage() {
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [showSalary, setShowSalary] = useState(false);
  const [decryptedSalary, setDecryptedSalary] = useState(null);
  const [decryptError, setDecryptError] = useState("");
  const [salaryPassword, setSalaryPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

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
      // Lương đã được giải mã (nếu có), hoặc hiển thị "***"
      value:
        decryptedSalary !== null ? formatCurrencyVND(decryptedSalary) : null,
      icon: ICON_MAP["Salary"],
      isHighlight: true,
      isSalary: true,
    },
  ];

  /**
   * Giải mã lương bằng private key tái tạo từ mật khẩu.
   * LUONG trong localStorage là base64 cipher (mã RSA).
   */
  const handleDecryptSalary = async () => {
    if (!salaryPassword) return;
    setDecrypting(true);
    setDecryptError("");
    try {
      const luongBase64 = employeeProfile?.LUONG;
      if (!luongBase64) {
        throw new Error("Không có dữ liệu lương để giải mã.");
      }
      const plaintext = await decryptRSAWithPassword(
        luongBase64,
        salaryPassword,
      );
      setDecryptedSalary(Number(plaintext));
      setShowPasswordPrompt(false);
      setSalaryPassword("");
    } catch {
      setDecryptError("Giải mã thất bại. Vui lòng kiểm tra lại mật khẩu.");
    } finally {
      setDecrypting(false);
    }
  };

  const userInitials = getInitials(employeeProfile.HOTEN);

  return (
    <div className="panel-stack">
      <PageTitle eyebrow="Profile" title="Employee Information" />

      {/* Modal nhập mật khẩu để giải mã lương */}
      {showPasswordPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--surface, #1e1e2e)",
              borderRadius: "12px",
              padding: "2rem",
              minWidth: "340px",
              display: "grid",
              gap: "1rem",
            }}
          >
            <h3 style={{ margin: 0 }}>
              <span
                className="material-symbols-outlined"
                style={{ verticalAlign: "middle", marginRight: 8 }}
              >
                lock_open
              </span>
              Xác nhận mật khẩu
            </h3>
            <p style={{ margin: 0, opacity: 0.7, fontSize: "0.9rem" }}>
              Nhập mật khẩu đăng nhập để giải mã thông tin lương.
            </p>
            <input
              className="input focus-ring"
              type="password"
              placeholder="Mật khẩu"
              value={salaryPassword}
              onChange={(e) => setSalaryPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDecryptSalary()}
              autoFocus
            />
            {decryptError && (
              <p
                style={{
                  color: "var(--error, red)",
                  margin: 0,
                  fontSize: "0.85rem",
                }}
              >
                {decryptError}
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setSalaryPassword("");
                  setDecryptError("");
                }}
              >
                Hủy
              </Button>
              <Button
                className="btn--primary"
                onClick={handleDecryptSalary}
                disabled={decrypting || !salaryPassword}
              >
                {decrypting ? "Đang giải mã..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  {item.isSalary ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        position: "relative",
                      }}
                    >
                      <span
                        className={`profile-stat-value ${item.isHighlight ? "profile-stat-value--highlight" : ""}`}
                        style={{ minWidth: "150px", display: "inline-block" }}
                      >
                        {decryptedSalary !== null
                          ? showSalary
                            ? item.value
                            : "••••••••"
                          : "[Mã hoá RSA]"}
                      </span>
                      {decryptedSalary !== null ? (
                        // Đã giải mã: click để toggle hiển thị/ẩn (không cần giữ chuột)
                        <span
                          className="material-symbols-outlined"
                          style={{
                            cursor: "pointer",
                            fontSize: "20px",
                            userSelect: "none",
                            color: showSalary ? "#4f46e5" : "#9ca3af",
                          }}
                          onClick={() => setShowSalary((s) => !s)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              setShowSalary((s) => !s);
                          }}
                          aria-pressed={showSalary}
                        >
                          {showSalary ? "visibility" : "visibility_off"}
                        </span>
                      ) : (
                        // Chưa giải mã: hiển thị nút mở khóa
                        <span
                          className="material-symbols-outlined"
                          title="Giải mã lương"
                          style={{
                            cursor: "pointer",
                            fontSize: "20px",
                            color: "#9ca3af",
                          }}
                          onClick={() => setShowPasswordPrompt(true)}
                        >
                          lock
                        </span>
                      )}
                    </div>
                  ) : (
                    <span
                      className={`profile-stat-value ${item.isHighlight ? "profile-stat-value--highlight" : ""}`}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
