const API_URL = "http://localhost:5000";

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
