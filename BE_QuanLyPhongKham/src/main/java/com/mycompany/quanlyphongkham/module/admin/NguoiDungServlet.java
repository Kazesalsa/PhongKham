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

@WebServlet(name = "NguoiDungServlet", urlPatterns = {"/api/admin/nguoi-dung", "/api/admin/nguoi-dung/*"})
public class NguoiDungServlet extends BaseServlet {

    private final AdminDAO adminDAO = new AdminDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String role = getCurrentUserRole(req);
        String roleFilter = req.getParameter("role");
        String q = req.getParameter("q");

        try {
            List<Map<String, Object>> list = adminDAO.getDanhSachNguoiDung(role, roleFilter, q);
            sendJsonResponse(resp, HttpServletResponse.SC_OK,
                    ApiResponse.ok(list, "Lấy danh sách người dùng thành công!"));
        } catch (SQLException e) {
            handleSqlException(resp, e, "Lỗi khi lấy danh sách người dùng!");
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String role = getCurrentUserRole(req);
        String pathInfo = req.getPathInfo();
        Map<String, Object> body = readJsonBody(req, Map.class);

        if (body == null) {
            sendJsonResponse(resp, HttpServletResponse.SC_BAD_REQUEST,
                    ApiResponse.error("Dữ liệu gửi lên không hợp lệ!", "BAD_REQUEST"));
            return;
        }

        try {
            if (pathInfo != null && pathInfo.endsWith("/status")) {
                // Đổi trạng thái khóa / kích hoạt
                String maNguoiDung = (String) body.get("maNguoiDung");
                Object hoatDongObj = body.get("hoatDong");
                boolean hoatDong = true;
                if (hoatDongObj instanceof Boolean) {
                    hoatDong = (Boolean) hoatDongObj;
                } else if (hoatDongObj != null) {
                    hoatDong = Boolean.parseBoolean(hoatDongObj.toString());
                }

                adminDAO.toggleUserStatus(role, maNguoiDung, hoatDong);
                sendJsonResponse(resp, HttpServletResponse.SC_OK,
                        ApiResponse.ok(null, hoatDong ? "Đã kích hoạt lại tài khoản!" : "Đã khóa tài khoản nhân viên!"));
            } else if (pathInfo != null && pathInfo.endsWith("/reset-password")) {
                // Đặt lại mật khẩu
                String maNguoiDung = (String) body.get("maNguoiDung");
                String matKhauMoi = (String) body.get("matKhauMoi");

                adminDAO.resetUserPassword(role, maNguoiDung, matKhauMoi);
                sendJsonResponse(resp, HttpServletResponse.SC_OK,
                        ApiResponse.ok(null, "Đặt lại mật khẩu nhân viên thành công!"));
            } else {
                // Thêm người dùng mới
                String maNguoiDung = adminDAO.createUser(role, body);
                sendJsonResponse(resp, HttpServletResponse.SC_CREATED,
                        ApiResponse.ok(Map.of("maNguoiDung", maNguoiDung), "Thêm nhân viên mới thành công!"));
            }
        } catch (IllegalArgumentException e) {
            sendJsonResponse(resp, HttpServletResponse.SC_BAD_REQUEST,
                    ApiResponse.error(e.getMessage(), "VALIDATION_ERROR"));
        } catch (SQLException e) {
            handleSqlException(resp, e, "Lỗi khi xử lý thao tác người dùng!");
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String role = getCurrentUserRole(req);
        Map<String, Object> body = readJsonBody(req, Map.class);

        if (body == null) {
            sendJsonResponse(resp, HttpServletResponse.SC_BAD_REQUEST,
                    ApiResponse.error("Dữ liệu cập nhật không hợp lệ!", "BAD_REQUEST"));
            return;
        }

        try {
            adminDAO.updateUser(role, body);
            sendJsonResponse(resp, HttpServletResponse.SC_OK,
                    ApiResponse.ok(null, "Cập nhật thông tin nhân viên thành công!"));
        } catch (IllegalArgumentException e) {
            sendJsonResponse(resp, HttpServletResponse.SC_BAD_REQUEST,
                    ApiResponse.error(e.getMessage(), "VALIDATION_ERROR"));
        } catch (SQLException e) {
            handleSqlException(resp, e, "Lỗi khi cập nhật thông tin nhân viên!");
        }
    }
}
