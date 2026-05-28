export const ROUTES = Object.freeze({
  ROOT: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  EMPLOYEE: "/employee",
  ADMIN_EMPLOYEES: "/admin/employees",
  CLASSES: "/classes",
  STUDENTS: "/students",
  SCORES: "/scores",
});

const AUTH_KEY = "secureadmin-authenticated";
const USER_NAME_KEY = "secureadmin-user-name";

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_KEY, value ? "true" : "false");
}

export function clearAuthentication() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(USER_NAME_KEY);
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("adminAuth");
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = window.localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function getCurrentUserRole() {
  const user = getCurrentUser();
  if (!user) {
    return null;
  }

  if (user.ROLE === "admin" || user.role === "admin" || user.MAADMIN) {
    return "admin";
  }

  return "employee";
}

export function setCurrentUserName(name) {
  if (typeof window === "undefined") {
    return;
  }

  const safeName = String(name || "").trim();
  if (safeName) {
    window.localStorage.setItem(USER_NAME_KEY, safeName);
  } else {
    window.localStorage.removeItem(USER_NAME_KEY);
  }
}

export function getCurrentUserName() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(USER_NAME_KEY) || "";
}

export function getLandingRoute() {
  if (!isAuthenticated()) {
    return ROUTES.LOGIN;
  }

  return getCurrentUserRole() === "admin"
    ? ROUTES.ADMIN_EMPLOYEES
    : ROUTES.EMPLOYEE;
}
