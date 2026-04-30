export const ROUTES = Object.freeze({
  ROOT: "/",
  LOGIN: "/login",
  EMPLOYEE: "/employee",
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
  return isAuthenticated() ? ROUTES.EMPLOYEE : ROUTES.LOGIN;
}
