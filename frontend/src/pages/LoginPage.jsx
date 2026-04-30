import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { APP_NAME, APP_TAGLINE, LOGIN_HIGHLIGHTS } from "../lib/constants.js";
import { ROUTES, setAuthenticated, setCurrentUserName } from "../lib/routes.js";
import { loginApi } from "../services/authService.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginApi(form.username, form.password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setAuthenticated(true);
      setCurrentUserName(data.user?.HOTEN || form.username);

      navigate(ROUTES.EMPLOYEE, { replace: true });
    } catch (err) {
      if (err.errorCode === 2000) {
        setError("Incorrect username or password");
      } else if (err.errorCode === 2001) {
        setError("Account has been locked");
      } else if (err.errorCode === 2002) {
        setError("Login session has expired");
      } else {
        setError(err.message || "Failed to log in");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <main className="login-card">
        <section className="login-brand">
          <div className="login-brand__icon">
            <span
              className="material-symbols-outlined"
              data-weight="fill"
              style={{ fontSize: "32px" }}
            >
              security
            </span>
          </div>
          <h1 className="login-brand__title">STUDENT MANAGEMENT</h1>
          <p className="login-brand__subtitle">
            Log in to the student management system.
          </p>
          <div className="login-badge code-secure">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px" }}
            >
              lock
            </span>
            <span>{LOGIN_HIGHLIGHTS[0]}</span>
          </div>
        </section>

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            label="Username"
            placeholder="Enter username"
            value={form.username}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            required
          />

          <label className="form-field">
            <span>Password</span>
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
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
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

          {error && (
            <p style={{ color: "red", margin: 0, fontSize: "0.9rem" }}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="btn--primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            <span className="material-symbols-outlined">login</span>
            <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
          </Button>
        </form>

        <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
          {LOGIN_HIGHLIGHTS.slice(1).map((item) => (
            <div
              key={item}
              className="summary-item"
              style={{ paddingBottom: 0, borderBottom: 0 }}
            ></div>
          ))}
        </div>
      </main>
    </div>
  );
}
