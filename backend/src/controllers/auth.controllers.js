import jwt from "jsonwebtoken";
import sql from "mssql";
import db from "../config/database.js";

const mapAuthError = (code) => {
  switch (code) {
    case 2000:
      return 401; // sai tk/mk
    case 2001:
      return 403; // bị khóa
    case 2002:
      return 401; // hết session
    default:
      return 500;
  }
};

const loginEmployee = async (req, res) => {
  // Client gửi MATKHAU_HEX: SHA-512 hex của mật khẩu (hash phía client)
  const { TENDN, MATKHAU_HEX } = req.body;

  if (!TENDN || !MATKHAU_HEX) {
    return res.status(400).json({ message: "Thiếu TENDN hoặc MATKHAU_HEX" });
  }

  try {
    const pool = await db.poolPromise;

    // Chuyển hex string → Buffer (VARBINARY) để truyền vào SP
    const matkhauBuffer = Buffer.from(MATKHAU_HEX, "hex");

    const result = await pool
      .request()
      .input("TENDN", sql.NVarChar(100), TENDN)
      .input("MATKHAU", sql.VarBinary(sql.MAX), matkhauBuffer)
      .execute("SP_SEL_PUBLIC_ENCRYPT_NHANVIEN");

    const user = result.recordset[0];

    if (!user) {
      return res.status(500).json({ message: "Lỗi đăng nhập" });
    }

    if (user.ErrorCode !== 0) {
      return res.status(mapAuthError(user.ErrorCode)).json({
        errorCode: user.ErrorCode,
        message: user.ErrorMessage,
      });
    }

    const token = jwt.sign({ MANV: user.MANV, TENDN }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // LUONG là VARBINARY (cipher) → chuyển sang base64 để gửi xuống client
    const luongBase64 = user.LUONG ? user.LUONG.toString("base64") : null;

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        MANV: user.MANV,
        HOTEN: user.HOTEN,
        EMAIL: user.EMAIL,
        LUONG: luongBase64, // cipher, client tự giải mã bằng private key
        PUBKEY: user.PUBKEY, // PEM public key, client dùng để mã hoá điểm
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi đăng nhập",
      error: err.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  const { TENDN, MATKHAU_HEX } = req.body;

  if (!TENDN || !MATKHAU_HEX) {
    return res.status(400).json({ message: "Thiếu TENDN hoặc MATKHAU_HEX" });
  }

  try {
    const pool = await db.poolPromise;
    const matkhauBuffer = Buffer.from(MATKHAU_HEX, "hex");

    const result = await pool
      .request()
      .input("TENDN", sql.NVarChar(100), TENDN)
      .input("MATKHAU", sql.VarBinary(sql.MAX), matkhauBuffer)
      .execute("SP_SEL_PUBLIC_ENCRYPT_ADMIN");

    const admin = result.recordset[0];

    if (!admin) {
      return res.status(500).json({ message: "Lỗi đăng nhập" });
    }

    if (admin.ErrorCode !== 0) {
      return res.status(mapAuthError(admin.ErrorCode)).json({
        errorCode: admin.ErrorCode,
        message: admin.ErrorMessage,
      });
    }

    const token = jwt.sign(
      { MAADMIN: admin.MAADMIN, TENDN: admin.TENDN || TENDN },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        MAADMIN: admin.MAADMIN,
        TENDN: admin.TENDN || TENDN,
        ROLE: "admin",
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi đăng nhập",
      error: err.message,
    });
  }
};

const registerEmployee = async (req, res) => {
  const { MANV, HOTEN, EMAIL, TENDN, MATKHAU_HEX, PUBKEY, LUONG_CIPHER_B64 } =
    req.body || {};

  if (!MANV || !HOTEN || !TENDN || !MATKHAU_HEX || !PUBKEY) {
    return res.status(400).json({
      message:
        "Thiếu dữ liệu bắt buộc: MANV, HOTEN, TENDN, MATKHAU_HEX, PUBKEY",
    });
  }

  try {
    const pool = await db.poolPromise;
    const matkhauBuffer = Buffer.from(MATKHAU_HEX, "hex");
    const luongBuffer = LUONG_CIPHER_B64
      ? Buffer.from(LUONG_CIPHER_B64, "base64")
      : null;

    const result = await pool
      .request()
      .input("MANV", sql.VarChar(20), MANV)
      .input("HOTEN", sql.NVarChar(100), HOTEN)
      .input("EMAIL", sql.VarChar(20), EMAIL || null)
      .input("LUONG", sql.VarBinary(sql.MAX), luongBuffer)
      .input("TENDN", sql.NVarChar(100), TENDN)
      .input("MATKHAU", sql.VarBinary(sql.MAX), matkhauBuffer)
      .input("PUBKEY", sql.VarChar(sql.MAX), PUBKEY)
      .execute("SP_INS_PUBLIC_ENCRYPT_NHANVIEN");

    const response = result.recordset?.[0];

    if (response?.ErrorCode && response.ErrorCode !== 0) {
      const status =
        response.ErrorCode === 1001 || response.ErrorCode === 1002 ? 409 : 400;
      return res.status(status).json({
        message: response.ErrorMessage,
        errorCode: response.ErrorCode,
      });
    }

    return res.status(201).json({
      message: response?.ErrorMessage || "Thêm nhân viên thành công",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi hệ thống: Không thể đăng ký nhân viên",
      error: err.message,
    });
  }
};

export { loginEmployee, loginAdmin, registerEmployee };
