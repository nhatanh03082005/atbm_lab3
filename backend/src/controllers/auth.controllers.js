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

const login = async (req, res) => {
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

    if (user.ErrorCode !== 0) {
      return res.status(mapAuthError(user.ErrorCode)).json({
        errorCode: user.ErrorCode,
        message: user.ErrorMessage,
      });
    }

    const token = jwt.sign(
      { MANV: user.MANV, TENDN },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // LUONG là VARBINARY (cipher) → chuyển sang base64 để gửi xuống client
    const luongBase64 = user.LUONG ? user.LUONG.toString("base64") : null;

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        MANV: user.MANV,
        HOTEN: user.HOTEN,
        EMAIL: user.EMAIL,
        LUONG: luongBase64,  // cipher, client tự giải mã bằng private key
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

export default login;
