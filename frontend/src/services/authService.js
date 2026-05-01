const API_URL = import.meta.env.VITE_API_URL;

export const loginApi = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      TENDN: username,
      MK: password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Đăng nhập thất bại");
    error.errorCode = data.errorCode;
    throw error;
  }

  return data;
};
