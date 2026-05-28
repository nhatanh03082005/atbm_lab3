import db from "../config/database.js";
import sql from "mssql";

const mapAdminError = (code) => {
  switch (code) {
    case 1001:
      return 404;
    case 2001:
      return 403;
    case 9999:
      return 500;
    default:
      return 400;
  }
};

const getAdminEmployees = async (req, res) => {
  const { MAADMIN, MATKHAU_HEX } = req.body || {};

  if (!MAADMIN || !MATKHAU_HEX) {
    return res.status(400).json({
      message: "Thiếu MAADMIN hoặc MATKHAU_HEX",
    });
  }

  try {
    const pool = await db.poolPromise;
    const matkhauBuffer = Buffer.from(MATKHAU_HEX, "hex");

    const result = await pool
      .request()
      .input("MAADMIN", sql.VarChar(20), MAADMIN)
      .input("MATKHAU_ADMIN", sql.VarBinary(sql.MAX), matkhauBuffer)
      .execute("SP_SEL_ADMIN_NHANVIEN_LIST");

    const rows = result.recordset || [];
    const firstRow = rows[0];

    if (
      firstRow &&
      Object.prototype.hasOwnProperty.call(firstRow, "ErrorCode") &&
      firstRow.ErrorCode !== 0 &&
      !Object.prototype.hasOwnProperty.call(firstRow, "MANV")
    ) {
      return res.status(mapAdminError(firstRow.ErrorCode)).json({
        message: firstRow.ErrorMessage,
        errorCode: firstRow.ErrorCode,
      });
    }

    const data = rows.map((row) => ({
      MANV: row.MANV,
      HOTEN: row.HOTEN,
      EMAIL: row.EMAIL,
      PUBKEY: row.PUBKEY,
    }));

    return res.status(200).json({
      message: firstRow?.ErrorMessage || "Thành công",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi hệ thống: Không thể lấy danh sách nhân viên",
      error: err.message,
    });
  }
};

const updateEmployeeSalary = async (req, res) => {
  const { MANV, LUONG_CIPHER_B64, MAADMIN, MATKHAU_HEX } = req.body || {};

  if (!MANV || !LUONG_CIPHER_B64 || !MAADMIN || !MATKHAU_HEX) {
    return res.status(400).json({
      message: "Thiếu MANV, LUONG_CIPHER_B64, MAADMIN hoặc MATKHAU_HEX",
    });
  }

  try {
    const pool = await db.poolPromise;
    const matkhauBuffer = Buffer.from(MATKHAU_HEX, "hex");
    const luongBuffer = Buffer.from(LUONG_CIPHER_B64, "base64");

    const result = await pool
      .request()
      .input("MANV", sql.VarChar(20), MANV)
      .input("LUONG_CIPHER", sql.VarBinary(sql.MAX), luongBuffer)
      .input("MAADMIN", sql.VarChar(20), MAADMIN)
      .input("MATKHAU_ADMIN", sql.VarBinary(sql.MAX), matkhauBuffer)
      .execute("SP_UPD_ADMIN_ENCRYPT_LUONG");

    const response = result.recordset?.[0];

    if (response?.ErrorCode && response.ErrorCode !== 0) {
      return res.status(mapAdminError(response.ErrorCode)).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
      });
    }

    return res.status(200).json({
      message: response?.ErrorMessage || "Cập nhật lương thành công",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi hệ thống: Không thể cập nhật lương",
      error: err.message,
    });
  }
};

export { getAdminEmployees, updateEmployeeSalary };
