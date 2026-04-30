import { ROUTES } from "./routes";

export const APP_NAME = "SecureAdmin";
export const APP_TAGLINE = "Student management dashboard";

export const NAV_ITEMS = [
  {
    label: "Profile",
    icon: "account_circle",
    path: ROUTES.EMPLOYEE,
    page: "employee",
  },
  { label: "Classes", icon: "school", path: ROUTES.CLASSES, page: "classes" },
  { label: "Students", icon: "group", path: ROUTES.STUDENTS, page: "students" },
  { label: "Grades", icon: "grade", path: ROUTES.SCORES, page: "scores" },
];

export const FOOTER_ITEMS = [
  { label: "Logout", icon: "logout", action: "logout" },
];

export const LOGIN_HIGHLIGHTS = [
  "TLS v1.3 active",
  "Encrypted records",
  "Role-based access",
];

export const STATUS_BADGES = {
  active: "Active",
  pending: "Pending",
  archived: "Archived",
  encrypted: "Encrypted",
  draft: "Draft",
};
