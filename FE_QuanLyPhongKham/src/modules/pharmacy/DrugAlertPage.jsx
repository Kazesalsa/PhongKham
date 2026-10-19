import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Alert,
  Row,
  Col,
  Statistic,
  Tag,
  Modal,
  Form,
  InputNumber,
  Input,
  Space,
  Radio,
} from 'antd';
import {
  ReloadOutlined,
  AlertOutlined,
  PlusCircleOutlined,
  ArrowLeftOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePharmacyStore } from '../../stores/usePharmacyStore';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';
import { formatDate } from '../../utils/formatDate';
import { ROUTE_PATHS } from '../../constants/routePaths';

const DrugAlertPage = () => {
  const navigate = useNavigate();
  const [restockForm] = Form.useForm();
  const [restockModalVisible, setRestockModalVisible] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const {
    alertList,
    fetchAlerts,
    restockDrug,
    isLoading,
    isSubmitting,
  } = usePharmacyStore();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

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
      fetchAlerts();
    } catch {
      // Handled in store
    }
  };

  // Filtered Alert List
  const filteredList = alertList.filter((item) => {
    if (filterType === 'low_stock') {
      return item.soLuongTon < 20;
    }
    if (filterType === 'near_expiry') {
      return item.soNgayConHan !== null && item.soNgayConHan >= 0 && item.soNgayConHan < 30;
    }
    if (filterType === 'expired') {
      return item.soNgayConHan !== null && item.soNgayConHan < 0;
    }
    return true;
  });

  // Calculate statistics
  const totalAlerts = alertList.length;
  const lowStockCount = alertList.filter((a) => a.soLuongTon < 20).length;
  const nearExpiryCount = alertList.filter(
    (a) => a.soNgayConHan !== null && a.soNgayConHan >= 0 && a.soNgayConHan < 30
  ).length;
  const expiredCount = alertList.filter(
    (a) => a.soNgayConHan !== null && a.soNgayConHan < 0
  ).length;

  const columns = [
    {
      title: 'Mã Thuốc',
      dataIndex: 'maThuoc',
      key: 'maThuoc',
      width: 100,
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
      width: 130,
      align: 'center',
      render: (qty) => (
        <span
          style={{
            color: qty === 0 ? '#dc2626' : qty < 20 ? '#ea580c' : '#0f172a',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {qty} {qty === 0 && <Tag color="red" style={{ marginLeft: 4 }}>Hết hàng</Tag>}
        </span>
      ),
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'hanSuDung',
      key: 'hanSuDung',
      width: 130,
      render: (val) => formatDate(val),
    },
    {
      title: 'Số Ngày Còn Hạn',
      dataIndex: 'soNgayConHan',
      key: 'soNgayConHan',
      width: 140,
      align: 'center',
      render: (days) => {
        if (days === null || days === undefined) return <span>N/A</span>;
        if (days < 0) {
          return <Tag color="error" icon={<CloseCircleOutlined />}>Quá hạn {Math.abs(days)} ngày</Tag>;
        }
        return (
          <span style={{ fontWeight: 700, color: days < 30 ? '#dc2626' : '#d97706' }}>
            {days} ngày
          </span>
        );
      },
    },
    {
      title: 'Cảnh Báo Rủi Ro',
      dataIndex: 'trangThaiCanhBao',
      key: 'trangThaiCanhBao',
      width: 170,
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusCircleOutlined />}
          style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
          onClick={() => handleOpenRestock(record)}
        >
          Nhập Kho
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cảnh Báo Tồn Kho & Cận Hạn Dược Phẩm"
        subtitle="Giám sát thời gian thực thuốc dưới ngưỡng an toàn (< 20) hoặc cận hạn sử dụng (< 30 ngày) (View v_canh_bao_ton_kho_thuoc)"
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(ROUTE_PATHS.PHARMACY.INVENTORY)}
            >
              Về Quản Lý Kho Thuốc
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchAlerts()}
              loading={isLoading}
              type="primary"
            >
              Làm Mới
            </Button>
          </Space>
        }
      />

      {/* Top 4 KPI Alert Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              borderLeft: '4px solid #ef4444',
              backgroundColor: '#fff',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Tổng Cảnh Báo</span>}
              value={totalAlerts}
              prefix={<AlertOutlined style={{ color: '#ef4444', marginRight: 6 }} />}
              valueStyle={{ color: '#ef4444', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              borderLeft: '4px solid #f97316',
              backgroundColor: '#fff',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Sắp Hết Hàng (&lt; 20)</span>}
              value={lowStockCount}
              prefix={<WarningOutlined style={{ color: '#f97316', marginRight: 6 }} />}
              valueStyle={{ color: '#f97316', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              borderLeft: '4px solid #eab308',
              backgroundColor: '#fff',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Cận Hạn (&lt; 30 ngày)</span>}
              value={nearExpiryCount}
              prefix={<ClockCircleOutlined style={{ color: '#eab308', marginRight: 6 }} />}
              valueStyle={{ color: '#eab308', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              borderLeft: '4px solid #6b7280',
              backgroundColor: '#fff',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Đã Quá Hạn</span>}
              value={expiredCount}
              prefix={<CloseCircleOutlined style={{ color: '#6b7280', marginRight: 6 }} />}
              valueStyle={{ color: '#6b7280', fontWeight: 800 }}
            />
          </Card>
        </Col>
      </Row>

      <Alert
        title="Cơ chế bảo vệ bệnh nhân tự động của Hệ Quản Trị CSDL SQL Server"
        description="Thuốc hết hạn hoặc hết số lượng tồn sẽ tự động bị hệ thống từ chối cho Bác sĩ kê đơn qua Trigger trg_kiem_tra_han_thuoc và trg_ke_don_tru_kho. Dược sĩ vui lòng kịp thời nhập thêm hàng hoặc hủy thuốc hỏng để bảo đảm chuỗi cung ứng điều trị."
        type="warning"
        showIcon
        style={{ marginBottom: 20, borderRadius: 8 }}
      />

      <Card
        style={{ borderRadius: 12 }}
        title={
          <Space>
            <span>Phân loại lọc cảnh báo:</span>
            <Radio.Group
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">Tất cả ({totalAlerts})</Radio.Button>
              <Radio.Button value="low_stock">Sắp hết hàng ({lowStockCount})</Radio.Button>
              <Radio.Button value="near_expiry">Cận hạn ({nearExpiryCount})</Radio.Button>
              <Radio.Button value="expired">Đã quá hạn ({expiredCount})</Radio.Button>
            </Radio.Group>
          </Space>
        }
      >
        <Table
          dataSource={filteredList}
          columns={columns}
          rowKey="maThuoc"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng cộng ${t} loại thuốc cảnh báo` }}
          locale={{ emptyText: 'Hiện không có loại thuốc nào trong diện cảnh báo.' }}
        />
      </Card>

      {/* Restock Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusCircleOutlined style={{ color: '#10b981', fontSize: 20 }} />
            <span>Nhập Bổ Sung Tồn Kho Cho Thuốc</span>
          </div>
        }
        open={restockModalVisible}
        onCancel={() => {
          setRestockModalVisible(false);
          setSelectedDrug(null);
        }}
        footer={null}
        destroyOnClose
        centered
        width={480}
      >
        <Form form={restockForm} layout="vertical" onFinish={handleConfirmRestock}>
          <Form.Item label="Mã Thuốc" name="maThuoc">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Tên Dược Phẩm" name="tenThuoc">
            <Input disabled />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tồn Kho Hiện Tại" name="soLuongTonHienTai">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số Lượng Nhập Thêm"
                name="soLuongNhap"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng!' },
                  {
                    type: 'number',
                    min: 1,
                    max: 100000,
                    message: 'Số lượng phải lớn hơn 0!',
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="VD: 50"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setRestockModalVisible(false)}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            >
              Xác Nhận Nhập Kho
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DrugAlertPage;

