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

const isValidEmployeePassword = async (pool, MANV_LOGIN, MK_NV) => {
  const result = await pool
    .request()
    .input("MANV", sql.VarChar(20), MANV_LOGIN)
    .input("MK", sql.NVarChar(100), MK_NV)
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
  const { MASV, MAHP, DIEM, MANV_LOGIN } = req.body || {};

  if (!MASV || !MAHP || MANV_LOGIN == null) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MASV, MAHP, MANV_LOGIN",
    });
  }

  const parsedScore = Number(DIEM);

  if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 10) {
    return res.status(400).json({
      message: "Điểm không hợp lệ",
      errorCode: 5003,
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MASV", sql.VarChar(20), MASV)
      .input("MAHP", sql.VarChar(20), MAHP)
      .input("DIEM", sql.Float, parsedScore)
      .input("MANV_LOGIN", sql.VarChar(20), MANV_LOGIN)
      .execute("SP_INS_PUBLIC_BANGDIEM");

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
  const { MANV_LOGIN, MK } = req.body || {};

  if (!MANV_LOGIN || !MK) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MANV_LOGIN, MK",
    });
  }

  try {
    const pool = await db.poolPromise;

    const isValid = await isValidEmployeePassword(pool, MANV_LOGIN, MK);

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
  const { MASV, MANV_LOGIN, MK_NV } = req.body || {};

  if (!MASV || !MANV_LOGIN || !MK_NV) {
    return res.status(400).json({
      message: "Thieu du lieu bat buoc: MASV, MANV_LOGIN, MK_NV",
    });
  }

  try {
    const pool = await db.poolPromise;

    const isOwner = await isHomeroomTeacher(pool, MASV, MANV_LOGIN);
    if (!isOwner) {
      return res.status(403).json({
        message: "Khong co quyen xem bang diem cua sinh vien nay",
        errorCode: 4002,
      });
    }

    const result = await pool
      .request()
      .input("MASV", sql.VarChar(20), MASV)
      .input("MANV_LOGIN", sql.VarChar(20), MANV_LOGIN)
      .input("MK_NV", sql.NVarChar(100), MK_NV)
      .execute("SP_SEL_BANGDIEM_BY_MASV");

    console.log("recordset:", result.recordset);
    console.log("recordsets:", result.recordsets);

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

    const dataRows = rows.filter((row) => {
      return row.MASV && row.MAHP;
    });

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
