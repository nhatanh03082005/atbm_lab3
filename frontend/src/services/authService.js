import { hashSHA512 } from "../utils";

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
