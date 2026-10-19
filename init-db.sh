#!/bin/bash
set -e

echo "=== ĐANG CHỜ SQL SERVER SẴN SÀNG ==="
until docker exec clinic-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Murach@123456' -C -Q "SELECT 1" &> /dev/null
do
  echo "Đang đợi SQL Server khởi động... (thử lại sau 2 giây)"
  sleep 2
done
echo ">>> SQL Server đã sẵn sàng! <<<"

echo "=== THỰC THI TOÀN BỘ CSDL PHÒNG KHÁM ==="
SQL_FILES=(
  "BE_QuanLyPhongKham/sql/quanliphongkham.sql"
  "BE_QuanLyPhongKham/sql/5 Ràng buộc.sql"
  "BE_QuanLyPhongKham/sql/5 Views.sql"
  "BE_QuanLyPhongKham/sql/5 User-Defined Functions.sql"
  "BE_QuanLyPhongKham/sql/5 Stored Procedures.sql"
  "BE_QuanLyPhongKham/sql/5 Triggers.sql"
  "BE_QuanLyPhongKham/sql/5 nghiệp vụ minh họa sử dụng TRANSACTION.sql"
  "BE_QuanLyPhongKham/sql/5 Index.sql"
  "BE_QuanLyPhongKham/sql/Thiết lập tài khoản xác thực trong SQL Server.sql"
  "BE_QuanLyPhongKham/sql/Bảo mật và phân quyền.sql"
  "BE_QuanLyPhongKham/sql/Thiết lập quyền chi tiết bằng lệnh GRANT_REVOKE_DENY.sql"
  "BE_QuanLyPhongKham/sql/seed_data.sql"
)

for file in "${SQL_FILES[@]}"; do
  echo "--> Đang chạy script: $file"
  docker exec -i clinic-db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Murach@123456' -C -b < "$file"
done

echo ">>> TOÀN BỘ CƠ SỞ DỮ LIỆU ĐÃ ĐƯỢC KHỞI TẠO VÀ SEED THÀNH CÔNG! <<<"
