import db from "../config/database.js";
import sql from "mssql";

const errorCodeMap = {
  4001: { status: 400, message: "Sinh viên không tồn tại" },
  4002: { status: 403, message: "Không có quyền nhập điểm cho lớp này" },
  5001: { status: 400, message: "Học phần không tồn tại" },
  5002: { status: 400, message: "Không tìm thấy public key của nhân viên" },
  5003: { status: 400, message: "Điểm không hợp lệ" },
  5999: { status: 500, message: "Lỗi hệ thống" },
  2000: { status: 401, message: "Mat khau khong chinh xac" },
};

const getManvLogin = (req) =>
  req.query?.MANV_LOGIN || req.body?.MANV_LOGIN || "";

const resolveError = (errorCode, fallbackMessage) => {
  const mapped = errorCodeMap[errorCode];
  if (mapped) {
    return mapped;
  }

  return {
    status: 400,
    message: fallbackMessage || "Lỗi xử lý dữ liệu",
  };
};

const isHomeroomTeacher = async (pool, MASV, MANV_LOGIN) => {
  const result = await pool
    .request()
    .input("MASV", sql.VarChar(20), MASV)
    .input("MANV", sql.VarChar(20), MANV_LOGIN)
    .query(
      "SELECT 1 AS IsOwner FROM SINHVIEN sv JOIN LOP l ON sv.MALOP = l.MALOP WHERE sv.MASV = @MASV AND l.MANV = @MANV",
    );

  return Boolean(result.recordset && result.recordset.length > 0);
};

/**
 * Xác thực mật khẩu nhân viên.
 * @param {string} MATKHAU_HEX - SHA-512 hex hash của mật khẩu (từ client)
 */
const isValidEmployeePassword = async (pool, MANV_LOGIN, MATKHAU_HEX) => {
  // Chuyển hex hash → Buffer (VARBINARY) để so sánh với cột MATKHAU trong DB
  const matkhauBuffer = Buffer.from(MATKHAU_HEX, "hex");

  const result = await pool
    .request()
    .input("MANV", sql.VarChar(20), MANV_LOGIN)
    .input("MK", sql.VarBinary(sql.MAX), matkhauBuffer)
    .query(
      "SELECT 1 AS Valid FROM NHANVIEN WHERE MANV = @MANV AND MATKHAU = @MK",
    );

  return Boolean(result.recordset && result.recordset.length > 0);
};

const getManagedClasses = async (req, res) => {
  const MANV_LOGIN = getManvLogin(req);

  if (!MANV_LOGIN) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MANV_LOGIN",
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MANV", sql.VarChar(20), MANV_LOGIN)
      .query("SELECT MALOP, TENLOP, MANV FROM LOP WHERE MANV = @MANV");

    res.status(200).json({
      message: "Lấy danh sách lớp thành công",
      data: result.recordset || [],
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi xem danh sách lớp",
      error: err.message,
    });
  }
};

const getStudentsByClass = async (req, res) => {
  const MALOP = req.query?.malop || req.query?.MALOP || req.params?.malop || "";
  const MANV_LOGIN = getManvLogin(req);

  if (!MALOP || !MANV_LOGIN) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MALOP, MANV_LOGIN",
    });
  }

  try {
    const pool = await db.poolPromise;

    const ownerCheck = await pool
      .request()
      .input("MALOP", sql.VarChar(20), MALOP)
      .input("MANV", sql.VarChar(20), MANV_LOGIN)
      .query(
        "SELECT 1 AS IsOwner FROM LOP WHERE MALOP = @MALOP AND MANV = @MANV",
      );

    if (!ownerCheck.recordset || ownerCheck.recordset.length === 0) {
      return res.status(403).json({
        message: "Không có quyền xem danh sách sinh viên của lớp này",
        errorCode: 4002,
      });
    }

    const result = await pool
      .request()
      .input("MALOP", sql.VarChar(20), MALOP)
      .query(
        "SELECT MASV, HOTEN, MALOP FROM SINHVIEN WHERE MALOP = @MALOP ORDER BY MASV",
      );

    res.status(200).json({
      message: "Lấy danh sách sinh viên thành công",
      data: result.recordset || [],
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi xem danh sách sinh viên",
      error: err.message,
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .query("SELECT MAHP, TENHP, SOTC FROM HOCPHAN ORDER BY MAHP");

    res.status(200).json({
      message: "Lấy danh sách học phần thành công",
      data: result.recordset || [],
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi xem danh sách học phần",
      error: err.message,
    });
  }
};

const saveScore = async (req, res) => {
  // DIEMTHI_B64: base64 của ciphertext RSA đã mã hoá từ client
  const { MASV, MAHP, DIEMTHI_B64, MANV_LOGIN } = req.body || {};

  if (!MASV || !MAHP || !DIEMTHI_B64 || !MANV_LOGIN) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MASV, MAHP, DIEMTHI_B64, MANV_LOGIN",
    });
  }

  try {
    const pool = await db.poolPromise;

    // Chuyển base64 → Buffer (VARBINARY) để lưu vào DB
    const diemBuffer = Buffer.from(DIEMTHI_B64, "base64");

    const result = await pool
      .request()
      .input("MASV", sql.VarChar(20), MASV)
      .input("MAHP", sql.VarChar(20), MAHP)
      .input("DIEMTHI", sql.VarBinary(sql.MAX), diemBuffer)
      .input("MANV_LOGIN", sql.VarChar(20), MANV_LOGIN)
      .execute("SP_INS_PUBLIC_ENCRYPT_BANGDIEM");

    const response = result.recordset?.[0];

    if (response?.ErrorCode && response.ErrorCode !== 0) {
      const error = resolveError(response.ErrorCode, response.ErrorMessage);
      return res.status(error.status).json({
        message: error.message,
        errorCode: response.ErrorCode,
      });
    }

    res.status(200).json({
      message: response?.ErrorMessage || "Lưu điểm thành công",
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi lưu điểm",
      error: err.message,
    });
  }
};

const checkScoreExists = async (req, res) => {
  const MASV = req.query?.MASV || req.query?.masv || "";
  const MAHP = req.query?.MAHP || req.query?.mahp || "";
  const MANV_LOGIN = getManvLogin(req);

  if (!MASV || !MAHP || !MANV_LOGIN) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MASV, MAHP, MANV_LOGIN",
    });
  }

  try {
    const pool = await db.poolPromise;

    const isOwner = await isHomeroomTeacher(pool, MASV, MANV_LOGIN);
    if (!isOwner) {
      return res.status(403).json({
        message: "Không có quyền xem điểm của sinh viên này",
        errorCode: 4002,
      });
    }

    const result = await pool
      .request()
      .input("MASV", sql.VarChar(20), MASV)
      .input("MAHP", sql.VarChar(20), MAHP)
      .query(
        "SELECT 1 AS ExistsScore FROM BANGDIEM WHERE MASV = @MASV AND MAHP = @MAHP",
      );

    res.status(200).json({
      message: "Kiem tra diem thanh cong",
      data: { exists: result.recordset && result.recordset.length > 0 },
    });
  } catch (err) {
    res.status(500).json({
      message: "Loi kiem tra diem",
      error: err.message,
    });
  }
};

const verifyEmployeePassword = async (req, res) => {
  // Nhận MATKHAU_HEX: SHA-512 hex hash của mật khẩu (đã hash từ client)
  const { MANV_LOGIN, MATKHAU_HEX } = req.body || {};

  if (!MANV_LOGIN || !MATKHAU_HEX) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MANV_LOGIN, MATKHAU_HEX",
    });
  }

  try {
    const pool = await db.poolPromise;

    const isValid = await isValidEmployeePassword(pool, MANV_LOGIN, MATKHAU_HEX);

    if (!isValid) {
      return res.status(401).json({
        message: "Mat khau khong dung",
      });
    }

    res.status(200).json({
      message: "Xac thuc thanh cong",
    });
  } catch (err) {
    res.status(500).json({
      message: "Loi xac thuc mat khau",
      error: err.message,
    });
  }
};

const getScoresByStudent = async (req, res) => {
  // MATKHAU_HEX: SHA-512 hex hash của mật khẩu nhân viên (đã hash từ client)
  const { MASV, MANV_LOGIN, MATKHAU_HEX } = req.body || {};

  if (!MASV || !MANV_LOGIN || !MATKHAU_HEX) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MASV, MANV_LOGIN, MATKHAU_HEX",
    });
  }

  try {
    const pool = await db.poolPromise;

    // Chuyển hex hash → Buffer (VARBINARY)
    const matkhauBuffer = Buffer.from(MATKHAU_HEX, "hex");

    const result = await pool
      .request()
      .input("MASV", sql.VarChar(20), MASV)
      .input("MANV_LOGIN", sql.VarChar(20), MANV_LOGIN)
      .input("MATKHAU_NV", sql.VarBinary(sql.MAX), matkhauBuffer)
      .execute("SP_SEL_PUBLIC_ENCRYPT_BANGDIEM_BY_MASV");

    const rows = result.recordset || [];

    if (
      rows.length === 1 &&
      Object.prototype.hasOwnProperty.call(rows[0], "ErrorCode") &&
      rows[0].ErrorCode !== 0 &&
      !Object.prototype.hasOwnProperty.call(rows[0], "MAHP")
    ) {
      const error = resolveError(rows[0].ErrorCode, rows[0].ErrorMessage);
      return res.status(error.status).json({
        message: error.message,
        errorCode: rows[0].ErrorCode,
      });
    }

    const dataRows = rows
      .filter((row) => row.MASV && row.MAHP)
      .map((row) => ({
        ...row,
        // DIEMTHI là VARBINARY (cipher) → chuyển sang base64 để gửi xuống client
        DIEMTHI: row.DIEMTHI ? row.DIEMTHI.toString("base64") : null,
      }));

    return res.status(200).json({
      message: "Lay bang diem thanh cong",
      data: dataRows,
    });
  } catch (err) {
    res.status(500).json({
      message: "Loi lay bang diem",
      error: err.message,
    });
  }
};

export {
  getManagedClasses,
  getStudentsByClass,
  getCourses,
  saveScore,
  checkScoreExists,
  verifyEmployeePassword,
  getScoresByStudent,
};
