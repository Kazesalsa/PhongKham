import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Space,
  Row,
  Col,
  Select,
  DatePicker,
  Popconfirm,
  Statistic,
  Alert,
} from 'antd';
import {
  ReloadOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePharmacyStore } from '../../stores/usePharmacyStore';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { useDebounce } from '../../hooks/useDebounce';

const { Option } = Select;

const DrugInventoryPage = () => {
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [restockForm] = Form.useForm();

  const {
    drugPage,
    alertList,
    priceHistoryList,
    priceHistoryLoading,
    fetchInventory,
    fetchAlerts,
    restockDrug,
    createDrug,
    updateDrug,
    deleteDrug,
    fetchPriceHistory,
    isLoading,
    isSubmitting,
  } = usePharmacyStore();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [restockModalVisible, setRestockModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearch = useDebounce(searchKeyword, 350);
  const [statusFilter, setStatusFilter] = useState('all');

  // Load inventory and alerts on mount and when search/filter changes
  useEffect(() => {
    fetchInventory(1, drugPage.size || 10, debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter, fetchInventory]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Open Create Modal
  const handleOpenCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      donViTinh: 'Viên',
      soLuongTon: 100,
      donGia: 5000,
      hanSuDung: dayjs().add(2, 'year'),
    });
    setCreateModalVisible(true);
  };

  // Submit Create Drug
  const handleConfirmCreate = async (values) => {
    try {
      const payload = {
        tenThuoc: values.tenThuoc.trim(),
        donViTinh: values.donViTinh.trim(),
        soLuongTon: values.soLuongTon || 0,
        donGia: values.donGia,
        hanSuDung: values.hanSuDung.format('YYYY-MM-DD'),
      };
      await createDrug(payload);
      setCreateModalVisible(false);
    } catch {
      // Handled in store
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (record) => {
    setSelectedDrug(record);
    editForm.setFieldsValue({
      maThuoc: record.maThuoc,
      tenThuoc: record.tenThuoc,
      donViTinh: record.donViTinh,
      soLuongTon: record.soLuongTon,
      donGia: record.donGia,
      hanSuDung: record.hanSuDung ? dayjs(record.hanSuDung) : dayjs().add(1, 'year'),
      trangThai: record.trangThai !== false,
    });
    setEditModalVisible(true);
  };

  // Submit Edit Drug
  const handleConfirmEdit = async (values) => {
    try {
      const payload = {
        maThuoc: selectedDrug.maThuoc,
        tenThuoc: values.tenThuoc.trim(),
        donViTinh: values.donViTinh.trim(),
        donGia: values.donGia,
        hanSuDung: values.hanSuDung.format('YYYY-MM-DD'),
        trangThai: values.trangThai,
      };
      await updateDrug(payload);
      setEditModalVisible(false);
      setSelectedDrug(null);
    } catch {
      // Handled in store
    }
  };

  // Open Restock Modal
  const handleOpenRestock = (record) => {
    setSelectedDrug(record);
    restockForm.setFieldsValue({
      maThuoc: record.maThuoc,
      tenThuoc: record.tenThuoc,
      soLuongTonHienTai: record.soLuongTon,
      soLuongNhap: 50,
    });
    setRestockModalVisible(true);
  };

  // Submit Restock
  const handleConfirmRestock = async (values) => {
    try {
      await restockDrug(values.maThuoc, values.soLuongNhap);
      setRestockModalVisible(false);
      setSelectedDrug(null);
    } catch {
      // Handled in store
    }
  };

  // Open Price History Modal
  const handleOpenPriceHistory = (record) => {
    setSelectedDrug(record);
    fetchPriceHistory(record.maThuoc);
    setPriceModalVisible(true);
  };

  // Handle Delete or Deactivate
  const handleDelete = async (maThuoc) => {
    try {
      await deleteDrug(maThuoc);
    } catch {
      // Handled in store
    }
  };

  // Compute summary stats
  const totalDrugs = drugPage.totalElements || 0;
  const lowStockCount = alertList.filter((a) => a.soLuongTon < 20).length;
  const nearExpiryCount = alertList.filter((a) => a.soNgayConHan !== null && a.soNgayConHan < 30).length;

  const columns = [
    {
      title: 'Mã Thuốc',
      dataIndex: 'maThuoc',
      key: 'maThuoc',
      width: 95,
      render: (t) => <Tag color="blue" style={{ fontWeight: 600 }}>{t}</Tag>,
    },
    {
      title: 'Tên Thuốc & Biệt Dược',
      dataIndex: 'tenThuoc',
      key: 'tenThuoc',
      render: (text) => <strong style={{ color: '#0f172a', fontSize: 14 }}>{text}</strong>,
    },
    {
      title: 'ĐVT',
      dataIndex: 'donViTinh',
      key: 'donViTinh',
      width: 80,
      align: 'center',
      render: (unit) => <Tag>{unit}</Tag>,
    },
    {
      title: 'Số Lượng Tồn',
      dataIndex: 'soLuongTon',
      key: 'soLuongTon',
      width: 120,
      align: 'center',
      render: (qty) => (
        <Tag
          color={qty > 30 ? 'green' : qty > 0 ? 'orange' : 'red'}
          style={{ fontWeight: 700, padding: '2px 8px', fontSize: 13 }}
        >
          {qty}
        </Tag>
      ),
    },
    {
      title: 'Đơn Giá Bán',
      dataIndex: 'donGia',
      key: 'donGia',
      width: 130,
      align: 'right',
      render: (price) => <strong style={{ color: '#0d9488' }}>{formatCurrency(price)}</strong>,
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'hanSuDung',
      key: 'hanSuDung',
      width: 125,
      render: (val) => {
        const isNear = val && dayjs(val).diff(dayjs(), 'day') < 30;
        return (
          <span style={{ color: isNear ? '#dc2626' : 'inherit', fontWeight: isNear ? 600 : 'normal' }}>
            {formatDate(val)}
          </span>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 135,
      align: 'center',
      render: (status) => (
        <Tag color={status ? 'success' : 'default'} style={{ borderRadius: 12, padding: '2px 8px' }}>
          {status ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
        </Tag>
      ),
    },
    {
      title: 'Hành Động',
      key: 'act',
      width: 220,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            icon={<PlusCircleOutlined />}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            title="Nhập thêm tồn kho"
            onClick={() => handleOpenRestock(record)}
          >
            Nhập
          </Button>

          <Button
            size="small"
            icon={<EditOutlined />}
            style={{ borderColor: '#0d9488', color: '#0d9488' }}
            title="Chỉnh sửa thông tin"
            onClick={() => handleOpenEdit(record)}
          >
            Sửa
          </Button>

          <Button
            size="small"
            icon={<HistoryOutlined />}
            style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
            title="Xem nhật ký biến động giá"
            onClick={() => handleOpenPriceHistory(record)}
          />

          <Popconfirm
            title="Xác nhận xóa hoặc ngừng kinh doanh?"
            description={
              record.trangThai
                ? 'Thuốc đã từng kê đơn sẽ tự động chuyển sang Ngừng kinh doanh, nếu chưa kê đơn sẽ xóa hoàn toàn.'
                : 'Bạn có chắc muốn xóa loại thuốc này?'
            }
            onConfirm={() => handleDelete(record.maThuoc)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={record.trangThai ? <StopOutlined /> : <DeleteOutlined />}
              title={record.trangThai ? 'Ngừng kinh doanh' : 'Xóa vĩnh viễn'}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản Lý Danh Mục & Kho Dược Phẩm"
        subtitle="Quản lý vòng đời dược phẩm (CRUD), kiểm kê tồn kho và kiểm toán biến động giá tự động"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ backgroundColor: '#0d9488', borderColor: '#0d9488', fontWeight: 600 }}
              onClick={handleOpenCreate}
            >
              Thêm Thuốc Mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              onClick={() => {
                fetchInventory(drugPage.page, drugPage.size, debouncedSearch, statusFilter);
                fetchAlerts();
              }}
              loading={isLoading}
            >
              Làm Mới
            </Button>
          </Space>
        }
      />

      {/* 4 THẺ THỐNG KÊ NHANH (KPI CARDS) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, borderColor: '#e2e8f0' }}>
            <Statistic
              title="Tổng Danh Mục Thuốc"
              value={totalDrugs}
              prefix={<MedicineBoxOutlined style={{ color: '#0d9488' }} />}
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, borderColor: '#e2e8f0' }}>
            <Statistic
              title="Đang Kinh Doanh"
              value={drugPage.items.filter((i) => i.trangThai).length}
              suffix={`/ ${drugPage.items.length}`}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, borderColor: '#e2e8f0' }}>
            <Statistic
              title="Tồn Kho Thấp (< 20)"
              value={lowStockCount}
              prefix={<WarningOutlined style={{ color: lowStockCount > 0 ? '#f59e0b' : '#94a3b8' }} />}
              valueStyle={{ color: lowStockCount > 0 ? '#f59e0b' : '#94a3b8', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, borderColor: '#e2e8f0' }}>
            <Statistic
              title="Cận Hạn Sử Dụng (< 30 ngày)"
              value={nearExpiryCount}
              prefix={<WarningOutlined style={{ color: nearExpiryCount > 0 ? '#ef4444' : '#94a3b8' }} />}
              valueStyle={{ color: nearExpiryCount > 0 ? '#ef4444' : '#94a3b8', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12} lg={10}>
            <Input
              placeholder="Tìm theo tên thuốc hoặc mã thuốc (VD: Amoxicillin, T001)..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang kinh doanh</Option>
              <Option value="inactive">Ngừng kinh doanh</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* BẢNG DỮ LIỆU KHO THUỐC */}
      <Card>
        <Table
          dataSource={drugPage.items}
          columns={columns}
          rowKey="maThuoc"
          loading={isLoading}
          pagination={{
            current: drugPage.page,
            pageSize: drugPage.size,
            total: drugPage.totalElements,
            showSizeChanger: true,
            onChange: (p, s) => fetchInventory(p, s, debouncedSearch, statusFilter),
            showTotal: (total, range) => `${range[0]}-${range[1]} trong tổng số ${total} loại thuốc`,
          }}
          locale={{ emptyText: 'Kho hiện chưa có dữ liệu thuốc phù hợp với tìm kiếm.' }}
        />
      </Card>

      {/* MODAL 1: THÊM THUỐC MỚI (CREATE) */}
      <Modal
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#0d9488' }} />
            <span>Khai Báo Dược Phẩm Mới Vào Kho</span>
          </Space>
        }
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => createForm.submit()}
        confirmLoading={isSubmitting}
        okText="Khai Báo Thuốc"
        cancelText="Đóng"
        width={600}
      >
        <Alert
          type="info"
          showIcon
          message="Mã thuốc sẽ được hệ thống SQL Server tự động tạo theo Sequence (T001, T002...)"
          style={{ marginBottom: 16 }}
        />
        <Form form={createForm} layout="vertical" onFinish={handleConfirmCreate}>
          <Form.Item
            name="tenThuoc"
            label="Tên Thuốc & Hàm Lượng"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc và hàm lượng!' }]}
          >
            <Input placeholder="Ví dụ: Cefuroxim 500mg (Hasan)" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="donViTinh"
                label="Đơn Vị Tính"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính!' }]}
              >
                <Select size="large">
                  <Option value="Viên">Viên</Option>
                  <Option value="Vỉ">Vỉ</Option>
                  <Option value="Hộp">Hộp</Option>
                  <Option value="Gói">Gói</Option>
                  <Option value="Chai">Chai</Option>
                  <Option value="Lọ">Lọ</Option>
                  <Option value="Ống">Ống</Option>
                  <Option value="Tuýp">Tuýp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="soLuongTon"
                label="Số Lượng Nhập Ban Đầu"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
              >
                <InputNumber min={0} max={100000} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="donGia"
                label="Đơn Giá Bán (₫)"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá lớn hơn 0!' }]}
              >
                <InputNumber
                  min={100}
                  step={500}
                  style={{ width: '100%' }}
                  size="large"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hanSuDung"
                label="Hạn Sử Dụng"
                rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng!' }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  size="large"
                  disabledDate={(curr) => curr && curr <= dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL 2: CHỈNH SỬA THUỐC (UPDATE) */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#0d9488' }} />
            <span>Chỉnh Sửa Thông Tin Dược Phẩm - {selectedDrug?.maThuoc}</span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        confirmLoading={isSubmitting}
        okText="Lưu Thay Đổi"
        cancelText="Hủy"
        width={600}
      >
        <Alert
          type="warning"
          showIcon
          message="Kiểm toán giá tự động"
          description="Nếu bạn thay đổi Đơn giá bán, hệ thống SQL Server sẽ tự động kích hoạt Trigger trg_ghi_nhat_ky_gia_thuoc để ghi lại vết lịch sử biến động giá."
          style={{ marginBottom: 16 }}
        />
        <Form form={editForm} layout="vertical" onFinish={handleConfirmEdit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maThuoc" label="Mã Thuốc (Cố định)">
                <Input disabled size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="soLuongTon"
                label="Tồn Kho (Khóa - Dùng nút Nhập)"
                extra="Chống gian lận thất thoát kho"
              >
                <InputNumber disabled style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tenThuoc"
            label="Tên Thuốc & Biệt Dược"
            rules={[{ required: true, message: 'Tên thuốc không được để trống!' }]}
          >
            <Input size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="donViTinh" label="Đơn Vị Tính" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="Viên">Viên</Option>
                  <Option value="Vỉ">Vỉ</Option>
                  <Option value="Hộp">Hộp</Option>
                  <Option value="Gói">Gói</Option>
                  <Option value="Chai">Chai</Option>
                  <Option value="Lọ">Lọ</Option>
                  <Option value="Ống">Ống</Option>
                  <Option value="Tuýp">Tuýp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="donGia"
                label="Đơn Giá Bán (₫)"
                rules={[{ required: true, message: 'Đơn giá phải lớn hơn 0!' }]}
              >
                <InputNumber
                  min={100}
                  step={500}
                  style={{ width: '100%' }}
                  size="large"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hanSuDung" label="Hạn Sử Dụng" rules={[{ required: true }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trangThai" label="Trạng Thái Kinh Doanh" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value={true}>Đang kinh doanh</Option>
                  <Option value={false}>Ngừng kinh doanh</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL 3: NHẬP THÊM SỐ LƯỢNG KHO (RESTOCK) */}
      <Modal
        title={
          <Space>
            <PlusCircleOutlined style={{ color: '#10b981' }} />
            <span>Nhập Thêm Tồn Kho - {selectedDrug?.tenThuoc || ''}</span>
          </Space>
        }
        open={restockModalVisible}
        onCancel={() => setRestockModalVisible(false)}
        onOk={() => restockForm.submit()}
        confirmLoading={isSubmitting}
        okText="Xác Nhận Nhập Kho"
        cancelText="Hủy"
      >
        <Form form={restockForm} layout="vertical" onFinish={handleConfirmRestock}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maThuoc" label="Mã thuốc">
                <Input disabled size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="soLuongTonHienTai" label="Tồn kho hiện tại">
                <InputNumber disabled style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tenThuoc" label="Tên thuốc">
            <Input disabled size="large" />
          </Form.Item>

          <Form.Item
            name="soLuongNhap"
            label="Số lượng nhập thêm"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            initialValue={50}
          >
            <InputNumber min={1} max={50000} style={{ width: '100%' }} size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL 4: NHẬT KÝ BIẾN ĐỘNG GIÁ THUỐC (TRIGGER AUDIT LOG) */}
      <Modal
        title={
          <Space>
            <HistoryOutlined style={{ color: '#8b5cf6' }} />
            <span>Lịch Sử Biến Động Đơn Giá - {selectedDrug?.tenThuoc} ({selectedDrug?.maThuoc})</span>
          </Space>
        }
        open={priceModalVisible}
        onCancel={() => setPriceModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setPriceModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={680}
      >
        <Alert
          type="info"
          showIcon
          message="Cơ chế Kiểm toán Tự động (Database Trigger)"
          description="Dữ liệu này được SQL Server ghi lại tự động thông qua Trigger trg_ghi_nhat_ky_gia_thuoc mỗi khi phát hiện cột don_gia trong bảng thuoc có sự thay đổi."
          style={{ marginBottom: 16 }}
        />

        <Table
          dataSource={priceHistoryList}
          rowKey="maNhatKy"
          loading={priceHistoryLoading}
          size="small"
          pagination={false}
          columns={[
            {
              title: 'Thời Gian Thay Đổi',
              dataIndex: 'thoiGian',
              key: 'thoiGian',
              width: 170,
              render: (t) => formatDateTime(t),
            },
            {
              title: 'Đơn Giá Cũ',
              dataIndex: 'giaCu',
              key: 'giaCu',
              align: 'right',
              render: (p) => <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{formatCurrency(p)}</span>,
            },
            {
              title: 'Đơn Giá Mới',
              dataIndex: 'giaMoi',
              key: 'giaMoi',
              align: 'right',
              render: (p) => <strong style={{ color: '#16a34a' }}>{formatCurrency(p)}</strong>,
            },
            {
              title: 'Chênh Lệch',
              key: 'diff',
              align: 'right',
              render: (_, r) => {
                const diff = (r.giaMoi || 0) - (r.giaCu || 0);
                return (
                  <Tag color={diff >= 0 ? 'green' : 'red'}>
                    {diff >= 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                  </Tag>
                );
              },
            },
            {
              title: 'Tài Khoản',
              dataIndex: 'nguoiThucHien',
              key: 'nguoiThucHien',
              render: (u) => <Tag color="blue">{u}</Tag>,
            },
          ]}
          locale={{ emptyText: 'Chưa có ghi nhận thay đổi giá nào cho thuốc này (Giá hiện tại chưa từng bị sửa).' }}
        />
      </Modal>
    </div>
  );
};

export default DrugInventoryPage;
