import { encryptRSA } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const handleResponse = async (res, fallbackMessage) => {
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || fallbackMessage);
    error.errorCode = data.errorCode;
    throw error;
  }

  return data;
};

const getAdminAuth = () => {
  try {
    const rawAuth = localStorage.getItem("adminAuth");
    if (!rawAuth) {
      return null;
    }

    const parsed = JSON.parse(rawAuth);
    if (!parsed?.MAADMIN || !parsed?.MATKHAU_HEX) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const getAdminEmployees = async () => {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    throw new Error("Thiếu thông tin xác thực admin. Vui lòng đăng nhập lại.");
  }

  const res = await fetch(`${API_URL}/admin/employees`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      MAADMIN: adminAuth.MAADMIN,
      MATKHAU_HEX: adminAuth.MATKHAU_HEX,
    }),
  });

  const data = await handleResponse(res, "Không thể lấy danh sách nhân viên");
  return data.data || [];
};

export const updateEmployeeSalary = async ({ MANV, LUONG, PUBKEY }) => {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    throw new Error("Thiếu thông tin xác thực admin. Vui lòng đăng nhập lại.");
  }

  if (!PUBKEY) {
    throw new Error("Không tìm thấy PUBKEY của nhân viên.");
  }

  const luongCipherBase64 = encryptRSA(LUONG, PUBKEY);

  const res = await fetch(`${API_URL}/admin/employees/salary`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      MANV,
      LUONG_CIPHER_B64: luongCipherBase64,
      MAADMIN: adminAuth.MAADMIN,
      MATKHAU_HEX: adminAuth.MATKHAU_HEX,
    }),
  });

  return handleResponse(res, "Không thể cập nhật lương");
};
