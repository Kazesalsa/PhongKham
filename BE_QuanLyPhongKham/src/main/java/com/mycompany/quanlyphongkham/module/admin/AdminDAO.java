package com.mycompany.quanlyphongkham.module.admin;

import com.mycompany.quanlyphongkham.util.DBContext;
import com.mycompany.quanlyphongkham.util.PasswordUtil;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AdminDAO {

    /**
     * Báo cáo tổng hợp doanh thu theo từng ngày từ View v_doanh_thu_theo_ngay
     */
    public List<Map<String, Object>> getDoanhThuTheoNgay(String role) throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT ngay_thanh_toan, so_luong_hoa_don, tong_tien_dich_vu, " +
                     "tong_tien_thuoc, tong_tien_giam_gia, thuc_thu " +
                     "FROM v_doanh_thu_theo_ngay ORDER BY ngay_thanh_toan DESC";

        try (Connection conn = DBContext.getConnectionByRole(role);
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("ngayThanhToan", rs.getDate("ngay_thanh_toan"));
                map.put("soLuongHoaDon", rs.getInt("so_luong_hoa_don"));
                map.put("tongTienDichVu", rs.getBigDecimal("tong_tien_dich_vu"));
                map.put("tongTienThuoc", rs.getBigDecimal("tong_tien_thuoc"));
                map.put("tongTienGiamGia", rs.getBigDecimal("tong_tien_giam_gia"));
                map.put("thucThu", rs.getBigDecimal("thuc_thu"));
                list.add(map);
            }
        }
        return list;
    }

    /**
     * Báo cáo số ca khám và doanh số từng bác sĩ từ View v_doanh_thu_theo_bac_si
     */
    public List<Map<String, Object>> getNangSuatBacSi(String role) throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT ma_bac_si, ten_bac_si, chuyen_khoa, so_ca_kham, tong_doanh_thu " +
                     "FROM v_doanh_thu_theo_bac_si ORDER BY tong_doanh_thu DESC";

        try (Connection conn = DBContext.getConnectionByRole(role);
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                String maBacSi = rs.getString("ma_bac_si");
                map.put("maBacSi", maBacSi);
                map.put("maBacSiCode", maBacSi);
                map.put("tenBacSi", rs.getString("ten_bac_si"));
                map.put("chuyenKhoa", rs.getString("chuyen_khoa"));
                map.put("soCaKham", rs.getInt("so_ca_kham"));
                map.put("tongDoanhThu", rs.getBigDecimal("tong_doanh_thu"));
                list.add(map);
            }
        }
        return list;
    }

    /**
     * Báo cáo doanh thu theo khoảng ngày qua Stored Procedure sp_thong_ke_doanh_thu_khoang_ngay
     */
    public List<Map<String, Object>> getThongKeKhoangNgay(String role, Date tuNgay, Date denNgay) throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String call = "{call sp_thong_ke_doanh_thu_khoang_ngay(?, ?)}";

        try (Connection conn = DBContext.getConnectionByRole(role);
             CallableStatement cs = conn.prepareCall(call)) {
            cs.setDate(1, tuNgay);
            cs.setDate(2, denNgay);
            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("ngayGiaoDich", rs.getDate("ngay_giao_dich"));
                    map.put("hinhThucThanhToan", rs.getString("hinh_thuc_thanh_toan"));
                    map.put("soHoaDon", rs.getInt("so_hoa_don"));
                    map.put("doanhThuDichVu", rs.getBigDecimal("doanh_thu_dich_vu"));
                    map.put("doanhThuThuoc", rs.getBigDecimal("doanh_thu_thuoc"));
                    map.put("tongGiamGia", rs.getBigDecimal("tong_giam_gia"));
                    map.put("thucThu", rs.getBigDecimal("thuc_thu"));
                    list.add(map);
                }
            }
        }
        return list;
    }

    /**
     * Lấy danh sách lịch sử hóa đơn viện phí
     */
    public List<Map<String, Object>> getDanhSachHoaDon(String role, String keyword) throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT hd.ma_hoa_don, hd.ma_ho_so, hd.tien_dich_vu, hd.tien_thuoc, hd.tien_giam_gia, " +
            "hd.tong_tien, hd.hinh_thuc_thanh_toan, hd.trang_thai, hd.ngay_lap, " +
            "bn.ho_ten AS ten_benh_nhan, bn.so_dien_thoai, " +
            "bs_user.ho_ten AS ten_bac_si, bs.phong_kham, bs.chuyen_khoa " +
            "FROM hoa_don hd " +
            "JOIN ho_so_kham hs ON hd.ma_ho_so = hs.ma_ho_so " +
            "JOIN benh_nhan bn ON hs.ma_benh_nhan = bn.ma_benh_nhan " +
            "JOIN bac_si bs ON hs.ma_bac_si = bs.ma_bac_si " +
            "JOIN nguoi_dung bs_user ON bs.ma_bac_si = bs_user.ma_nguoi_dung "
        );

        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        if (hasKeyword) {
            sql.append("WHERE hd.ma_hoa_don LIKE ? OR bn.ho_ten LIKE ? OR bn.so_dien_thoai LIKE ? OR bs_user.ho_ten LIKE ? ");
        }
        sql.append("ORDER BY hd.ngay_lap DESC, hd.ma_hoa_don DESC");

        try (Connection conn = DBContext.getConnectionByRole(role);
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            if (hasKeyword) {
                String pattern = "%" + keyword.trim() + "%";
                ps.setString(1, pattern);
                ps.setString(2, pattern);
                ps.setString(3, pattern);
                ps.setString(4, pattern);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("maHoaDon", rs.getString("ma_hoa_don"));
                    map.put("maHoSo", rs.getString("ma_ho_so"));
                    map.put("tienDichVu", rs.getBigDecimal("tien_dich_vu"));
                    map.put("tienThuoc", rs.getBigDecimal("tien_thuoc"));
                    map.put("tienGiamGia", rs.getBigDecimal("tien_giam_gia"));
                    map.put("tongTien", rs.getBigDecimal("tong_tien"));
                    map.put("hinhThucThanhToan", rs.getString("hinh_thuc_thanh_toan"));
                    map.put("trangThai", rs.getString("trang_thai"));
                    map.put("ngayLap", rs.getTimestamp("ngay_lap"));
                    map.put("tenBenhNhan", rs.getString("ten_benh_nhan"));
                    map.put("soDienThoai", rs.getString("so_dien_thoai"));
                    map.put("tenBacSi", rs.getString("ten_bac_si"));
                    map.put("phongKham", rs.getString("phong_kham"));
                    map.put("chuyenKhoa", rs.getString("chuyen_khoa"));
                    list.add(map);
                }
            }
        }
        return list;
    }

    /**
     * Lấy chi tiết hóa đơn kèm danh sách dịch vụ và thuốc đã kê
     */
    public Map<String, Object> getChiTietHoaDon(String role, String maHoaDon) throws SQLException {
        String sqlInvoice = 
            "SELECT hd.ma_hoa_don, hd.ma_ho_so, hd.tien_dich_vu, hd.tien_thuoc, hd.tien_giam_gia, " +
            "hd.tong_tien, hd.hinh_thuc_thanh_toan, hd.trang_thai, hd.ngay_lap, " +
            "bn.ho_ten AS ten_benh_nhan, bn.gioi_tinh, bn.so_dien_thoai, bn.dia_chi, " +
            "bs_user.ho_ten AS ten_bac_si, bs.phong_kham, bs.chuyen_khoa, " +
            "hs.chan_doan, hs.trieu_chung, hs.loi_dan " +
            "FROM hoa_don hd " +
            "JOIN ho_so_kham hs ON hd.ma_ho_so = hs.ma_ho_so " +
            "JOIN benh_nhan bn ON hs.ma_benh_nhan = bn.ma_benh_nhan " +
            "JOIN bac_si bs ON hs.ma_bac_si = bs.ma_bac_si " +
            "JOIN nguoi_dung bs_user ON bs.ma_bac_si = bs_user.ma_nguoi_dung " +
            "WHERE hd.ma_hoa_don = ?";

        String sqlServices = 
            "SELECT cd.ma_chi_dinh, cd.so_luong, cd.don_gia, (cd.so_luong * cd.don_gia) AS thanh_tien, dv.ten_dich_vu " +
            "FROM chi_dinh_dich_vu cd " +
            "JOIN dich_vu dv ON cd.ma_dich_vu = dv.ma_dich_vu " +
            "WHERE cd.ma_ho_so = ?";

        String sqlDrugs = 
            "SELECT dt.ma_don_thuoc, dt.so_luong, dt.cach_dung, dt.huong_dan, " +
            "t.ten_thuoc, t.don_vi_tinh, t.don_gia, (dt.so_luong * t.don_gia) AS thanh_tien " +
            "FROM don_thuoc dt " +
            "JOIN thuoc t ON dt.ma_thuoc = t.ma_thuoc " +
            "WHERE dt.ma_ho_so = ?";

        Map<String, Object> invoice = null;

        try (Connection conn = DBContext.getConnectionByRole(role)) {
            String maHoSo = null;
            try (PreparedStatement ps = conn.prepareStatement(sqlInvoice)) {
                ps.setString(1, maHoaDon);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        invoice = new HashMap<>();
                        maHoSo = rs.getString("ma_ho_so");
                        invoice.put("maHoaDon", rs.getString("ma_hoa_don"));
                        invoice.put("maHoSo", maHoSo);
                        invoice.put("tienDichVu", rs.getBigDecimal("tien_dich_vu"));
                        invoice.put("tienThuoc", rs.getBigDecimal("tien_thuoc"));
                        invoice.put("tienGiamGia", rs.getBigDecimal("tien_giam_gia"));
                        invoice.put("tongTien", rs.getBigDecimal("tong_tien"));
                        invoice.put("hinhThucThanhToan", rs.getString("hinh_thuc_thanh_toan"));
                        invoice.put("trangThai", rs.getString("trang_thai"));
                        invoice.put("ngayLap", rs.getTimestamp("ngay_lap"));
                        invoice.put("tenBenhNhan", rs.getString("ten_benh_nhan"));
                        invoice.put("gioiTinh", rs.getString("gioi_tinh"));
                        invoice.put("soDienThoai", rs.getString("so_dien_thoai"));
                        invoice.put("diaChi", rs.getString("dia_chi"));
                        invoice.put("tenBacSi", rs.getString("ten_bac_si"));
                        invoice.put("phongKham", rs.getString("phong_kham"));
                        invoice.put("chuyenKhoa", rs.getString("chuyen_khoa"));
                        invoice.put("chanDoan", rs.getString("chan_doan"));
                        invoice.put("trieuChung", rs.getString("trieu_chung"));
                        invoice.put("loiDan", rs.getString("loi_dan"));
                    }
                }
            }

            if (invoice != null && maHoSo != null) {
                List<Map<String, Object>> danhSachDichVu = new ArrayList<>();
                try (PreparedStatement ps = conn.prepareStatement(sqlServices)) {
                    ps.setString(1, maHoSo);
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            Map<String, Object> dv = new HashMap<>();
                            dv.put("maChiDinh", rs.getString("ma_chi_dinh"));
                            dv.put("tenDichVu", rs.getString("ten_dich_vu"));
                            dv.put("soLuong", rs.getInt("so_luong"));
                            dv.put("donGia", rs.getBigDecimal("don_gia"));
                            dv.put("thanhTien", rs.getBigDecimal("thanh_tien"));
                            danhSachDichVu.add(dv);
                        }
                    }
                }
                invoice.put("danhSachDichVu", danhSachDichVu);

                List<Map<String, Object>> danhSachThuoc = new ArrayList<>();
                try (PreparedStatement ps = conn.prepareStatement(sqlDrugs)) {
                    ps.setString(1, maHoSo);
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            Map<String, Object> dt = new HashMap<>();
                            dt.put("maDonThuoc", rs.getString("ma_don_thuoc"));
                            dt.put("tenThuoc", rs.getString("ten_thuoc"));
                            dt.put("donViTinh", rs.getString("don_vi_tinh"));
                            dt.put("soLuong", rs.getInt("so_luong"));
                            dt.put("donGia", rs.getBigDecimal("don_gia"));
                            dt.put("thanhTien", rs.getBigDecimal("thanh_tien"));
                            String hd = rs.getString("huong_dan");
                            String cd = rs.getString("cach_dung");
                            dt.put("huongDan", hd != null && !hd.isEmpty() ? hd : cd);
                            danhSachThuoc.add(dt);
                        }
                    }
                }
                invoice.put("danhSachThuoc", danhSachThuoc);
            }
        }
        return invoice;
    }

    /**
     * Lấy danh sách người dùng hệ thống kèm thông tin bác sĩ nếu có
     */
    public List<Map<String, Object>> getDanhSachNguoiDung(String role, String roleFilter, String q) throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT nd.ma_nguoi_dung, nd.ten_dang_nhap, nd.ho_ten, nd.so_dien_thoai, " +
            "nd.vai_tro, nd.hoat_dong, nd.ngay_tao, " +
            "bs.chuyen_khoa, bs.phong_kham, bs.so_chung_chi " +
            "FROM nguoi_dung nd " +
            "LEFT JOIN bac_si bs ON nd.ma_nguoi_dung = bs.ma_bac_si " +
            "WHERE 1=1 "
        );

        boolean hasRole = roleFilter != null && !roleFilter.trim().isEmpty() && !roleFilter.equalsIgnoreCase("ALL");
        if (hasRole) {
            sql.append("AND nd.vai_tro = ? ");
        }

        boolean hasQ = q != null && !q.trim().isEmpty();
        if (hasQ) {
            sql.append("AND (nd.ho_ten LIKE ? OR nd.ten_dang_nhap LIKE ? OR nd.so_dien_thoai LIKE ?) ");
        }

        sql.append("ORDER BY nd.ngay_tao DESC, nd.ma_nguoi_dung DESC");

        try (Connection conn = DBContext.getConnectionByRole(role);
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            int paramIndex = 1;
            if (hasRole) {
                ps.setString(paramIndex++, roleFilter.trim());
            }
            if (hasQ) {
                String pattern = "%" + q.trim() + "%";
                ps.setString(paramIndex++, pattern);
                ps.setString(paramIndex++, pattern);
                ps.setString(paramIndex++, pattern);
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("maNguoiDung", rs.getString("ma_nguoi_dung"));
                    map.put("tenDangNhap", rs.getString("ten_dang_nhap"));
                    map.put("hoTen", rs.getString("ho_ten"));
                    map.put("soDienThoai", rs.getString("so_dien_thoai"));
                    map.put("vaiTro", rs.getString("vai_tro"));
                    map.put("hoatDong", rs.getBoolean("hoat_dong"));
                    map.put("ngayTao", rs.getTimestamp("ngay_tao"));
                    map.put("chuyenKhoa", rs.getString("chuyen_khoa"));
                    map.put("phongKham", rs.getString("phong_kham"));
                    map.put("soChungChi", rs.getString("so_chung_chi"));
                    list.add(map);
                }
            }
        }
        return list;
    }

    /**
     * Tạo tài khoản người dùng mới (kèm thông tin bác sĩ nếu là bác sĩ)
     */
    public String createUser(String role, Map<String, Object> userData) throws SQLException {
        String tenDangNhap = (String) userData.get("tenDangNhap");
        String matKhau = (String) userData.get("matKhau");
        String hoTen = (String) userData.get("hoTen");
        String soDienThoai = (String) userData.get("soDienThoai");
        String vaiTro = (String) userData.get("vaiTro");
        String chuyenKhoa = (String) userData.get("chuyenKhoa");
        String phongKham = (String) userData.get("phongKham");
        String soChungChi = (String) userData.get("soChungChi");

        if (tenDangNhap == null || tenDangNhap.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên đăng nhập không được để trống!");
        }
        if (matKhau == null || matKhau.trim().isEmpty()) {
            matKhau = "123456";
        }
        String matKhauHash = PasswordUtil.hashPassword(matKhau);

        try (Connection conn = DBContext.getConnectionByRole(role)) {
            conn.setAutoCommit(false);
            try {
                String maNguoiDung;
                boolean isBacSi = "BAC_SI".equalsIgnoreCase(vaiTro);
                if (isBacSi) {
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery("SELECT 'BS' + RIGHT('000' + CAST(NEXT VALUE FOR seq_bac_si AS VARCHAR(10)), 3)")) {
                        rs.next();
                        maNguoiDung = rs.getString(1);
                    }
                } else {
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery("SELECT 'ND' + RIGHT('000' + CAST(NEXT VALUE FOR seq_nguoi_dung AS VARCHAR(10)), 3)")) {
                        rs.next();
                        maNguoiDung = rs.getString(1);
                    }
                }

                String insertUserSql = "INSERT INTO nguoi_dung (ma_nguoi_dung, ten_dang_nhap, mat_khau_hash, ho_ten, so_dien_thoai, vai_tro, hoat_dong) " +
                                       "VALUES (?, ?, ?, ?, ?, ?, 1)";
                try (PreparedStatement ps = conn.prepareStatement(insertUserSql)) {
                    ps.setString(1, maNguoiDung);
                    ps.setString(2, tenDangNhap.trim());
                    ps.setString(3, matKhauHash);
                    ps.setString(4, hoTen != null ? hoTen.trim() : "");
                    ps.setString(5, soDienThoai != null && !soDienThoai.trim().isEmpty() ? soDienThoai.trim() : null);
                    ps.setString(6, vaiTro != null ? vaiTro.trim().toUpperCase() : "LE_TAN");
                    ps.executeUpdate();
                }

                if (isBacSi) {
                    String insertDoctorSql = "INSERT INTO bac_si (ma_bac_si, chuyen_khoa, so_chung_chi, phong_kham) VALUES (?, ?, ?, ?)";
                    try (PreparedStatement ps = conn.prepareStatement(insertDoctorSql)) {
                        ps.setString(1, maNguoiDung);
                        ps.setString(2, chuyenKhoa != null && !chuyenKhoa.trim().isEmpty() ? chuyenKhoa.trim() : "Nội tổng quát");
                        ps.setString(3, soChungChi != null && !soChungChi.trim().isEmpty() ? soChungChi.trim() : ("CCHN-" + maNguoiDung));
                        ps.setString(4, phongKham != null && !phongKham.trim().isEmpty() ? phongKham.trim() : "P.101");
                        ps.executeUpdate();
                    }
                }

                conn.commit();
                return maNguoiDung;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    /**
     * Cập nhật thông tin nhân sự / bác sĩ
     */
    public void updateUser(String role, Map<String, Object> userData) throws SQLException {
        String maNguoiDung = (String) userData.get("maNguoiDung");
        String hoTen = (String) userData.get("hoTen");
        String soDienThoai = (String) userData.get("soDienThoai");
        String vaiTro = (String) userData.get("vaiTro");
        String chuyenKhoa = (String) userData.get("chuyenKhoa");
        String phongKham = (String) userData.get("phongKham");
        String soChungChi = (String) userData.get("soChungChi");

        if (maNguoiDung == null || maNguoiDung.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã người dùng không hợp lệ!");
        }

        try (Connection conn = DBContext.getConnectionByRole(role)) {
            conn.setAutoCommit(false);
            try {
                String updateUserSql = "UPDATE nguoi_dung SET ho_ten = ?, so_dien_thoai = ? WHERE ma_nguoi_dung = ?";
                try (PreparedStatement ps = conn.prepareStatement(updateUserSql)) {
                    ps.setString(1, hoTen != null ? hoTen.trim() : "");
                    ps.setString(2, soDienThoai != null && !soDienThoai.trim().isEmpty() ? soDienThoai.trim() : null);
                    ps.setString(3, maNguoiDung);
                    ps.executeUpdate();
                }

                if ("BAC_SI".equalsIgnoreCase(vaiTro)) {
                    String checkDoctorSql = "SELECT COUNT(*) FROM bac_si WHERE ma_bac_si = ?";
                    boolean exists = false;
                    try (PreparedStatement ps = conn.prepareStatement(checkDoctorSql)) {
                        ps.setString(1, maNguoiDung);
                        try (ResultSet rs = ps.executeQuery()) {
                            if (rs.next() && rs.getInt(1) > 0) {
                                exists = true;
                            }
                        }
                    }

                    if (exists) {
                        String updateDoctorSql = "UPDATE bac_si SET chuyen_khoa = ?, phong_kham = ? " +
                                                 (soChungChi != null && !soChungChi.trim().isEmpty() ? ", so_chung_chi = ? " : "") +
                                                 "WHERE ma_bac_si = ?";
                        try (PreparedStatement ps = conn.prepareStatement(updateDoctorSql)) {
                            ps.setString(1, chuyenKhoa != null ? chuyenKhoa.trim() : "Nội tổng quát");
                            ps.setString(2, phongKham != null ? phongKham.trim() : "P.101");
                            if (soChungChi != null && !soChungChi.trim().isEmpty()) {
                                ps.setString(3, soChungChi.trim());
                                ps.setString(4, maNguoiDung);
                            } else {
                                ps.setString(3, maNguoiDung);
                            }
                            ps.executeUpdate();
                        }
                    } else {
                        String insertDoctorSql = "INSERT INTO bac_si (ma_bac_si, chuyen_khoa, so_chung_chi, phong_kham) VALUES (?, ?, ?, ?)";
                        try (PreparedStatement ps = conn.prepareStatement(insertDoctorSql)) {
                            ps.setString(1, maNguoiDung);
                            ps.setString(2, chuyenKhoa != null ? chuyenKhoa.trim() : "Nội tổng quát");
                            ps.setString(3, soChungChi != null && !soChungChi.trim().isEmpty() ? soChungChi.trim() : ("CCHN-" + maNguoiDung));
                            ps.setString(4, phongKham != null ? phongKham.trim() : "P.101");
                            ps.executeUpdate();
                        }
                    }
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    /**
     * Bật / tắt trạng thái hoạt động của tài khoản
     */
    public void toggleUserStatus(String role, String maNguoiDung, boolean hoatDong) throws SQLException {
        String sql = "UPDATE nguoi_dung SET hoat_dong = ? WHERE ma_nguoi_dung = ?";
        try (Connection conn = DBContext.getConnectionByRole(role);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, hoatDong);
            ps.setString(2, maNguoiDung);
            ps.executeUpdate();
        }
    }

    /**
     * Đặt lại mật khẩu người dùng
     */
    public void resetUserPassword(String role, String maNguoiDung, String matKhauMoi) throws SQLException {
        if (matKhauMoi == null || matKhauMoi.trim().isEmpty()) {
            matKhauMoi = "123456";
        }
        String hash = PasswordUtil.hashPassword(matKhauMoi.trim());
        String sql = "UPDATE nguoi_dung SET mat_khau_hash = ? WHERE ma_nguoi_dung = ?";
        try (Connection conn = DBContext.getConnectionByRole(role);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, hash);
            ps.setString(2, maNguoiDung);
            ps.executeUpdate();
        }
    }
}
