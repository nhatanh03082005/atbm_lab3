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

export const getAllStudents = async () => {
  const res = await fetch(`${API_URL}/students`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(res, "Failed to fetch students");
  return data.data || [];
};

export const getStudentsByClass = async (MALOP) => {
  const res = await fetch(`${API_URL}/classes/${MALOP}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(res, "Failed to fetch students");
  return data.data || [];
};

export const createStudent = async (studentData) => {
  const { MASV, HOTEN, NGAYSINH, DIACHI, MALOP, TENDN, MK, MANV_LOGIN } =
    studentData;

  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      MASV,
      HOTEN,
      NGAYSINH: NGAYSINH || null,
      DIACHI: DIACHI || null,
      MALOP: MALOP || null,
      TENDN,
      MK,
      MANV_LOGIN,
    }),
  });

  const data = await handleResponse(res, "Failed to create student");
  return data.data;
};

export const updateStudent = async (MASV, studentData) => {
  const { HOTEN, NGAYSINH, DIACHI, MANV_LOGIN } = studentData;

  const res = await fetch(`${API_URL}/students/${MASV}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      HOTEN,
      NGAYSINH,
      DIACHI,
      MANV_LOGIN,
    }),
  });

  const data = await handleResponse(res, "Failed to update student");
  return data.data;
};

export const deleteStudent = async (MASV, MANV_LOGIN) => {
  const res = await fetch(`${API_URL}/students/${MASV}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ MANV_LOGIN }),
  });

  const data = await handleResponse(res, "Failed to delete student");
  return data;
};
