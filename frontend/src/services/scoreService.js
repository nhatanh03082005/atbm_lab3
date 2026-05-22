import { hashSHA512, encryptRSA, decryptRSAWithPassword } from "../utils";

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

/**
 * Lấy PUBKEY (PEM) của nhân viên đang đăng nhập từ localStorage.
 * PUBKEY được lưu sau khi đăng nhập thành công từ server.
 */
const getEmployeePubKey = () => {
  return getCurrentUser()?.PUBKEY || null;
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

  // Hash mật khẩu trước khi gửi lên server
  const matkhauHex = await hashSHA512(MK);

  const res = await fetch(`${API_URL}/scores/verify`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ MANV_LOGIN, MATKHAU_HEX: matkhauHex }),
  });

  const data = await handleResponse(res, "Failed to verify password");
  return data;
};

/**
 * Lấy bảng điểm của sinh viên.
 * - Hash password → gửi server (xác thực).
 * - Server trả về DIEMTHI dạng base64 cipher.
 * - Client giải mã DIEMTHI bằng decryptRSAWithPassword (tái tạo private key).
 *
 * @param {{ MASV: string, MK_NV: string }} params - MK_NV là mật khẩu plaintext
 * @returns {Promise<Array>} Danh sách điểm với trường DIEM đã giải mã (số thực)
 */
export const getScoresByStudent = async ({ MASV, MK_NV }) => {
  const MANV_LOGIN = getManvLogin();
  if (!MANV_LOGIN) {
    throw new Error("Missing logged-in employee id (MANV_LOGIN)");
  }

  // Bước 1: Hash password phía client trước khi gửi lên server
  const matkhauHex = await hashSHA512(MK_NV);

  const res = await fetch(`${API_URL}/scores/by-student`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ MASV, MANV_LOGIN, MATKHAU_HEX: matkhauHex }),
  });

  const data = await handleResponse(res, "Failed to load scores");
  const rows = data.data || [];

  // Bước 2: Giải mã DIEMTHI bằng private key (tái tạo từ password)
  const decryptedRows = await Promise.all(
    rows.map(async (row) => {
      if (!row.DIEMTHI) {
        // Chưa có điểm
        return { ...row, DIEM: null };
      }
      try {
        const plaintext = await decryptRSAWithPassword(row.DIEMTHI, MK_NV);
        return { ...row, DIEM: Number(plaintext) };
      } catch {
        // Giải mã thất bại (cipher không khớp key)
        return { ...row, DIEM: null };
      }
    }),
  );

  return decryptedRows;
};

/**
 * Lưu điểm sinh viên.
 * - Lấy PUBKEY từ localStorage.
 * - Mã hoá DIEM bằng RSA public key.
 * - Gửi ciphertext (base64) lên server.
 *
 * @param {{ MASV: string, MAHP: string, DIEM: number }} params
 */
export const saveScore = async ({ MASV, MAHP, DIEM }) => {
  const MANV_LOGIN = getManvLogin();
  if (!MANV_LOGIN) {
    throw new Error("Missing logged-in employee id (MANV_LOGIN)");
  }

  const pubKeyPem = getEmployeePubKey();
  if (!pubKeyPem) {
    throw new Error(
      "Không tìm thấy public key của nhân viên. Vui lòng đăng nhập lại.",
    );
  }

  // Mã hoá điểm bằng RSA public key trước khi gửi
  const diemBase64 = encryptRSA(String(DIEM), pubKeyPem);

  const res = await fetch(`${API_URL}/scores`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ MASV, MAHP, DIEMTHI_B64: diemBase64, MANV_LOGIN }),
  });

  const responseData = await handleResponse(res, "Failed to save score");
  return responseData;
};
