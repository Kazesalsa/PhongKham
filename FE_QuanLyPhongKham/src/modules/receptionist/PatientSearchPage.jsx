import React, { useEffect, useState } from 'react';
import { Card, Table, Input, Flex, Button, Tag } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useReceptionistStore } from '../../stores/useReceptionistStore';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from '../../components/PageHeader';
import { formatDate, calculateAge } from '../../utils/formatDate';
import { ROUTE_PATHS } from '../../constants/routePaths';

const PatientSearchPage = () => {
  const navigate = useNavigate();
  const { patientPage, searchPatients, isLoading } = useReceptionistStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedKeyword = useDebounce(searchTerm, 400);

  useEffect(() => {
    searchPatients(debouncedKeyword, 1, patientPage.size || 10);
  }, [debouncedKeyword, searchPatients]);

  const handleTableChange = (pagination) => {
    searchPatients(debouncedKeyword, pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'maBenhNhan',
      key: 'maBenhNhan',
      width: 100,
      render: (code) => <strong>{code}</strong>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'hoTen',
      key: 'hoTen',
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'ngaySinh',
      key: 'ngaySinh',
      width: 120,
      render: (val) => formatDate(val),
    },
    {
      title: 'Giới Tính',
      dataIndex: 'gioiTinh',
      key: 'gioiTinh',
      width: 90,
      align: 'center',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'soDienThoai',
      key: 'soDienThoai',
      width: 130,
    },
    {
      title: 'Số CCCD',
      dataIndex: 'soCccd',
      key: 'soCccd',
      width: 150,
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'diaChi',
      key: 'diaChi',
    },
    {
      title: 'Ngày Đăng Ký',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 130,
      render: (val) => formatDate(val),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CalendarOutlined />}
          style={{ backgroundColor: '#0d9488' }}
          onClick={() =>
            navigate(ROUTE_PATHS.RECEPTIONIST.ADMISSION, {
              state: { patient: record },
            })
          }
        >
          Đặt khám
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tra Cứu Hồ Sơ Bệnh Nhân"
        subtitle="Tìm kiếm theo Tên, Số điện thoại hoặc CCCD có phân trang server (Stored Procedure sp_tim_kiem_benh_nhan)"
      />

      <Card>
        <Flex style={{ marginBottom: 16 }} gap="middle">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Nhập tên, số điện thoại hoặc số CCCD để tìm kiếm..."
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 450 }}
            allowClear
          />
        </Flex>

        <Table
          dataSource={patientPage.items}
          columns={columns}
          rowKey="maBenhNhan"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: patientPage.page,
            pageSize: patientPage.size,
            total: patientPage.totalElements,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} bệnh nhân`,
          }}
          locale={{ emptyText: 'Không tìm thấy bệnh nhân nào phù hợp.' }}
        />
      </Card>
    </div>
  );
};

export default PatientSearchPage;
