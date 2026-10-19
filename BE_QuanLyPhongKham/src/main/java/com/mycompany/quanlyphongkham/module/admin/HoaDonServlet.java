package com.mycompany.quanlyphongkham.module.admin;

import com.mycompany.quanlyphongkham.common.ApiResponse;
import com.mycompany.quanlyphongkham.common.BaseServlet;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@WebServlet(name = "HoaDonServlet", urlPatterns = {"/api/admin/hoa-don"})
public class HoaDonServlet extends BaseServlet {

    private final AdminDAO adminDAO = new AdminDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String role = getCurrentUserRole(req);
        String maHoaDon = req.getParameter("maHoaDon");

        try {
            if (maHoaDon != null && !maHoaDon.trim().isEmpty()) {
                Map<String, Object> chiTiet = adminDAO.getChiTietHoaDon(role, maHoaDon.trim());
                if (chiTiet != null) {
                    sendJsonResponse(resp, HttpServletResponse.SC_OK,
                            ApiResponse.ok(chiTiet, "Lấy chi tiết hóa đơn viện phí thành công!"));
                } else {
                    sendJsonResponse(resp, HttpServletResponse.SC_NOT_FOUND,
                            ApiResponse.error("Không tìm thấy thông tin hóa đơn " + maHoaDon, "NOT_FOUND"));
                }
            } else {
                String keyword = req.getParameter("keyword");
                List<Map<String, Object>> list = adminDAO.getDanhSachHoaDon(role, keyword);
                sendJsonResponse(resp, HttpServletResponse.SC_OK,
                        ApiResponse.ok(list, "Lấy danh sách lịch sử hóa đơn viện phí thành công!"));
            }
        } catch (SQLException e) {
            handleSqlException(resp, e, "Lỗi khi truy vấn dữ liệu hóa đơn viện phí!");
        }
    }
}
