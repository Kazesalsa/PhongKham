import React, { useState } from 'react';
import { Table, Input, Button, Tag, Space, Card, Row, Col, Statistic, Tooltip } from 'antd';
import {
  SearchOutlined,
  DollarCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const PendingCheckoutTable = ({
  data = [],
  loading = false,
  onRefresh,
  onSelectRecord,
  onManualInput,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      item.tenBenhNhan?.toLowerCase().includes(term) ||
      item.soDienThoai?.includes(term) ||
      item.soCccd?.includes(term) ||
      item.maHoSo?.toLowerCase().includes(term) ||
      item.maLichHen?.toLowerCase().includes(term) ||
      item.tenBacSi?.toLowerCase().includes(term)
    );
  });

  const totalPendingAmount = filteredData.reduce(
    (acc, cur) => acc + (Number(cur.tongTamTinh) || 0),
    0
  );

  const columns = [
    {
      title: 'Mã Hồ Sơ',
      key: 'maHoSo',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color="cyan" style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>
            {record.maHoSo || record.maHoSoCode}
          </Tag>
          <span style={{ fontSize: 11, color: '#8c8c8c' }}>{record.maLichHen}</span>
        </Space>
      ),
    },
    {
      title: 'Thông Tin Bệnh Nhân',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f766e', fontSize: 14 }}>
            {record.tenBenhNhan}
          </div>
          <div style={{ fontSize: 12, color: '#595959' }}>
            <span>📞 {record.soDienThoai || 'Chưa có SĐT'}</span>
            {record.soCccd && record.soCccd !== 'Chưa có' && (
              <span style={{ marginLeft: 10 }}>💳 {record.soCccd}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Bác Sĩ Khám',
      key: 'doctor',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.tenBacSi}</div>
          <Tag color="blue" style={{ fontSize: 11 }}>
            {record.phongKham || 'Phòng khám'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Thời Gian Khám',
      dataIndex: 'ngayKham',
      key: 'ngayKham',
      width: 150,
      render: (val) => (
        <span style={{ fontSize: 12, color: '#595959' }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {val ? dayjs(val).format('HH:mm DD/MM/YYYY') : '---'}
        </span>
      ),
    },
    {
      title: 'Khoản Mục',
      key: 'items',
      width: 170,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={`Có ${record.soDichVu || 0} dịch vụ cận lâm sàng`}>
            <Tag icon={<ExperimentOutlined />} color="purple">
              {record.soDichVu || 0} DV
            </Tag>
          </Tooltip>
          <Tooltip title={`Có ${record.soThuoc || 0} loại thuốc trong đơn`}>
            <Tag icon={<MedicineBoxOutlined />} color="geekblue">
              {record.soThuoc || 0} Thuốc
            </Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Tạm Tính Viện Phí',
      key: 'tongTamTinh',
      width: 170,
      align: 'right',
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0d9488' }}>
            {Number(record.tongTamTinh || 0).toLocaleString('vi-VN')} đ
          </div>
          <span style={{ fontSize: 11, color: '#8c8c8c' }}>
            DV: {Number(record.tienDichVu || 0).toLocaleString('vi-VN')} đ | Thuốc: {Number(record.tienThuoc || 0).toLocaleString('vi-VN')} đ
          </span>
        </div>
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 170,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<DollarCircleOutlined />}
          style={{ backgroundColor: '#0d9488', borderColor: '#0d9488', fontWeight: 600 }}
          onClick={() => onSelectRecord(record.maHoSo || record.maHoSoCode)}
        >
          Lập Hóa Đơn
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #0d9488' }}>
            <Statistic
              title="Số ca chờ thu viện phí"
              value={filteredData.length}
              suffix="ca"
              prefix={<UserOutlined style={{ color: '#0d9488' }} />}
              valueStyle={{ color: '#0d9488', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
            <Statistic
              title="Tổng viện phí tạm tính"
              value={totalPendingAmount}
              precision={0}
              formatter={(val) => `${Number(val).toLocaleString('vi-VN')} đ`}
              prefix={<DollarCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#d97706', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Input
            placeholder="Tìm theo tên bệnh nhân, SĐT, CCCD hoặc mã hồ sơ..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 360, maxWidth: '100%' }}
            allowClear
            size="middle"
          />

          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={onManualInput}
            >
              Nhập mã HS trực tiếp
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            >
              Làm mới danh sách
            </Button>
          </Space>
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(rec) => rec.maHoSo || rec.maHoSoCode || Math.random()}
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} ca chờ thanh toán`,
          }}
          locale={{ emptyText: 'Hiện không có ca khám nào đang chờ thanh toán viện phí' }}
        />
      </Card>
    </div>
  );
};

export default PendingCheckoutTable;
