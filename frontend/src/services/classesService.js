const API_URL = "http://localhost:5000";

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

export const getAllClasses = async () => {
  const res = await fetch(`${API_URL}/classes`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(res, "Failed to fetch classes");
  return data.data || [];
};

export const createClass = async (classData) => {
  const { MALOP, TENLOP, MANV } = classData;

  const res = await fetch(`${API_URL}/classes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      MALOP,
      TENLOP,
      MANV,
    }),
  });

  const data = await handleResponse(res, "Failed to create class");
  return data.data;
};

export const updateClass = async (MALOP, classData) => {
  const { TENLOP, MANV } = classData;

  const res = await fetch(`${API_URL}/classes/${MALOP}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ TENLOP, MANV }),
  });

  const data = await handleResponse(res, "Failed to update class");
  return data.data;
};

export const deleteClass = async (MALOP, MANV) => {
  const res = await fetch(`${API_URL}/classes/${MALOP}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ MANV }),
  });

  const data = await handleResponse(res, "Failed to delete class");
  return data;
};
