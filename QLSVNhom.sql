CREATE DATABASE QLSVNhom
GO

USE QLSVNhom
GO

-- Table SinhVien
CREATE TABLE SINHVIEN (
    MASV        VARCHAR(20)    NOT NULL, 
    HOTEN       NVARCHAR(100)   NOT NULL,
    NGAYSINH    DATETIME        NULL,
    DIACHI      NVARCHAR(200)   NULL,
    MALOP       VARCHAR(20)    NULL,     
    TENDN       NVARCHAR(100)   NOT NULL,
    MATKHAU     VARBINARY(MAX)  NOT NULL,
    
    CONSTRAINT PK_SINHVIEN PRIMARY KEY (MASV),
    CONSTRAINT UQ_SV_TENDN UNIQUE (TENDN)
);
GO


-- Table NhanVien
CREATE TABLE NHANVIEN (
    MANV        VARCHAR(20)    NOT NULL,  
    HOTEN       NVARCHAR(100)   NOT NULL,
    EMAIL       VARCHAR(20)    NULL,     
    LUONG       VARBINARY(MAX)  NULL,
    TENDN       NVARCHAR(100)   NOT NULL,
    MATKHAU     VARBINARY(MAX)  NOT NULL,
    PUBKEY      VARCHAR(MAX)   NULL,      
    
    CONSTRAINT PK_NHANVIEN PRIMARY KEY (MANV),
    CONSTRAINT UQ_NV_TENDN UNIQUE (TENDN)
);
GO

-- Table Lop
CREATE TABLE LOP (
    MALOP       VARCHAR(20)    NOT NULL, 
    TENLOP      NVARCHAR(100)   NOT NULL,
    MANV        VARCHAR(20)    NULL,      
    
    CONSTRAINT PK_LOP PRIMARY KEY (MALOP),
    CONSTRAINT FK_LOP_NHANVIEN FOREIGN KEY (MANV)
        REFERENCES NHANVIEN(MANV)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
GO

-- Table HocPhan
CREATE TABLE HOCPHAN (
    MAHP        VARCHAR(20)    NOT NULL,  
    TENHP       NVARCHAR(100)   NOT NULL,
    SOTC        INT             NULL,
    
    CONSTRAINT PK_HOCPHAN PRIMARY KEY (MAHP)
);
GO

-- Table BangDiem
CREATE TABLE BANGDIEM (
    MASV        VARCHAR(20)    NOT NULL,  
    MAHP        VARCHAR(20)    NOT NULL,  
    DIEMTHI     VARBINARY(MAX)  NULL,
    
    CONSTRAINT PK_BANGDIEM PRIMARY KEY (MASV, MAHP),
    CONSTRAINT FK_BD_SINHVIEN FOREIGN KEY (MASV)
        REFERENCES SINHVIEN(MASV),
    CONSTRAINT FK_BD_HOCPHAN FOREIGN KEY (MAHP)
        REFERENCES HOCPHAN(MAHP)
);
GO

-- Thêm khóa ngoại cho SINHVIEN
ALTER TABLE SINHVIEN
    ADD CONSTRAINT FK_SV_LOP
    FOREIGN KEY (MALOP) REFERENCES LOP(MALOP)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
GO




-- ============================================
-- BANG ADMIN (THEM VAO SCHEMA HIEN TAI)
-- Khong anh huong gi den cac bang cu
-- ============================================
CREATE TABLE ADMIN (
    MAADMIN     VARCHAR(20)     NOT NULL,
    TENDN       NVARCHAR(100)   NOT NULL,
    MATKHAU     VARBINARY(MAX)  NOT NULL,   -- SHA2_512 hash, xu ly tren client

    CONSTRAINT PK_ADMIN     PRIMARY KEY (MAADMIN),
    CONSTRAINT UQ_ADMIN_DN  UNIQUE (TENDN)
);
GO


-- ============================================
-- SP DANG NHAP ADMIN
-- Client gui: TENDN + hash(MATKHAU)
-- SP tra ve MAADMIN de client luu session
-- ============================================
CREATE PROCEDURE SP_SEL_PUBLIC_ENCRYPT_ADMIN
    @TENDN      NVARCHAR(100),
    @MATKHAU    VARBINARY(MAX)   -- Hash xu ly tren client
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorCode      INT           = 0;
    DECLARE @ErrorMsg       NVARCHAR(4000) = N'';
    DECLARE @MAADMIN        VARCHAR(20);
    DECLARE @StoredHash     VARBINARY(MAX);
    DECLARE @IsAuth         BIT           = 0;

    BEGIN TRY

        -- Lay thong tin admin
        SELECT
            @MAADMIN    = MAADMIN,
            @StoredHash = MATKHAU
        FROM ADMIN
        WHERE TENDN = @TENDN;

        -- Xac thuc
        IF @MAADMIN IS NOT NULL AND @StoredHash = @MATKHAU
            SET @IsAuth = 1;

        IF @IsAuth = 0
        BEGIN
            SET @ErrorCode = 2000;
            SET @ErrorMsg  = N'Tên đăng nhập hoặc mật khẩu không chính xác';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Thanh cong: tra ve MAADMIN de client luu
        SET @ErrorCode = 0;
        SET @ErrorMsg  = N'Đăng nhập thành công';

        SELECT
            @ErrorCode  AS ErrorCode,
            @ErrorMsg   AS ErrorMessage,
            MAADMIN,
            TENDN
        FROM ADMIN
        WHERE MAADMIN = @MAADMIN;

    END TRY
    BEGIN CATCH
        -- Bao loi chung, khong tiet lo thong tin noi bo
        SET @ErrorCode = 2000;
        SET @ErrorMsg  = N'Tên đăng nhập hoặc mật khẩu không chính xác';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- ============================================
-- SP LAY DANH SACH NHAN VIEN (DANH CHO ADMIN)
-- Chi tra ve: MANV, HOTEN, EMAIL, PUBKEY
-- LUONG (cipher) KHONG tra ra o day vi chi admin
-- cap nhat luong, khong can hien thi
-- ============================================
CREATE PROCEDURE SP_SEL_ADMIN_NHANVIEN_LIST
    @MAADMIN        VARCHAR(20),
    @MATKHAU_ADMIN  VARBINARY(MAX)   -- Hash xu ly tren client
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorCode  INT            = 0;
    DECLARE @ErrorMsg   NVARCHAR(4000) = N'';
    DECLARE @StoredHash VARBINARY(MAX);

    BEGIN TRY

        -- ===== GUARD: XAC THUC ADMIN =====
        SELECT @StoredHash = MATKHAU
        FROM ADMIN
        WHERE MAADMIN = @MAADMIN;

        IF @StoredHash IS NULL OR @StoredHash != @MATKHAU_ADMIN
        BEGIN
            SET @ErrorCode = 2001;
            SET @ErrorMsg  = N'Không có quyền truy cập';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        -- ===== END GUARD =====

        SET @ErrorCode = 0;
        SET @ErrorMsg  = N'Thành công';

        SELECT
            @ErrorCode  AS ErrorCode,
            @ErrorMsg   AS ErrorMessage,
            MANV,
            HOTEN,
            EMAIL,
            PUBKEY      -- Client dung PUBKEY nay de ma hoa luong moi truoc khi gui len
        FROM NHANVIEN
        ORDER BY MANV;

    END TRY
    BEGIN CATCH
        SET @ErrorCode = 9999;
        SET @ErrorMsg  = N'Lỗi hệ thống: Không thể lấy danh sách nhân viên';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- ============================================
-- SP CAP NHAT LUONG NHAN VIEN (CHI ADMIN)
--
-- Luong flow:
--   1. Admin goi SP_SEL_ADMIN_NHANVIEN_LIST -> lay PUBKEY cua NV
--   2. Client ma hoa luong_moi bang PUBKEY do (RSA)
--   3. Gui cipher xuong day, SP luu thang vao DB
--
-- Bao mat:
--   - SP yeu cau MAADMIN + MATKHAU_ADMIN hop le moi chay
--   - SP co WITH ENCRYPTION, khong ai doc duoc noi dung
--   - Luong luon o dang ma hoa trong DB, chi NV moi giai ma bang private key
-- ============================================
CREATE PROCEDURE SP_UPD_ADMIN_ENCRYPT_LUONG
    @MANV           VARCHAR(20),
    @LUONG_CIPHER   VARBINARY(MAX),  -- Cipher: client dung PUBKEY cua NV ma hoa
    @MAADMIN        VARCHAR(20),
    @MATKHAU_ADMIN  VARBINARY(MAX)   -- Hash xu ly tren client
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorCode  INT            = 0;
    DECLARE @ErrorMsg   NVARCHAR(4000) = N'';
    DECLARE @StoredHash VARBINARY(MAX);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- ===== GUARD: XAC THUC ADMIN =====
        -- Neu sai credential → loi chung, khong tiet lo ly do cu the
        SELECT @StoredHash = MATKHAU
        FROM ADMIN
        WHERE MAADMIN = @MAADMIN;

        IF @StoredHash IS NULL OR @StoredHash != @MATKHAU_ADMIN
        BEGIN
            SET @ErrorCode = 2001;
            SET @ErrorMsg  = N'Không có quyền thực hiện thao tác này';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        -- ===== END GUARD =====

        -- Kiem tra nhan vien ton tai
        IF NOT EXISTS (SELECT 1 FROM NHANVIEN WHERE MANV = @MANV)
        BEGIN
            SET @ErrorCode = 1001;
            SET @ErrorMsg  = N'Mã nhân viên không tồn tại';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Cap nhat luong (cipher tu client, khong biet gia tri thuc)
        UPDATE NHANVIEN
        SET LUONG = @LUONG_CIPHER
        WHERE MANV = @MANV;

        COMMIT TRANSACTION;

        SET @ErrorCode = 0;
        SET @ErrorMsg  = N'Cập nhật lương thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;

    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @ErrorCode = 9999;
        SET @ErrorMsg  = N'Lỗi hệ thống: Không thể cập nhật lương';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- ============================================
-- INSERT ADMIN DAU TIEN (CHAY 1 LAN DUY NHAT)
-- Thay 'admin001', 'admin', 'your_strong_password' bang gia tri thuc
-- MATKHAU = HASHBYTES('SHA2_512', N'your_strong_password')
-- Sau khi insert xong, XOA hoac COMMENT doan nay lai
-- ============================================

INSERT INTO ADMIN (MAADMIN, TENDN, MATKHAU) 
VALUES ('ADMIN001', 'admin', 0xd10e92508ba207721b019d87747e5fea84c04dafe8708c6964d166558e9aa355d72f42929e0dec94f3ff674e4b3c3b8bee51bfc9b3d25113e420ecd228d7c2ce);




GO
CREATE PROCEDURE SP_INS_PUBLIC_ENCRYPT_NHANVIEN
    @MANV       VARCHAR(20),
    @HOTEN      NVARCHAR(100),
    @EMAIL      VARCHAR(20) = NULL,
    @LUONG      VARBINARY(MAX),
    @TENDN      NVARCHAR(100),
    @MATKHAU    VARBINARY(MAX),
    @PUBKEY     VARCHAR(MAX)
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Kiểm tra tồn tại nhân viên
        IF EXISTS (SELECT 1 FROM NHANVIEN WHERE MANV = @MANV)
        BEGIN
            SET @ErrorCode = 1001;
            SET @ErrorMsg = N'Nhân viên đã tồn tại';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Kiểm tra tồn tại tên đăng nhập
        IF EXISTS (SELECT 1 FROM NHANVIEN WHERE TENDN = @TENDN)
        BEGIN
            SET @ErrorCode = 1002;
            SET @ErrorMsg = N'Tên đăng nhập đã tồn tại';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        INSERT INTO NHANVIEN (MANV, HOTEN, EMAIL, LUONG, TENDN, MATKHAU, PUBKEY)
        VALUES (
            @MANV,
            @HOTEN,
            @EMAIL,
            @LUONG,
            @TENDN,
            @MATKHAU,
            @PUBKEY
        );

        COMMIT TRANSACTION;

        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Thêm nhân viên thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;

    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @ErrorCode = 1999;
        SET @ErrorMsg = N'Lỗi hệ thống: ' + ERROR_MESSAGE();
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


GO
CREATE PROCEDURE SP_SEL_PUBLIC_ENCRYPT_NHANVIEN
    @TENDN      NVARCHAR(100),
    @MATKHAU    VARBINARY(MAX)  -- Nhận hash đã được xử lý từ client
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorCode      INT = 0;
    DECLARE @ErrorMsg       NVARCHAR(4000) = N'';
    DECLARE @MANV           VARCHAR(20);
    DECLARE @StoredHash     VARBINARY(MAX);
    DECLARE @IsAuthenticated BIT = 0;

    BEGIN TRY

        -- Lấy thông tin xác thực
        SELECT
            @MANV       = MANV,
            @StoredHash = MATKHAU
        FROM NHANVIEN
        WHERE TENDN = @TENDN;

        -- Xác thực: so sánh hash từ client với hash đã lưu
        IF @MANV IS NOT NULL AND @StoredHash = @MATKHAU
        BEGIN
            SET @IsAuthenticated = 1;
        END;

        IF @IsAuthenticated = 0
        BEGIN
            SET @ErrorCode = 2000;
            SET @ErrorMsg  = N'Tên đăng nhập hoặc mật khẩu không chính xác';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Trả về dữ liệu, LUONG vẫn ở dạng mã hoá để client tự giải mã
        SET @ErrorCode = 0;
        SET @ErrorMsg  = N'Thành công';

        SELECT
            @ErrorCode  AS ErrorCode,
            @ErrorMsg   AS ErrorMessage,
            MANV,
            HOTEN,
            EMAIL,
            LUONG,      -- Trả về cipher, client dùng private key để giải mã
            PUBKEY      -- Trả về để client lưu lại phục vụ mã hoá về sau
        FROM NHANVIEN
        WHERE MANV = @MANV;

    END TRY
    BEGIN CATCH
        SET @ErrorCode = 2000;
        SET @ErrorMsg  = N'Tên đăng nhập hoặc mật khẩu không chính xác';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO

--========
--========
-- Quan ly lop hoc
CREATE PROCEDURE SP_INS_PUBLIC_LOPHOC
    @MALOP      VARCHAR(20),
    @TENLOP     NVARCHAR(100),
    @MANV       VARCHAR(20) = NULL 
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    
    BEGIN TRY
        -- Kiểm tra mã lớp đã tồn tại chưa
        IF EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP)
        BEGIN
            SET @ErrorCode = 3001;
            SET @ErrorMsg = N'Mã lớp đã tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
       
        
        -- Kiểm tra giảng viên chủ nhiệm có tồn tại không (nếu có nhập MANV)
        IF @MANV IS NOT NULL AND NOT EXISTS (SELECT 1 FROM NHANVIEN WHERE MANV = @MANV)
        BEGIN
            SET @ErrorCode = 3003;
            SET @ErrorMsg = N'Mã nhân viên (giảng viên) không tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Thêm lớp mới
        INSERT INTO LOP (MALOP, TENLOP, MANV)
        VALUES (@MALOP, @TENLOP, @MANV);
        
        -- Thành công
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Thêm lớp học thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
        
    END TRY
    BEGIN CATCH
        -- Xử lý lỗi hệ thống
        SET @ErrorCode = 3999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể thêm lớp học';
        
        
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- Lay thong tin tat ca lop hoc
CREATE PROCEDURE SP_SEL_PUBLIC_LOPHOC

AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    
    BEGIN TRY
        
        -- Thành công
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Thành công';
        
        SELECT 
            @ErrorCode AS ErrorCode,
            @ErrorMsg AS ErrorMessage,
            L.MALOP,
            L.TENLOP,
			L.MANV,
            NV.HOTEN 
        FROM LOP L
        LEFT JOIN NHANVIEN NV ON L.MANV = NV.MANV;
        
    END TRY
    BEGIN CATCH
        SET @ErrorCode = 3999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể truy xuất dữ liệu';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- Xoa Lop Hoc (CO KIEM TRA QUYEN - CHI GVCN MOI DUOC XOA)
CREATE PROCEDURE SP_DEL_PUBLIC_LOPHOC
    @MALOP      VARCHAR(20),
    @MANV_LOGIN VARCHAR(20)  -- THÊM: Nhan vien dang thuc hien
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    DECLARE @CurrentMANV_LOP VARCHAR(20);
    
    BEGIN TRY
        -- Kiểm tra mã lớp có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP)
        BEGIN
            SET @ErrorCode = 3001;
            SET @ErrorMsg = N'Mã lớp không tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Lấy MANV của lớp (giảng viên chủ nhiệm)
        SELECT @CurrentMANV_LOP = MANV FROM LOP WHERE MALOP = @MALOP;
        
        -- ========== KIỂM TRA QUYỀN ==========
        -- Chỉ giảng viên chủ nhiệm mới được xóa lớp
        IF @CurrentMANV_LOP != @MANV_LOGIN
        BEGIN
            SET @ErrorCode = 3005;
            SET @ErrorMsg = N'Bạn không có quyền xóa lớp học này. Chỉ giảng viên chủ nhiệm mới được xóa.';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Kiểm tra xem lớp có sinh viên không
        IF EXISTS (SELECT 1 FROM SINHVIEN WHERE MALOP = @MALOP)
        BEGIN
            SET @ErrorCode = 3004;
            SET @ErrorMsg = N'Không thể xóa lớp vì vẫn còn sinh viên. Vui lòng chuyển sinh viên sang lớp khác trước.';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Xóa lớp
        DELETE FROM LOP WHERE MALOP = @MALOP;
        
        -- Thành công
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Xóa lớp học thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
        
    END TRY
    BEGIN CATCH
        SET @ErrorCode = 3999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể xóa lớp học';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO

-- Sua Lop Hoc (CHI CAP NHAT TEN LOP)
CREATE PROCEDURE SP_UPD_PUBLIC_LOPHOC
    @MALOP      VARCHAR(20),
    @TENLOP     NVARCHAR(100) = NULL,  -- CHI cap nhat ten lop
    @MANV_LOGIN VARCHAR(20)  -- Nhan vien dang thuc hien (kiem tra quyen)
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    DECLARE @CurrentMANV_LOP VARCHAR(20);
    DECLARE @OldTENLOP NVARCHAR(100);
    
    BEGIN TRY
        -- Kiểm tra mã lớp có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP)
        BEGIN
            SET @ErrorCode = 3001;
            SET @ErrorMsg = N'Mã lớp không tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Lấy thông tin hiện tại của lớp
        SELECT 
            @CurrentMANV_LOP = MANV,
            @OldTENLOP = TENLOP
        FROM LOP 
        WHERE MALOP = @MALOP;
        
        -- ========== KIỂM TRA QUYỀN ==========
        -- Chỉ giảng viên chủ nhiệm mới được sửa tên lớp
        IF @CurrentMANV_LOP != @MANV_LOGIN
        BEGIN
            SET @ErrorCode = 3005;
            SET @ErrorMsg = N'Bạn không có quyền sửa lớp học này. Chỉ giảng viên chủ nhiệm mới được sửa.';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Kiểm tra tên lớp mới có bị trùng không (nếu có cập nhật)
        IF @TENLOP IS NOT NULL AND @TENLOP != @OldTENLOP
        BEGIN
            IF EXISTS (SELECT 1 FROM LOP WHERE TENLOP = @TENLOP AND MALOP != @MALOP)
            BEGIN
                SET @ErrorCode = 3002;
                SET @ErrorMsg = N'Tên lớp đã tồn tại';
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;
        
        -- CHI cap nhat TENLOP, KHONG cap nhat MANV
        UPDATE LOP
        SET TENLOP = ISNULL(@TENLOP, TENLOP)
        -- KHONG co dong: MANV = ISNULL(@MANV, MANV)
        WHERE MALOP = @MALOP;
        
        -- Thành công
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Cập nhật tên lớp học thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
        
    END TRY
    BEGIN CATCH
        SET @ErrorCode = 3999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể cập nhật tên lớp học';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO




-- ============================================
-- LAY DANH SACH SINH VIEN THEO LOP 
-- ============================================
CREATE PROCEDURE SP_SEL_SINHVIEN_BY_LOP
    @MALOP      VARCHAR(20),
    @MANV_LOGIN VARCHAR(20)  -- MANV cua nhan vien dang dang nhap
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    DECLARE @TenLop NVARCHAR(100);
    DECLARE @TenGVCN NVARCHAR(100);
    DECLARE @MANV_LOP VARCHAR(20);
    
    BEGIN TRY
        -- Kiem tra lop co ton tai khong
        IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP)
        BEGIN
            SET @ErrorCode = 3001;
            SET @ErrorMsg = N'Mã lớp không tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Lay thong tin lop (SỬA: chỉ định rõ bảng LOP.MANV)
        SELECT 
            @TenLop = L.TENLOP,
            @MANV_LOP = L.MANV,  -- SỬA: L.MANV thay vì MANV
            @TenGVCN = NV.HOTEN
        FROM LOP L
        LEFT JOIN NHANVIEN NV ON L.MANV = NV.MANV
        WHERE L.MALOP = @MALOP;
        
        -- Thanh cong
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Thành công';
        
        -- Tra ve: Header info + Danh sach sinh vien + Quyen han
        SELECT 
            @ErrorCode AS ErrorCode,
            @ErrorMsg AS ErrorMessage,
            @TenLop AS TENLOP,
            @TenGVCN AS TENGVCN,
            @MANV_LOP AS MANV_LOP,
            -- Quyen han: 1 = co quyen sua, 0 = chi xem
            CASE WHEN @MANV_LOP = @MANV_LOGIN THEN 1 ELSE 0 END AS IS_ALLOW_EDIT,
            -- Danh sach sinh vien (JSON format)
            (
                SELECT 
                    MASV,
                    HOTEN,
                    CONVERT(VARCHAR(10), NGAYSINH, 103) AS NGAYSINH,  -- dd/MM/yyyy
                    DIACHI,
                    TENDN
                FROM SINHVIEN
                WHERE MALOP = @MALOP
                FOR JSON PATH
            ) AS SINHVIEN_LIST;
        
    END TRY
    BEGIN CATCH
        SET @ErrorCode = 3999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể truy xuất dữ liệu sinh viên';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- ============================================
-- CAP NHAT THONG TIN SINH VIEN (CO KIEM TRA QUYEN)
-- ============================================
CREATE PROCEDURE SP_UPD_PUBLIC_SINHVIEN
    @MASV       VARCHAR(20),
    @HOTEN      NVARCHAR(100) = NULL,
    @NGAYSINH   DATETIME = NULL,
    @DIACHI     NVARCHAR(200) = NULL,
    @TENDN      NVARCHAR(100) = NULL,
    @MANV_LOGIN VARCHAR(20)  -- Nhan vien dang thuc hien
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    DECLARE @MALOP_SV VARCHAR(20);
    DECLARE @MANV_LOP VARCHAR(20);
    
    BEGIN TRY
        -- Kiem tra sinh vien co ton tai khong
        IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
        BEGIN
            SET @ErrorCode = 4001;
            SET @ErrorMsg = N'Mã sinh viên không tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Lay lop cua sinh vien
        SELECT @MALOP_SV = MALOP FROM SINHVIEN WHERE MASV = @MASV;
        
        -- Kiem tra quyen cua nhan vien
        IF @MALOP_SV IS NOT NULL
        BEGIN
            SELECT @MANV_LOP = MANV FROM LOP WHERE MALOP = @MALOP_SV;
            
            IF @MANV_LOP != @MANV_LOGIN
            BEGIN
                SET @ErrorCode = 4002;
                SET @ErrorMsg = N'Bạn không có quyền sửa thông tin sinh viên của lớp này';
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;
        
        -- Kiem tra ten dang nhap moi khong bi trung (neu co cap nhat)
        IF @TENDN IS NOT NULL
        BEGIN
            IF EXISTS (SELECT 1 FROM SINHVIEN WHERE TENDN = @TENDN AND MASV != @MASV)
            BEGIN
                SET @ErrorCode = 4003;
                SET @ErrorMsg = N'Tên đăng nhập đã tồn tại';
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;
        
        -- Cap nhat thong tin sinh vien
        UPDATE SINHVIEN
        SET 
            HOTEN = ISNULL(@HOTEN, HOTEN),
            NGAYSINH = ISNULL(@NGAYSINH, NGAYSINH),
            DIACHI = ISNULL(@DIACHI, DIACHI),
            TENDN = ISNULL(@TENDN, TENDN)
        WHERE MASV = @MASV;
        
        -- Thanh cong
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Cập nhật thông tin sinh viên thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
        
    END TRY
    BEGIN CATCH
        SET @ErrorCode = 4999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể cập nhật thông tin sinh viên';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- ============================================
-- CHUYEN LOP CHO SINH VIEN (SUA LOP HOC)
-- ============================================
CREATE PROCEDURE SP_UPD_SINHVIEN_CLASS
    @MASV       VARCHAR(20),
    @MALOP_MOI  VARCHAR(20) = NULL,  -- NULL: chuyển ra khỏi lớp (MALOP = NULL)
    @MANV_LOGIN VARCHAR(20)  -- Nhan vien dang thuc hien (kiem tra quyen)
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    DECLARE @MALOP_CU VARCHAR(20);
    DECLARE @MANV_LOP_MOI VARCHAR(20);
    DECLARE @MANV_LOP_CU VARCHAR(20);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- ========== KIEM TRA SINH VIEN ==========
        IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
        BEGIN
            SET @ErrorCode = 4001;
            SET @ErrorMsg = N'Mã sinh viên không tồn tại';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Lay lop hien tai cua sinh vien
        SELECT @MALOP_CU = MALOP FROM SINHVIEN WHERE MASV = @MASV;
        
        -- ========== KIEM TRA LOP MOI ==========
        IF @MALOP_MOI IS NOT NULL
        BEGIN
            -- Kiem tra lop moi co ton tai khong
            IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP_MOI)
            BEGIN
                SET @ErrorCode = 3001;
                SET @ErrorMsg = N'Mã lớp mới không tồn tại';
                ROLLBACK;
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
            
            -- Lay MANV cua lop moi
            SELECT @MANV_LOP_MOI = MANV FROM LOP WHERE MALOP = @MALOP_MOI;
            
            -- Kiem tra quyen: Chi giang vien chu nhiem cua lop MOI moi duoc chuyen sinh vien vao
            IF @MANV_LOP_MOI != @MANV_LOGIN
            BEGIN
                SET @ErrorCode = 4002;
                SET @ErrorMsg = N'Bạn không có quyền thêm sinh viên vào lớp ' + @MALOP_MOI;
                ROLLBACK;
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;
        
        -- ========== KIEM TRA QUYEN XOA KHOI LOP CU ==========
        -- Neu sinh vien dang thuoc lop cu, can kiem tra quyen cua giao vien hien tai
        IF @MALOP_CU IS NOT NULL
        BEGIN
            SELECT @MANV_LOP_CU = MANV FROM LOP WHERE MALOP = @MALOP_CU;
            
            -- Neu chuyen sang lop khac, can co quyen cua lop cu hoac quyen dac biet
            -- Quy dinh: Giao vien chu nhiem lop cu cung co quyen chuyen di
            IF @MANV_LOP_CU != @MANV_LOGIN AND @MANV_LOP_MOI != @MANV_LOGIN
            BEGIN
                SET @ErrorCode = 4002;
                SET @ErrorMsg = N'Bạn không có quyền chuyển sinh viên này (không phải GVCN của lớp cũ hoặc lớp mới)';
                ROLLBACK;
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;
        
        -- ========== CAP NHAT LOP CHO SINH VIEN ==========
        UPDATE SINHVIEN
        SET MALOP = @MALOP_MOI
        WHERE MASV = @MASV;
        
        COMMIT TRANSACTION;
        
        -- ========== THANH CONG ==========
        SET @ErrorCode = 0;
        
        IF @MALOP_MOI IS NULL
            SET @ErrorMsg = N'Chuyển sinh viên ra khỏi lớp thành công';
        ELSE IF @MALOP_CU IS NULL
            SET @ErrorMsg = N'Thêm sinh viên vào lớp ' + @MALOP_MOI + N' thành công';
        ELSE
            SET @ErrorMsg = N'Chuyển sinh viên từ lớp ' + ISNULL(@MALOP_CU, N'NULL') + 
                           N' sang lớp ' + @MALOP_MOI + N' thành công';
        
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
        
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @ErrorCode = 4999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể chuyển lớp cho sinh viên';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO

-- ============================================
-- LAY DANH SACH HOC PHAN (CHO COMBOBOX)
-- ============================================
CREATE PROCEDURE SP_SEL_HOCPHAN_LIST
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    
    BEGIN TRY
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Thành công';
        
        SELECT 
            MAHP,
            TENHP,
            SOTC
        FROM HOCPHAN
        ORDER BY MAHP;
        
    END TRY
    BEGIN CATCH
        SET @ErrorCode = 5999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể lấy danh sách học phần';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- ============================================
-- THEM SINH VIEN MOI (CO MA HOA MAT KHAU)
-- ============================================
CREATE PROCEDURE SP_INS_PUBLIC_SINHVIEN
    @MASV       VARCHAR(20),
    @HOTEN      NVARCHAR(100),
    @NGAYSINH   DATETIME = NULL,
    @DIACHI     NVARCHAR(200) = NULL,
    @MALOP      VARCHAR(20) = NULL,
    @TENDN      NVARCHAR(100),
    @MK         NVARCHAR(100),
    @MANV_LOGIN VARCHAR(20)  -- Nhan vien dang thuc hien (kiem tra quyen)
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    DECLARE @MANV_LOP VARCHAR(20);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiem tra ma sinh vien da ton tai chua
        IF EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
        BEGIN
            SET @ErrorCode = 4001;
            SET @ErrorMsg = N'Mã sinh viên đã tồn tại';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Kiem tra ten dang nhap da ton tai chua
        IF EXISTS (SELECT 1 FROM SINHVIEN WHERE TENDN = @TENDN)
        BEGIN
            SET @ErrorCode = 4003;
            SET @ErrorMsg = N'Tên đăng nhập đã tồn tại';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Kiem tra lop co ton tai khong (neu co nhap MALOP)
        IF @MALOP IS NOT NULL
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM LOP WHERE MALOP = @MALOP)
            BEGIN
                SET @ErrorCode = 3001;
                SET @ErrorMsg = N'Mã lớp không tồn tại';
                ROLLBACK;
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
            
            -- Kiem tra quyen: Chi giang vien chu nhiem moi duoc them sinh vien vao lop
            SELECT @MANV_LOP = MANV FROM LOP WHERE MALOP = @MALOP;
            
            IF @MANV_LOP != @MANV_LOGIN
            BEGIN
                SET @ErrorCode = 4002;
                SET @ErrorMsg = N'Bạn không có quyền thêm sinh viên vào lớp này';
                ROLLBACK;
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;
        
        -- Them sinh vien moi (mat khau hash SHA2_512)
        INSERT INTO SINHVIEN (MASV, HOTEN, NGAYSINH, DIACHI, MALOP, TENDN, MATKHAU)
        VALUES (
            @MASV,
            @HOTEN,
            @NGAYSINH,
            @DIACHI,
            @MALOP,
            @TENDN,
            HASHBYTES('SHA2_512', @MK)
        );
        
        COMMIT TRANSACTION;
        
        -- Thanh cong
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Thêm sinh viên thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
        
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @ErrorCode = 4999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể thêm sinh viên';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO



-- ============================================
-- 1. SP_INS_PUBLIC_ENCRYPT_BANGDIEM
-- ============================================
GO
CREATE PROCEDURE SP_INS_PUBLIC_ENCRYPT_BANGDIEM
    @MASV           VARCHAR(20),
    @MAHP           VARCHAR(20),
    @DIEMTHI        VARBINARY(MAX),  -- Cipher đã mã hoá từ client
    @MANV_LOGIN     VARCHAR(20)
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorCode  INT = 0;
    DECLARE @ErrorMsg   NVARCHAR(4000) = N'';
    DECLARE @MALOP_SV   VARCHAR(20);
    DECLARE @MANV_LOP   VARCHAR(20);
    DECLARE @PUBKEY_NV  VARCHAR(20);

    BEGIN TRY

        -- Kiểm tra sinh viên tồn tại
        IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
        BEGIN
            SET @ErrorCode = 4001;
            SET @ErrorMsg  = N'Mã sinh viên không tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Kiểm tra học phần tồn tại
        IF NOT EXISTS (SELECT 1 FROM HOCPHAN WHERE MAHP = @MAHP)
        BEGIN
            SET @ErrorCode = 5001;
            SET @ErrorMsg  = N'Mã học phần không tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Kiểm tra quyền nhân viên
        SELECT @MALOP_SV = MALOP FROM SINHVIEN WHERE MASV = @MASV;

        IF @MALOP_SV IS NOT NULL
        BEGIN
            SELECT @MANV_LOP = MANV FROM LOP WHERE MALOP = @MALOP_SV;

            IF @MANV_LOP != @MANV_LOGIN
            BEGIN
                SET @ErrorCode = 4002;
                SET @ErrorMsg  = N'Bạn không có quyền nhập điểm cho sinh viên của lớp này';
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;

        -- Kiểm tra PUBKEY nhân viên
        SELECT @PUBKEY_NV = PUBKEY FROM NHANVIEN WHERE MANV = @MANV_LOGIN;

        IF @PUBKEY_NV IS NULL
        BEGIN
            SET @ErrorCode = 5002;
            SET @ErrorMsg  = N'Không tìm thấy key bảo mật của nhân viên';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Lưu điểm đã mã hoá từ client (upsert)
        IF EXISTS (SELECT 1 FROM BANGDIEM WHERE MASV = @MASV AND MAHP = @MAHP)
        BEGIN
            UPDATE BANGDIEM
            SET DIEMTHI = @DIEMTHI
            WHERE MASV = @MASV AND MAHP = @MAHP;

            SET @ErrorMsg = N'Cập nhật điểm thành công';
        END
        ELSE
        BEGIN
            INSERT INTO BANGDIEM (MASV, MAHP, DIEMTHI)
            VALUES (@MASV, @MAHP, @DIEMTHI);

            SET @ErrorMsg = N'Thêm điểm thành công';
        END;

        SET @ErrorCode = 0;
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;

    END TRY
    BEGIN CATCH
        SET @ErrorCode = 5999;
        SET @ErrorMsg  = N'Lỗi hệ thống: Không thể lưu bảng điểm';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


-- ============================================
-- 2. SP_SEL_PUBLIC_ENCRYPT_BANGDIEM_BY_MASV
-- ============================================
GO
CREATE PROCEDURE SP_SEL_PUBLIC_ENCRYPT_BANGDIEM_BY_MASV
    @MASV           VARCHAR(20),
    @MANV_LOGIN     VARCHAR(20),
    @MATKHAU_NV     VARBINARY(MAX)  -- Hash đã xử lý từ client
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorCode  INT = 0;
    DECLARE @ErrorMsg   NVARCHAR(4000) = N'';
    DECLARE @StoredHash VARBINARY(MAX);
    DECLARE @PUBKEY_NV  VARCHAR(20);
    DECLARE @MALOP_SV   VARCHAR(20);
    DECLARE @MANV_LOP   VARCHAR(20);

    BEGIN TRY

        -- Kiểm tra sinh viên tồn tại
        IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
        BEGIN
            SET @ErrorCode = 4001;
            SET @ErrorMsg  = N'Mã sinh viên không tồn tại';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Xác thực nhân viên
        SELECT @StoredHash = MATKHAU, @PUBKEY_NV = PUBKEY
        FROM NHANVIEN
        WHERE MANV = @MANV_LOGIN;

        IF @StoredHash != @MATKHAU_NV
        BEGIN
            SET @ErrorCode = 2000;
            SET @ErrorMsg  = N'Mật khẩu không chính xác';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;

        -- Kiểm tra quyền
        SELECT @MALOP_SV = MALOP FROM SINHVIEN WHERE MASV = @MASV;

        IF @MALOP_SV IS NOT NULL
        BEGIN
            SELECT @MANV_LOP = MANV FROM LOP WHERE MALOP = @MALOP_SV;

            IF @MANV_LOP != @MANV_LOGIN
            BEGIN
                SET @ErrorCode = 4002;
                SET @ErrorMsg  = N'Bạn không có quyền xem điểm của sinh viên này';
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;

        -- Trả về dữ liệu, DIEMTHI vẫn ở dạng cipher để client tự giải mã
        SET @ErrorCode = 0;
        SET @ErrorMsg  = N'Thành công';

        SELECT
            @ErrorCode      AS ErrorCode,
            @ErrorMsg       AS ErrorMessage,
            BD.MASV,
            SV.HOTEN        AS TENSV,
            BD.MAHP,
            HP.TENHP,
            HP.SOTC,
            BD.DIEMTHI,     -- Cipher, client dùng private key để giải mã
            @PUBKEY_NV      AS PUBKEY
        FROM BANGDIEM BD
        INNER JOIN SINHVIEN SV ON BD.MASV = SV.MASV
        INNER JOIN HOCPHAN  HP ON BD.MAHP = HP.MAHP
        WHERE BD.MASV = @MASV
        ORDER BY BD.MAHP;

    END TRY
    BEGIN CATCH
        SET @ErrorCode = 5999;
        SET @ErrorMsg  = N'Lỗi hệ thống: Không thể lấy bảng điểm';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO



-- ============================================
-- XOA SINH VIEN (CO KIEM TRA QUYEN VA BANG DIEM)
-- ============================================
CREATE PROCEDURE SP_DEL_PUBLIC_SINHVIEN
    @MASV       VARCHAR(20),
    @MANV_LOGIN VARCHAR(20)  -- Nhan vien dang thuc hien
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    DECLARE @MALOP_SV VARCHAR(20);
    DECLARE @MANV_LOP VARCHAR(20);
    DECLARE @CountBangDiem INT;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiem tra sinh vien co ton tai khong
        IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
        BEGIN
            SET @ErrorCode = 4001;
            SET @ErrorMsg = N'Mã sinh viên không tồn tại';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Lay lop cua sinh vien
        SELECT @MALOP_SV = MALOP FROM SINHVIEN WHERE MASV = @MASV;
        
        -- Kiem tra quyen
        IF @MALOP_SV IS NOT NULL
        BEGIN
            SELECT @MANV_LOP = MANV FROM LOP WHERE MALOP = @MALOP_SV;
            
            IF @MANV_LOP != @MANV_LOGIN
            BEGIN
                SET @ErrorCode = 4002;
                SET @ErrorMsg = N'Bạn không có quyền xóa sinh viên của lớp này';
                ROLLBACK;
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;
        
        -- Kiem tra sinh vien co bang diem khong
        SELECT @CountBangDiem = COUNT(*) FROM BANGDIEM WHERE MASV = @MASV;
        
        IF @CountBangDiem > 0
        BEGIN
            -- Canh bao va hoi xac nhan (FE se xu ly)
            SET @ErrorCode = 4004;
            SET @ErrorMsg = N'Sinh viên đã có bảng điểm. Xóa sẽ mất toàn bộ dữ liệu điểm. Bạn có chắc chắn?';
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            -- Khong rollback vi co the FE se gui xac nhan
            RETURN;
        END;
        
        -- Xoa sinh vien
        DELETE FROM SINHVIEN WHERE MASV = @MASV;
        
        COMMIT TRANSACTION;
        
        -- Thanh cong
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Xóa sinh viên thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
        
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @ErrorCode = 4999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể xóa sinh viên';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO

--SELECT SINH VIEN
CREATE PROCEDURE SP_SEL_SINHVIEN
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg  NVARCHAR(4000) = N'';
    BEGIN TRY
        SET @ErrorCode = 0;
        SET @ErrorMsg  = N'Thành công';
        SELECT
            S.MASV,
            S.HOTEN,
            S.NGAYSINH,
            S.DIACHI,
            L.TENLOP
        FROM SINHVIEN S
        LEFT JOIN LOP L ON L.MALOP = S.MALOP;
    END TRY
    BEGIN CATCH
        SET @ErrorCode = 3999;
        SET @ErrorMsg  = N'Lỗi hệ thống: Không thể truy xuất dữ liệu sinh viên';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO





-- ============================================
-- XOA SINH VIEN (XAC NHAN - CO XOA CA BANG DIEM)
-- ============================================
CREATE PROCEDURE SP_DEL_PUBLIC_SINHVIEN_FORCE
    @MASV       VARCHAR(20),
    @MANV_LOGIN VARCHAR(20),
    @CONFIRM    BIT = 0  -- Can xac nhan = 1
WITH ENCRYPTION
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorCode INT = 0;
    DECLARE @ErrorMsg NVARCHAR(4000) = N'';
    DECLARE @MALOP_SV VARCHAR(20);
    DECLARE @MANV_LOP VARCHAR(20);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiem tra xac nhan
        IF @CONFIRM = 0
        BEGIN
            SET @ErrorCode = 4005;
            SET @ErrorMsg = N'Cần xác nhận xóa sinh viên (CONFIRM=1)';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Kiem tra sinh vien co ton tai khong
        IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MASV = @MASV)
        BEGIN
            SET @ErrorCode = 4001;
            SET @ErrorMsg = N'Mã sinh viên không tồn tại';
            ROLLBACK;
            SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
            RETURN;
        END;
        
        -- Lay lop cua sinh vien
        SELECT @MALOP_SV = MALOP FROM SINHVIEN WHERE MASV = @MASV;
        
        -- Kiem tra quyen
        IF @MALOP_SV IS NOT NULL
        BEGIN
            SELECT @MANV_LOP = MANV FROM LOP WHERE MALOP = @MALOP_SV;
            
            IF @MANV_LOP != @MANV_LOGIN
            BEGIN
                SET @ErrorCode = 4002;
                SET @ErrorMsg = N'Bạn không có quyền xóa sinh viên của lớp này';
                ROLLBACK;
                SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
                RETURN;
            END;
        END;
        
        -- Xoa bang diem truoc (do FK)
        DELETE FROM BANGDIEM WHERE MASV = @MASV;
        
        -- Xoa sinh vien
        DELETE FROM SINHVIEN WHERE MASV = @MASV;
        
        COMMIT TRANSACTION;
        
        -- Thanh cong
        SET @ErrorCode = 0;
        SET @ErrorMsg = N'Xóa sinh viên và toàn bộ bảng điểm thành công';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
        
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @ErrorCode = 4999;
        SET @ErrorMsg = N'Lỗi hệ thống: Không thể xóa sinh viên';
        SELECT @ErrorCode AS ErrorCode, @ErrorMsg AS ErrorMessage;
    END CATCH;
END;
GO


INSERT INTO NHANVIEN (MANV, HOTEN, EMAIL, LUONG, TENDN, MATKHAU, PUBKEY) VALUES ('NV999', N'Nguyễn Văn Test', 'nv999@gmail.com', 0x596576597a316a6c6f48764775686f793574617a2f664e644f61704567485a4f4c78386c7647623659613376694a4f42784a562f79774a4d5364574435302b31445639786b652b72584271557342707872706c7164556b3175306a4b4a687245792f5a46366956654569386e624c537849337a50794c4c56764c557477667472504151716e6a7732356f44555a6b4c65453867426c7564414e636557574775387135616250663469552f64524a2b50727a6631317369634e6930684653354e715367776e7650625759335a794a34346341566d6631754c65574263614955615a504572587870617750577270753979454e67466949632b70752b4c58682b586c734e4677515154724f5161566e6a5377304a516a506f69506c427155674c7536743437326c59314d356d5061536b4b63592b69787530487a64336f735857453455756c4b76766a726d793464594b6362456c787635513d3d, N'nv_test', 0xba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413, '-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuYm7zDCLvwG3EVqNW9WZ
WqLyNobV8uk/SZlvVhpcFdEettCfVdo/6XKXuH0aW4IYnYpYbmk4LG8SZDZxTFYB
pNXlDDThX45c1zeTQ4ei78LqEuwtkXeTHI4KwRXrI4bkTNxsjyurKnZrQGR7KRSu
MfvnG6vlbl38HZr8ZAav0PNk9ISWfNLKh9e61frp02gU5Dpp83jcz8A+ezBJS6Pe
N5upw/1pKlit364qWmC1tP+NGW9jyJYjtRYrie9yXChPKkZHpyoqQOfRutOHkcFv
ur+GC6bQhdmMjfIg87GA9j9i0YGUHR33TIoBO98BJkYyiLYdQrkGzZqaP2cgDZl2
4wIDAQAB
-----END PUBLIC KEY-----
');

EXEC SP_SEL_PUBLIC_ENCRYPT_NHANVIEN
    @TENDN = N'nv_test',
    @MATKHAU = 0xba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413;



EXEC SP_INS_PUBLIC_SINHVIEN @MASV='SV001', @HOTEN=N'Phạm Hoàng Nam', @NGAYSINH='2005-08-03', @DIACHI=N'Bình Thạnh, TP.HCM', @MALOP='L01', @TENDN=N'sv001', @MK=N'Sv@123456', @MANV_LOGIN='123456';

-- =========================
-- 3. THÊM HỌC PHẦN
-- =========================
INSERT INTO HOCPHAN (MAHP, TENHP, SOTC) VALUES
('HP01', N'Cơ sở dữ liệu', 3),
('HP02', N'An toàn bảo mật dữ liệu', 3),
('HP03', N'Lập trình Web', 4),
('HP04', N'Hệ thống thông tin quản lý', 3),
('HP05', N'Phân tích thiết kế hệ thống', 3),
('HP06', N'Lập trình Python', 3),
('HP07', N'Machine Learning', 4),
('HP08', N'Deep Learning', 4),
('HP09', N'Xử lý ảnh số', 3),
('HP10', N'Blockchain', 3);
GO