import { encryptRSA, generateRSAKeysFromPassword, hashSHA512 } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

export const loginApi = async (username, password) => {
  // Bước 1: Hash password SHA-512 trên client trước khi gửi lên server
  const matkhauHex = await hashSHA512(password);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      TENDN: username,
      MATKHAU_HEX: matkhauHex, // Gửi hash thay vì plaintext
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Đăng nhập thất bại");
    error.errorCode = data.errorCode;
    throw error;
  }

  // data.user sẽ chứa: { MANV, HOTEN, EMAIL, LUONG (base64 cipher), PUBKEY (PEM) }
  return data;
};

export const loginAdminApi = async (username, password) => {
  const matkhauHex = await hashSHA512(password);

  const res = await fetch(`${API_URL}/auth/login-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      TENDN: username,
      MATKHAU_HEX: matkhauHex,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Đăng nhập thất bại");
    error.errorCode = data.errorCode;
    throw error;
  }

  return {
    ...data,
    adminAuth: {
      MAADMIN: data.user?.MAADMIN,
      MATKHAU_HEX: matkhauHex,
    },
  };
};

export const registerEmployeeApi = async ({
  MANV,
  HOTEN,
  EMAIL,
  TENDN,
  MATKHAU,
}) => {
  const matkhauHex = await hashSHA512(MATKHAU);
  const { publicKeyPem } = await generateRSAKeysFromPassword(MATKHAU);

  const luongCipherBase64 = encryptRSA("0", publicKeyPem);

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      MANV,
      HOTEN,
      EMAIL: EMAIL || null,
      TENDN,
      MATKHAU_HEX: matkhauHex,
      PUBKEY: publicKeyPem,
      LUONG_CIPHER_B64: luongCipherBase64,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Đăng ký thất bại");
    error.errorCode = data.errorCode;
    throw error;
  }

  return data;
};
