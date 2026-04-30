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
  const { TENDN, MK } = req.body;

  try {
    const pool = await db.poolPromise;

    const result = await pool
      .request()
      .input("TENDN", sql.NVarChar(100), TENDN)
      .input("MK", sql.NVarChar(100), MK)
      .execute("SP_SEL_PUBLIC_NHANVIEN");

    const user = result.recordset[0];

    if (user.ErrorCode !== 0) {
      return res.status(mapAuthError(user.ErrorCode)).json({
        errorCode: user.ErrorCode,
        message: user.ErrorMessage,
      });
    }

    const token = jwt.sign(
      {
        MANV: user.MANV,
        TENDN,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        MANV: user.MANV,
        HOTEN: user.HOTEN,
        EMAIL: user.EMAIL,
        LUONGCB: user.LUONGCB,
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
