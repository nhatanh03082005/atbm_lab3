import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toast from "../components/ui/Toast";
import { ROUTES } from "../lib/routes";
import { registerEmployeeApi } from "../services/authService";

export default function RegisterEmployeePage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    MANV: "",
    HOTEN: "",
    EMAIL: "",
    TENDN: "",
    MATKHAU: "",
    MATKHAU_CONFIRM: "",
  });

  const handleChange = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.MANV ||
      !form.HOTEN ||
      !form.EMAIL ||
      !form.TENDN ||
      !form.MATKHAU ||
      !form.MATKHAU_CONFIRM
    ) {
      setError("Vui lòng nhập đầy đủ các trường bắt buộc");
      return;
    }

    if (form.MATKHAU !== form.MATKHAU_CONFIRM) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      const response = await registerEmployeeApi({
        MANV: form.MANV,
        HOTEN: form.HOTEN,
        EMAIL: form.EMAIL,
        TENDN: form.TENDN,
        MATKHAU: form.MATKHAU,
      });

      setSuccess("Đăng ký thành công");
      setForm({
        MANV: "",
        HOTEN: "",
        EMAIL: "",
        TENDN: "",
        MATKHAU: "",
        MATKHAU_CONFIRM: "",
      });
    } catch (err) {
      if (err.errorCode === 1001) {
        setError("Mã nhân viên đã tồn tại");
      } else if (err.errorCode === 1002) {
        setError("Tên đăng nhập đã tồn tại");
      } else {
        setError(err.message || "Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card login-card--wide">
        <section className="login-brand">
          <div className="login-brand__icon">
            <span
              className="material-symbols-outlined"
              data-weight="fill"
              style={{ fontSize: "32px" }}
            >
              person_add
            </span>
          </div>
          <h1 className="login-brand__title">Đăng ký nhân viên</h1>
          <p className="login-brand__subtitle">
            Tạo tài khoản nhân viên mới để sử dụng hệ thống.
          </p>
        </section>

        {success && (
          <Toast
            message={success}
            type="success"
            onClose={() => setSuccess("")}
          />
        )}
        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <Input
              label="Mã nhân viên"
              placeholder="VD: NV001"
              value={form.MANV}
              onChange={handleChange("MANV")}
              required
            />
            <Input
              label="Họ tên"
              placeholder="Nhập họ tên"
              value={form.HOTEN}
              onChange={handleChange("HOTEN")}
              required
            />
          </div>
          <div className="form-grid-2">
            <Input
              label="Email"
              placeholder="example@company.com"
              value={form.EMAIL}
              onChange={handleChange("EMAIL")}
              required
            />
            <Input
              label="Tên đăng nhập"
              placeholder="Nhập username"
              value={form.TENDN}
              onChange={handleChange("TENDN")}
              required
            />
          </div>
          <div className="form-grid-2">
            <label className="form-field">
              <span>Mật khẩu</span>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--outline)",
                  }}
                >
                  key
                </span>
                <input
                  className="input focus-ring"
                  style={{ paddingRight: "3rem", paddingLeft: "2.5rem" }}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={form.MATKHAU}
                  onChange={handleChange("MATKHAU")}
                  required
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </label>
            <label className="form-field">
              <span>Xác nhận mật khẩu</span>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--outline)",
                  }}
                >
                  key
                </span>
                <input
                  className="input focus-ring"
                  style={{ paddingRight: "3rem", paddingLeft: "2.5rem" }}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={form.MATKHAU_CONFIRM}
                  onChange={handleChange("MATKHAU_CONFIRM")}
                  required
                />
              </div>
            </label>
          </div>

          {/* Notifications handled by Toast components above */}

          <Button
            type="submit"
            className="btn--primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>{loading ? "Đang đăng ký..." : "Đăng ký"}</span>
          </Button>
        </form>

        <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
          <Button
            variant="outline"
            type="button"
            style={{ width: "100%" }}
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </main>
    </div>
  );
}
