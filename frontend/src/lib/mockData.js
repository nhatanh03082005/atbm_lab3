export const dashboardStats = [
  {
    label: "Total Classes",
    value: "248",
    helper: "Tổng số lớp",
    icon: "class",
  },
  {
    label: "Total Students",
    value: "8,452",
    helper: "Tổng số sinh viên",
    icon: "group",
  },
  {
    label: "Total Modules",
    value: "1,102",
    helper: "Tổng số học phần",
    icon: "view_module",
  },
  {
    label: "Grades Entered",
    value: "45,920",
    helper: "Số bảng điểm đã nhập",
    icon: "grading",
  },
];

export const notifications = [
  {
    id: 1,
    title: "Grade Submission Deadline",
    description:
      "Module CS101 grades are pending validation. 48 hours remaining.",
    meta: "2 hours ago",
    tone: "danger",
  },
  {
    id: 2,
    title: "Security Patch Applied",
    description: "System updated to protocol v2.4.1. No action required.",
    meta: "System Automated",
    tone: "info",
  },
  {
    id: 3,
    title: "New Batch Enrollment",
    description: "1,200 student records await administrative approval.",
    meta: "Review Batch",
    tone: "action",
  },
];

export const classes = [
  {
    id: "CLS-101",
    name: "Software Engineering",
    teacher: "Dr. Nguyen",
    students: 42,
    room: "A101",
    status: "active",
  },
  {
    id: "CLS-102",
    name: "Database Systems",
    teacher: "Prof. Tran",
    students: 38,
    room: "B204",
    status: "active",
  },
  {
    id: "CLS-103",
    name: "Network Security",
    teacher: "Dr. Le",
    students: 30,
    room: "C305",
    status: "pending",
  },
  {
    id: "CLS-104",
    name: "Mobile Development",
    teacher: "Ms. Pham",
    students: 45,
    room: "D110",
    status: "archived",
  },
];

export const students = [
  {
    id: "SV001",
    name: "An Nguyen",
    className: "Software Engineering",
    email: "an.nguyen@school.edu",
    score: 8.7,
    status: "active",
  },
  {
    id: "SV002",
    name: "Bao Tran",
    className: "Database Systems",
    email: "bao.tran@school.edu",
    score: 7.9,
    status: "active",
  },
  {
    id: "SV003",
    name: "Chi Le",
    className: "Network Security",
    email: "chi.le@school.edu",
    score: 9.2,
    status: "pending",
  },
  {
    id: "SV004",
    name: "Duc Pham",
    className: "Mobile Development",
    email: "duc.pham@school.edu",
    score: 6.8,
    status: "active",
  },
];

export const scoreEntries = [
  {
    id: "SC001",
    student: "An Nguyen",
    className: "Software Engineering",
    subject: "Frontend",
    score: 9.1,
    status: "encrypted",
  },
  {
    id: "SC002",
    student: "Bao Tran",
    className: "Database Systems",
    subject: "SQL",
    score: 8.4,
    status: "draft",
  },
  {
    id: "SC003",
    student: "Chi Le",
    className: "Network Security",
    subject: "Cryptography",
    score: 9.7,
    status: "encrypted",
  },
  {
    id: "SC004",
    student: "Duc Pham",
    className: "Mobile Development",
    subject: "React Native",
    score: 7.2,
    status: "pending",
  },
];

export const employeeProfile = {
  name: "Nguyen Van A",
  title: "System Administrator",
  employeeId: "EMP-00084",
  department: "Academic Operations",
  email: "admin@school.edu",
  username: "admin_a",
  publicKey: "RSA-2048 / SHA1",
  salary: "$4,800",
  status: "Encrypted profile active",
  joinedAt: "2024-08-14",
};
