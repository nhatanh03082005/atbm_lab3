const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getCurrentUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const getManvLogin = () => {
  const user = getCurrentUser();
  return user?.MANV || user?.manv || user?.MA_NV || "";
};

const handleResponse = async (res, fallbackMessage) => {
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || fallbackMessage);
    error.errorCode = data.errorCode;
    throw error;
  }

  return data;
};

export const getManagedClasses = async () => {
  const MANV_LOGIN = getManvLogin();
  if (!MANV_LOGIN) {
    throw new Error("Missing logged-in employee id (MANV_LOGIN)");
  }

  const res = await fetch(
    `${API_URL}/scores/classes?MANV_LOGIN=${encodeURIComponent(MANV_LOGIN)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  const data = await handleResponse(res, "Failed to fetch managed classes");
  return data.data || [];
};

export const getStudentsByClass = async (MALOP) => {
  const MANV_LOGIN = getManvLogin();
  if (!MANV_LOGIN) {
    throw new Error("Missing logged-in employee id (MANV_LOGIN)");
  }

  const res = await fetch(
    `${API_URL}/scores/students?malop=${encodeURIComponent(
      MALOP,
    )}&MANV_LOGIN=${encodeURIComponent(MANV_LOGIN)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  const data = await handleResponse(res, "Failed to fetch students");
  return data.data || [];
};

export const getCourses = async () => {
  const res = await fetch(`${API_URL}/scores/courses`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(res, "Failed to fetch courses");
  return data.data || [];
};

export const checkScoreExists = async ({ MASV, MAHP }) => {
  const MANV_LOGIN = getManvLogin();
  if (!MANV_LOGIN) {
    throw new Error("Missing logged-in employee id (MANV_LOGIN)");
  }

  const res = await fetch(
    `${API_URL}/scores/exists?MASV=${encodeURIComponent(
      MASV,
    )}&MAHP=${encodeURIComponent(MAHP)}&MANV_LOGIN=${encodeURIComponent(
      MANV_LOGIN,
    )}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  const data = await handleResponse(res, "Failed to check score");
  return data.data || { exists: false };
};

export const verifyEmployeePassword = async ({ MK }) => {
  const MANV_LOGIN = getManvLogin();
  if (!MANV_LOGIN) {
    throw new Error("Missing logged-in employee id (MANV_LOGIN)");
  }

  const res = await fetch(`${API_URL}/scores/verify`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ MANV_LOGIN, MK }),
  });

  const data = await handleResponse(res, "Failed to verify password");
  return data;
};

export const getScoresByStudent = async ({ MASV, MK_NV }) => {
  const MANV_LOGIN = getManvLogin();
  if (!MANV_LOGIN) {
    throw new Error("Missing logged-in employee id (MANV_LOGIN)");
  }

  const res = await fetch(`${API_URL}/scores/by-student`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ MASV, MANV_LOGIN, MK_NV }),
  });

  const data = await handleResponse(res, "Failed to load scores");
  return data.data || [];
};

export const saveScore = async ({ MASV, MAHP, DIEM }) => {
  const MANV_LOGIN = getManvLogin();
  if (!MANV_LOGIN) {
    throw new Error("Missing logged-in employee id (MANV_LOGIN)");
  }

  const res = await fetch(`${API_URL}/scores`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ MASV, MAHP, DIEM, MANV_LOGIN }),
  });

  const data = await handleResponse(res, "Failed to save score");
  return data;
};
