import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Flex,
  Typography,
  Modal,
  Descriptions,
  Divider,
  Space,
  Empty,
  Spin,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  FileTextOutlined,
  EyeOutlined,
  DollarCircleOutlined,
  PrinterOutlined,
  MedicineBoxOutlined,
  AuditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAdminStore } from '../../stores/useAdminStore';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const { Text, Title } = Typography;

const InvoiceHistoryPage = () => {
  const {
    invoiceList,
    selectedInvoice,
    isLoading,
    isLoadingInvoiceDetail,
    fetchInvoices,
    fetchInvoiceDetail,
    clearSelectedInvoice,
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Overall Financial Statistics
  const stats = useMemo(() => {
    const totalCount = invoiceList.length;
    const totalRevenue = invoiceList.reduce((acc, curr) => acc + (Number(curr.tongTien) || 0), 0);
    const totalService = invoiceList.reduce((acc, curr) => acc + (Number(curr.tienDichVu) || 0), 0);
    const totalDrug = invoiceList.reduce((acc, curr) => acc + (Number(curr.tienThuoc) || 0), 0);
    return { totalCount, totalRevenue, totalService, totalDrug };
  }, [invoiceList]);

  // Filtered List
  const filteredInvoices = useMemo(() => {
    return invoiceList.filter((inv) => {
      // Payment method filter
      if (filterPaymentMethod !== 'ALL') {
        const method = (inv.hinhThucThanhToan || '').toLowerCase();
        if (filterPaymentMethod === 'CASH' && !method.includes('tiền mặt') && !method.includes('cash')) {
          return false;
        }
        if (filterPaymentMethod === 'TRANSFER' && !method.includes('chuyển khoản') && !method.includes('transfer')) {
          return false;
        }
        if (filterPaymentMethod === 'CARD' && !method.includes('thẻ') && !method.includes('card')) {
          return false;
        }
      }

      // Keyword search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchCode = inv.maHoaDon?.toLowerCase().includes(q);
        const matchPatient = inv.tenBenhNhan?.toLowerCase().includes(q);
        const matchPhone = inv.soDienThoai?.toLowerCase().includes(q);
        const matchDoctor = inv.tenBacSi?.toLowerCase().includes(q);
        return matchCode || matchPatient || matchPhone || matchDoctor;
      }

      return true;
    });
  }, [invoiceList, searchTerm, filterPaymentMethod]);

  const handleViewDetail = async (record) => {
    setIsDetailModalOpen(true);
    await fetchInvoiceDetail(record.maHoaDon);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    clearSelectedInvoice();
  };

  const getPaymentMethodTag = (method) => {
    if (!method) return <Tag>Chưa rõ</Tag>;
    const lower = method.toLowerCase();
    if (lower.includes('chuyển khoản') || lower.includes('transfer') || lower.includes('qr')) {
      return <Tag color="blue">Chuyển Khoản</Tag>;
    }
    if (lower.includes('thẻ') || lower.includes('card')) {
      return <Tag color="purple">Thẻ POS</Tag>;
    }
    return <Tag color="green">Tiền Mặt</Tag>;
  };

  const columns = [
    {
      title: 'Mã Hóa Đơn',
      dataIndex: 'maHoaDon',
      key: 'maHoaDon',
      width: 130,
      render: (code) => (
        <Tag color="cyan" icon={<FileTextOutlined />} style={{ fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Ngày Lập',
      dataIndex: 'ngayLap',
      key: 'ngayLap',
      width: 140,
      render: (d) => <span>{formatDate(d)}</span>,
    },
    {
      title: 'Bệnh Nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
      width: 180,
      render: (name, r) => (
        <div>
          <Text strong>{name}</Text>
          {r.soDienThoai && (
            <div style={{ fontSize: 12, color: '#64748b' }}>{r.soDienThoai}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Bác Sĩ Khám',
      dataIndex: 'tenBacSi',
      key: 'tenBacSi',
      width: 160,
      render: (name, r) => (
        <div>
          <span>{name}</span>
          {r.phongKham && (
            <div style={{ fontSize: 12, color: '#64748b' }}>{r.phongKham}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tiền Dịch Vụ',
      dataIndex: 'tienDichVu',
      key: 'tienDichVu',
      align: 'right',
      width: 130,
      render: (v) => <span>{formatCurrency(v || 0)}</span>,
    },
    {
      title: 'Tiền Thuốc',
      dataIndex: 'tienThuoc',
      key: 'tienThuoc',
      align: 'right',
      width: 130,
      render: (v) => <span>{formatCurrency(v || 0)}</span>,
    },
    {
      title: 'Giảm Trừ',
      dataIndex: 'tienGiamGia',
      key: 'tienGiamGia',
      align: 'right',
      width: 120,
      render: (v) => (
        <span style={{ color: Number(v) > 0 ? '#ef4444' : '#64748b' }}>
          {Number(v) > 0 ? `-${formatCurrency(v)}` : '0 ₫'}
        </span>
      ),
    },
    {
      title: 'Tổng Thực Thu',
      dataIndex: 'tongTien',
      key: 'tongTien',
      align: 'right',
      width: 150,
      render: (v) => (
        <strong style={{ color: '#0d9488', fontSize: 14 }}>
          {formatCurrency(v || 0)}
        </strong>
      ),
    },
    {
      title: 'Hình Thức',
      dataIndex: 'hinhThucThanhToan',
      key: 'hinhThucThanhToan',
      align: 'center',
      width: 130,
      render: (m) => getPaymentMethodTag(m),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      align: 'center',
      width: 130,
      render: (st) => (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          {st || 'Đã thanh toán'}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      align: 'center',
      width: 120,
      fixed: 'right',
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          style={{ backgroundColor: '#0d9488' }}
          onClick={() => handleViewDetail(r)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ];

  // Service Detail Columns
  const serviceColumns = [
    {
      title: '#',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Tên Dịch Vụ / Chỉ Định',
      dataIndex: 'tenDichVu',
      key: 'tenDichVu',
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: 'SL',
      dataIndex: 'soLuong',
      key: 'soLuong',
      align: 'center',
      width: 70,
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'donGia',
      key: 'donGia',
      align: 'right',
      width: 130,
      render: (v) => formatCurrency(v || 0),
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      align: 'right',
      width: 140,
      render: (v) => <strong style={{ color: '#0d9488' }}>{formatCurrency(v || 0)}</strong>,
    },
  ];

  // Drug Detail Columns
  const drugColumns = [
    {
      title: '#',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Tên Thuốc & Quy Cách',
      dataIndex: 'tenThuoc',
      key: 'tenThuoc',
      render: (t, r) => (
        <div>
          <Text strong>{t}</Text>
          {r.huongDan && (
            <div style={{ fontSize: 12, color: '#64748b' }}>HD: {r.huongDan}</div>
          )}
        </div>
      ),
    },
    {
      title: 'ĐVT',
      dataIndex: 'donViTinh',
      key: 'donViTinh',
      align: 'center',
      width: 80,
    },
    {
      title: 'SL',
      dataIndex: 'soLuong',
      key: 'soLuong',
      align: 'center',
      width: 70,
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'donGia',
      key: 'donGia',
      align: 'right',
      width: 120,
      render: (v) => formatCurrency(v || 0),
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      align: 'right',
      width: 130,
      render: (v) => <strong style={{ color: '#0d9488' }}>{formatCurrency(v || 0)}</strong>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Lịch Sử & Tra Cứu Hóa Đơn Viện Phí"
        subtitle="Quản lý toàn bộ giao dịch thanh toán viện phí, xem lại chi tiết chỉ định khám và đơn thuốc"
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => fetchInvoices()}
            loading={isLoading}
            style={{ backgroundColor: '#0d9488' }}
          >
            Làm Mới
          </Button>
        }
      />

      {/* 4 Financial Highlight Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#ccfbf1', background: '#f0fdfa' }}>
            <Statistic
              title={<Text strong style={{ color: '#0f766e' }}>Tổng Doanh Thu Hóa Đơn</Text>}
              value={stats.totalRevenue}
              styles={{ content: { color: '#0d9488', fontWeight: 700, fontSize: 24 } }}
              prefix={<DollarCircleOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#e0f2fe', background: '#f0f9ff' }}>
            <Statistic
              title={<Text strong style={{ color: '#0369a1' }}>Tổng Hóa Đơn Đã Thu</Text>}
              value={stats.totalCount}
              styles={{ content: { color: '#0284c7', fontWeight: 700, fontSize: 24 } }}
              prefix={<FileTextOutlined />}
              suffix="hóa đơn"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#fef3c7', background: '#fffbeb' }}>
            <Statistic
              title={<Text strong style={{ color: '#b45309' }}>Tổng Tiền Dịch Vụ Khám</Text>}
              value={stats.totalService}
              styles={{ content: { color: '#d97706', fontWeight: 700, fontSize: 24 } }}
              prefix={<AuditOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#f3e8ff', background: '#faf5ff' }}>
            <Statistic
              title={<Text strong style={{ color: '#7e22ce' }}>Tổng Tiền Đơn Thuốc</Text>}
              value={stats.totalDrug}
              styles={{ content: { color: '#9333ea', fontWeight: 700, fontSize: 24 } }}
              prefix={<MedicineBoxOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table with Filters */}
      <Card
        title={
          <Flex justify="space-between" align="center" wrap="wrap" gap="small">
            <span style={{ fontWeight: 600, fontSize: 16 }}>
              <FileTextOutlined style={{ marginRight: 8, color: '#0d9488' }} />
              Danh Sách Hóa Đơn Viện Phí
            </span>
            <Space wrap>
              <Select
                value={filterPaymentMethod}
                onChange={setFilterPaymentMethod}
                style={{ width: 180 }}
                options={[
                  { value: 'ALL', label: 'Tất cả phương thức' },
                  { value: 'CASH', label: 'Tiền mặt' },
                  { value: 'TRANSFER', label: 'Chuyển khoản' },
                  { value: 'CARD', label: 'Thẻ POS' },
                ]}
              />
              <Input
                placeholder="Tìm mã HĐ, bệnh nhân, SĐT, bác sĩ..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
            </Space>
          </Flex>
        }
      >
        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="maHoaDon"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: 'Không tìm thấy hóa đơn viện phí nào.' }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Invoice Detail Modal (Medical Receipt Format) */}
      <Modal
        title={
          <Flex align="center" gap="small">
            <FileTextOutlined style={{ color: '#0d9488', fontSize: 20 }} />
            <span style={{ fontSize: 18 }}>Chi Tiết Hóa Đơn Viện Phí #{selectedInvoice?.maHoaDon || ''}</span>
          </Flex>
        }
        open={isDetailModalOpen}
        onCancel={handleCloseDetail}
        width={850}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In Phiếu Thu
          </Button>,
          <Button key="close" type="primary" onClick={handleCloseDetail} style={{ backgroundColor: '#0d9488' }}>
            Đóng
          </Button>,
        ]}
      >
        {isLoadingInvoiceDetail ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="Đang tải chi tiết hóa đơn..." />
          </div>
        ) : selectedInvoice ? (
          <div>
            {/* Clinic Brand & Invoice Header */}
            <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 15 }}>
              <Title level={4} style={{ margin: 0, color: '#0d9488' }}>
                PHÒNG KHÁM ĐA KHOA MEDICARE CLINIC
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Địa chỉ: 123 Đường Sức Khỏe, Quận 1, TP. Hồ Chí Minh | Hotline: 1900 8888
              </Text>
            </div>

            {/* Invoice & Patient Meta */}
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Mã Hóa Đơn">
                <Tag color="cyan"><strong>{selectedInvoice.maHoaDon}</strong></Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời Gian Lập">
                {selectedInvoice.ngayLap ? formatDate(selectedInvoice.ngayLap) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Bệnh Nhân">
                <strong>{selectedInvoice.tenBenhNhan}</strong> ({selectedInvoice.gioiTinh || '—'})
              </Descriptions.Item>
              <Descriptions.Item label="Số Điện Thoại">
                {selectedInvoice.soDienThoai || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa Chỉ">
                {selectedInvoice.diaChi || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Bác Sĩ Khám">
                <strong>{selectedInvoice.tenBacSi}</strong> ({selectedInvoice.phongKham || selectedInvoice.chuyenKhoa || 'P.Khám'})
              </Descriptions.Item>
              <Descriptions.Item label="Chẩn Đoán Bệnh" span={2}>
                <span style={{ color: '#0369a1', fontWeight: 600 }}>
                  {selectedInvoice.chanDoan || 'Khám bệnh định kỳ / Theo dõi sức khỏe'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Hình Thức Thanh Toán">
                {getPaymentMethodTag(selectedInvoice.hinhThucThanhToan)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái HĐ">
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  {selectedInvoice.trangThai || 'Đã thanh toán'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Prescribed Services Table */}
            <div style={{ marginBottom: 20 }}>
              <Flex align="center" gap="small" style={{ marginBottom: 8 }}>
                <AuditOutlined style={{ color: '#0d9488' }} />
                <Text strong style={{ fontSize: 15 }}>Dịch Vụ Kỹ Thuật & Khám Bệnh</Text>
              </Flex>
              {selectedInvoice.danhSachDichVu && selectedInvoice.danhSachDichVu.length > 0 ? (
                <Table
                  dataSource={selectedInvoice.danhSachDichVu}
                  columns={serviceColumns}
                  rowKey={(r, idx) => r.maChiDinh || idx}
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dịch vụ phát sinh ngoài tiền khám." />
              )}
            </div>

            {/* Prescribed Medications Table */}
            <div style={{ marginBottom: 20 }}>
              <Flex align="center" gap="small" style={{ marginBottom: 8 }}>
                <MedicineBoxOutlined style={{ color: '#9333ea' }} />
                <Text strong style={{ fontSize: 15 }}>Đơn Thuốc Điều Trị</Text>
              </Flex>
              {selectedInvoice.danhSachThuoc && selectedInvoice.danhSachThuoc.length > 0 ? (
                <Table
                  dataSource={selectedInvoice.danhSachThuoc}
                  columns={drugColumns}
                  rowKey={(r, idx) => r.maDonThuoc || idx}
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bác sĩ không kê đơn thuốc cho ca khám này." />
              )}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Financial Summary */}
            <Row justify="end">
              <Col xs={24} sm={12} md={10}>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <Flex justify="space-between" style={{ marginBottom: 8 }}>
                    <Text type="secondary">Tiền dịch vụ:</Text>
                    <Text strong>{formatCurrency(selectedInvoice.tienDichVu || 0)}</Text>
                  </Flex>
                  <Flex justify="space-between" style={{ marginBottom: 8 }}>
                    <Text type="secondary">Tiền thuốc:</Text>
                    <Text strong>{formatCurrency(selectedInvoice.tienThuoc || 0)}</Text>
                  </Flex>
                  <Flex justify="space-between" style={{ marginBottom: 8 }}>
                    <Text type="secondary">Giảm trừ / BHYT:</Text>
                    <Text style={{ color: '#ef4444' }}>
                      {Number(selectedInvoice.tienGiamGia) > 0 ? `-${formatCurrency(selectedInvoice.tienGiamGia)}` : '0 ₫'}
                    </Text>
                  </Flex>
                  <Divider style={{ margin: '8px 0' }} />
                  <Flex justify="space-between" align="center">
                    <Text strong style={{ fontSize: 15 }}>TỔNG CỘNG THỰC THU:</Text>
                    <strong style={{ fontSize: 20, color: '#0d9488' }}>
                      {formatCurrency(selectedInvoice.tongTien || 0)}
                    </strong>
                  </Flex>
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <Empty description="Không tìm thấy thông tin chi tiết hóa đơn." />
        )}
      </Modal>
    </div>
  );
};

export default InvoiceHistoryPage;
