import db from "../config/database.js";
import sql from "mssql";

const getAllClasses = async (req, res) => {
  try {
    const pool = await db.poolPromise;

    const result = await pool.request().execute("SP_SEL_PUBLIC_LOPHOC");

    const rows = result.recordset || [];

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Không có lớp nào",
        data: [],
      });
    }

    const firstRow = rows[0];

    if (firstRow.ErrorCode && firstRow.ErrorCode !== 0) {
      return res.status(400).json({
        message: firstRow.ErrorMessage,
        errorCode: firstRow.ErrorCode,
      });
    }

    res.status(200).json({
      message: "Lấy danh sách lớp thành công",
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi xem danh sách lớp",
      error: err.message,
    });
  }
};

const getStudentsByClass = async (req, res) => {
  const MALOP = req.params?.id || req.query?.MALOP || req.body?.MALOP;

  if (!MALOP) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MALOP",
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MALOP", sql.VarChar(20), MALOP)
      .execute("SP_SEL_SINHVIEN_BY_LOP");

    res.status(200).json({
      message: `Lấy danh sách sinh viên của lớp ${MALOP} thành công`,
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

const createClass = async (req, res) => {
  const { MALOP, TENLOP, MANV } = req.body;

  if (!MALOP || !TENLOP) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MALOP, TENLOP",
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MALOP", sql.VarChar(20), MALOP)
      .input("TENLOP", sql.NVarChar(100), TENLOP)
      .input("MANV", sql.VarChar(20), MANV || null)
      .execute("SP_INS_PUBLIC_LOPHOC");

    const response = result.recordset[0];

    if (response.ErrorCode !== 0) {
      return res.status(400).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
      });
    }

    res.status(201).json({
      message: response.ErrorMessage,
      data: { MALOP, TENLOP, MANV: MANV || null },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi tạo lớp",
      error: err.message,
    });
  }
};

const updateClass = async (req, res) => {
  const { id } = req.params;
  const { TENLOP, MANV } = req.body;

  const MALOP = id;

  if (!MALOP || !TENLOP || !MANV) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MALOP, TENLOP, MANV",
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MALOP", sql.VarChar(20), MALOP)
      .input("TENLOP", sql.NVarChar(100), TENLOP)
      .input("MANV_LOGIN", sql.VarChar(20), MANV)
      .execute("SP_UPD_PUBLIC_LOPHOC");

    const response = result.recordset[0];

    if (response.ErrorCode !== 0) {
      return res.status(400).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
      });
    }

    res.status(200).json({
      message: response.ErrorMessage,
      data: { MALOP, TENLOP, MANV },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi cập nhật lớp",
      error: err.message,
    });
  }
};

const deleteClass = async (req, res) => {
  const { id } = req.params;
  const { MANV } = req.body;

  const MALOP = id;

  if (!MALOP || !MANV) {
    return res.status(400).json({
      message: "Thiếu dữ liệu bắt buộc: MALOP, MANV",
    });
  }

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("MALOP", sql.VarChar(20), MALOP)
      .input("MANV_LOGIN", sql.VarChar(20), MANV)
      .execute("SP_DEL_PUBLIC_LOPHOC");

    const response = result.recordset[0];

    if (response.ErrorCode !== 0) {
      return res.status(400).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
      });
    }

    res.status(200).json({
      message: response.ErrorMessage,
      data: { MALOP },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi xóa lớp",
      error: err.message,
    });
  }
};

export {
  getAllClasses,
  getStudentsByClass,
  createClass,
  updateClass,
  deleteClass,
};
