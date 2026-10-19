USE QuanLyPhongKhamDB;
GO

-- Ràng buộc 1: Giới tính bệnh nhân phải thuộc danh mục chuẩn
ALTER TABLE benh_nhan 
ADD CONSTRAINT CK_benh_nhan_gioi_tinh 
CHECK (gioi_tinh IN (N'Nam', N'Nữ', N'Khác'));

-- Ràng buộc 2: Tồn kho thuốc không bao giờ được phép âm
ALTER TABLE thuoc 
ADD CONSTRAINT CK_thuoc_so_luong_ton 
CHECK (so_luong_ton >= 0);

-- Ràng buộc 3: Đơn giá dịch vụ và thuốc phải lớn hơn 0
ALTER TABLE dich_vu 
ADD CONSTRAINT CK_dich_vu_don_gia 
CHECK (don_gia > 0);

ALTER TABLE thuoc 
ADD CONSTRAINT CK_thuoc_don_gia 
CHECK (don_gia > 0);

-- Ràng buộc 4: Logic thanh toán hóa đơn phải khớp tuyệt đối (Tổng = Dịch vụ + Thuốc - Giảm giá)
ALTER TABLE hoa_don 
ADD CONSTRAINT CK_hoa_don_tong_tien 
CHECK (tong_tien = (tien_dich_vu + tien_thuoc - tien_giam_gia) AND tong_tien >= 0);

-- Ràng buộc 5: Số thứ tự khám trong ngày của một bác sĩ là duy nhất (Tránh trùng STT cấp cho bệnh nhân)
ALTER TABLE lich_hen 
ADD CONSTRAINT UQ_lich_hen_bacsi_ngay_sothutu 
UNIQUE (ma_bac_si, thoi_gian_hen, so_thu_tu);