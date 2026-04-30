import db from "../config/database.js";
import sql from "mssql";

const getAllStudents = async (req, res) => {
  try {
    const pool = await db.poolPromise;

    const result = await pool.request().execute("SP_SEL_SINHVIEN");

    res.status(200).json({
      message: "Lấy danh sách sinh viên thành công",
      data: result.recordset || [],
    });
  } catch (err) {
    console.error("Student error:", err);

    res.status(500).json({
      message: "Lỗi xem danh sách sinh viên",
      error: err.message,
    });
  }
};

const createStudent = async (req, res) => {
  const { MASV, HOTEN, NGAYSINH, DIACHI, MALOP, TENDN, MK, MANV_LOGIN } =
    req.body;

  if (!MASV || !HOTEN || !TENDN || !MK) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MASV, HOTEN, TENDN, MK",
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MASV", sql.VarChar(20), MASV)
      .input("HOTEN", sql.NVarChar(100), HOTEN)
      .input("NGAYSINH", sql.Date(), NGAYSINH || null)
      .input("DIACHI", sql.NVarChar(200), DIACHI || null)
      .input("MALOP", sql.VarChar(20), MALOP || null)
      .input("TENDN", sql.VarChar(50), TENDN)
      .input("MK", sql.VarChar(100), MK)
      .input("MANV_LOGIN", sql.VarChar(20), MANV_LOGIN)
      .execute("SP_INS_PUBLIC_SINHVIEN");

    const response = result.recordset[0];

    if (response.ErrorCode !== 0) {
      return res.status(400).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
      });
    }

    res.status(201).json({
      message: response.ErrorMessage,
      data: {
        MASV,
        HOTEN,
        NGAYSINH: NGAYSINH || null,
        DIACHI: DIACHI || null,
        MALOP: MALOP || null,
        TENDN,
        MK,
        MANV_LOGIN,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi tạo sinh viên",
      error: err.message,
    });
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { HOTEN, NGAYSINH, DIACHI, MANV_LOGIN } = req.body;

  const MASV = id;

  if (!HOTEN || !HOTEN || !MANV_LOGIN) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MASV,  HOTEN",
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MASV", sql.VarChar(20), MASV)
      .input("HOTEN", sql.NVarChar(100), HOTEN)
      .input("NGAYSINH", sql.Date(), NGAYSINH || null)
      .input("DIACHI", sql.NVarChar(200), DIACHI || null)
      .input("MANV_LOGIN", sql.VarChar(20), MANV_LOGIN)
      .execute("SP_UPD_PUBLIC_SINHVIEN");

    const response = result.recordset[0];

    if (response.ErrorCode !== 0) {
      return res.status(400).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
      });
    }

    res.status(200).json({
      message: response.ErrorMessage,
      data: { MASV, HOTEN, NGAYSINH, DIACHI, MANV_LOGIN },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi cập nhật sinh viên",
      error: err.message,
    });
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;
  const { MANV_LOGIN } = req.body;

  if (!MANV_LOGIN) {
    return res.status(400).json({
      message: "Thiếu dữ liệu: MANV_LOGIN",
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MASV", sql.VarChar(20), id)
      .input("MANV_LOGIN", sql.VarChar(20), MANV_LOGIN)
      .execute("SP_DEL_PUBLIC_SINHVIEN");

    const response = result.recordset[0];

    if (response.ErrorCode === 4004) {
      return res.status(409).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
        requireConfirm: true,
      });
    }

    if (response.ErrorCode !== 0) {
      return res.status(400).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
      });
    }

    res.status(200).json({
      message: response.ErrorMessage,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi xóa sinh viên",
      error: err.message,
    });
  }
};

export { getAllStudents, createStudent, updateStudent, deleteStudent };
