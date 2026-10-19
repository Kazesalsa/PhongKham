import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Spin,
  Descriptions,
  Table,
  Divider,
  Form,
  Select,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Tag,
  Typography,
  Space,
} from 'antd';
import {
  DollarCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CheckoutDetailDrawer = ({
  open,
  onClose,
  detail,
  loading = false,
  isSubmitting = false,
  onConfirmCheckout,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && detail) {
      form.setFieldsValue({
        hinhThucThanhToan: detail.hinhThucThanhToan || 'Tiền mặt',
      });
    }
  }, [open, detail, form]);

  if (!detail && !loading) return null;

  const services = detail?.danhSachDichVu || [];
  const drugs = detail?.danhSachThuoc || [];
  const serviceTotal = Number(detail?.tienDichVu) || 0;
  const drugTotal = Number(detail?.tienThuoc) || 0;
  const subtotal = serviceTotal + drugTotal;

  const isAlreadyPaid = detail?.trangThaiHoaDon === 'Đã thanh toán';

  const handleFinish = async (values) => {
    if (!detail) return;
    await onConfirmCheckout({
      maHoSo: detail.maHoSo || detail.maHoSoCode,
      tienGiamGia: 0,
      hinhThucThanhToan: values.hinhThucThanhToan,
    });
  };

  const serviceColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Tên Dịch Vụ',
      dataIndex: 'tenDichVu',
      key: 'tenDichVu',
      render: (val) => <Text strong>{val}</Text>,
    },
    {
      title: 'SL',
      dataIndex: 'soLuong',
      key: 'soLuong',
      width: 60,
      align: 'center',
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'donGia',
      key: 'donGia',
      width: 120,
      align: 'right',
      render: (val) => `${Number(val || 0).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      width: 130,
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f766e' }}>
          {Number(val || 0).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
  ];

  const drugColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Tên Thuốc & Quy Cách',
      key: 'tenThuoc',
      render: (_, record) => (
        <div>
          <Text strong>{record.tenThuoc}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {record.donViTinh && `ĐVT: ${record.donViTinh} | `}
            {record.cachDung || 'Uống theo chỉ dẫn'}
          </div>
        </div>
      ),
    },
    {
      title: 'SL',
      dataIndex: 'soLuong',
      key: 'soLuong',
      width: 60,
      align: 'center',
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'donGia',
      key: 'donGia',
      width: 120,
      align: 'right',
      render: (val) => `${Number(val || 0).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      width: 130,
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f766e' }}>
          {Number(val || 0).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <SafetyCertificateOutlined style={{ color: '#0d9488', fontSize: 20 }} />
            <span>Bảng Kê Viện Phí & Quyết Toán Hóa Đơn</span>
          </Space>
          {detail?.maHoSo && (
            <Tag color="cyan" style={{ fontSize: 13, padding: '2px 8px' }}>
              {detail.maHoSo}
            </Tag>
          )}
        </div>
      }
      placement="right"
      width={780}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {detail && (
          <div>
            {isAlreadyPaid ? (
              <Alert
                message="Hồ sơ khám bệnh này ĐÃ ĐƯỢC THANH TOÁN"
                description={`Mã hóa đơn: ${detail.maHoaDon || '---'} | Ngày lập: ${detail.ngayLap ? dayjs(detail.ngayLap).format('HH:mm DD/MM/YYYY') : '---'} | Thực thu: ${Number(detail.thucThuDaLuu || 0).toLocaleString('vi-VN')} đ`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                message="Quy trình chốt viện phí nguyên tử (Atomic Checkout)"
                description="Hệ thống tự động tổng hợp tiền kỹ thuật cận lâm sàng và tiền thuốc. Khi xác nhận, hồ sơ khám sẽ được khóa và xuất hóa đơn chính thức."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Thông tin bệnh nhân & bác sĩ */}
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Họ tên người bệnh">
                  <Text strong style={{ color: '#0f766e', fontSize: 14 }}>
                    {detail.tenBenhNhan}
                  </Text>
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {detail.gioiTinh || 'N/A'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {detail.soDienThoai || '---'}
                </Descriptions.Item>
                <Descriptions.Item label="Số CCCD">
                  {detail.soCccd || '---'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {detail.ngaySinh ? dayjs(detail.ngaySinh).format('DD/MM/YYYY') : '---'}
                </Descriptions.Item>
                <Descriptions.Item label="Bác sĩ phụ trách">
                  <Text strong>{detail.tenBacSi}</Text> ({detail.phongKham || 'Phòng khám'})
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian khám">
                  {detail.ngayKham ? dayjs(detail.ngayKham).format('HH:mm DD/MM/YYYY') : '---'}
                </Descriptions.Item>
                {detail.diaChi && detail.diaChi !== 'Chưa có' && (
                  <Descriptions.Item label="Địa chỉ nơi ở" span={2}>
                    {detail.diaChi}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Phần 1: Dịch vụ cận lâm sàng */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Space>
                  <ExperimentOutlined style={{ color: '#7c3aed', fontSize: 16 }} />
                  <Text strong style={{ fontSize: 14 }}>1. Dịch Vụ Cận Lâm Sàng & Kỹ Thuật</Text>
                </Space>
                <Tag color="purple">{services.length} chỉ định</Tag>
              </div>

              {services.length > 0 ? (
                <Table
                  dataSource={services}
                  columns={serviceColumns}
                  rowKey={(rec) => rec.maChiDinh || Math.random()}
                  pagination={false}
                  size="small"
                  summary={() => (
                    <Table.Summary.Row style={{ backgroundColor: '#faf5ff' }}>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong>Cộng tiền dịch vụ cận lâm sàng:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: '#7c3aed' }}>
                          {serviceTotal.toLocaleString('vi-VN')} đ
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              ) : (
                <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 6, color: '#6b7280', fontSize: 13 }}>
                  Ca khám không có chỉ định dịch vụ cận lâm sàng.
                </div>
              )}
            </div>

            {/* Phần 2: Đơn thuốc điều trị */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Space>
                  <MedicineBoxOutlined style={{ color: '#2563eb', fontSize: 16 }} />
                  <Text strong style={{ fontSize: 14 }}>2. Đơn Thuốc Điều Trị</Text>
                </Space>
                <Tag color="geekblue">{drugs.length} loại thuốc</Tag>
              </div>

              {drugs.length > 0 ? (
                <Table
                  dataSource={drugs}
                  columns={drugColumns}
                  rowKey={(rec) => rec.maDonThuoc || Math.random()}
                  pagination={false}
                  size="small"
                  summary={() => (
                    <Table.Summary.Row style={{ backgroundColor: '#eff6ff' }}>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong>Cộng tiền đơn thuốc điều trị:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: '#2563eb' }}>
                          {drugTotal.toLocaleString('vi-VN')} đ
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              ) : (
                <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 6, color: '#6b7280', fontSize: 13 }}>
                  Bác sĩ không kê đơn thuốc cho ca khám này.
                </div>
              )}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Phần 3: Bảng tổng hợp & Form quyết toán */}
            <Card
              title={
                <Space>
                  <DollarCircleOutlined style={{ color: '#0d9488' }} />
                  <span>Quyết Toán Viện Phí & Phương Thức Thu</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                borderColor: '#ccfbf1',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                  tienGiamGia: 0,
                  hinhThucThanhToan: 'Tiền mặt',
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#6b7280' }}>Tiền dịch vụ:</span>
                      <span style={{ float: 'right', fontWeight: 500 }}>
                        {serviceTotal.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#6b7280' }}>Tiền thuốc:</span>
                      <span style={{ float: 'right', fontWeight: 500 }}>
                        {drugTotal.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div style={{ marginBottom: 8, paddingTop: 6, borderTop: '1px dashed #e2e8f0' }}>
                      <span style={{ fontWeight: 600 }}>Tạm tính tổng viện phí:</span>
                      <span style={{ float: 'right', fontWeight: 700, color: '#1e293b' }}>
                        {subtotal.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div
                      style={{
                        padding: 12,
                        backgroundColor: '#f0fdfa',
                        border: '1px solid #99f6e4',
                        borderRadius: 8,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 600, textTransform: 'uppercase' }}>
                        Số tiền người bệnh phải thanh toán
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
                        {subtotal.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </Col>
                </Row>

                {!isAlreadyPaid && (
                  <>
                    <Row gutter={16} style={{ marginTop: 16 }}>
                      <Col span={24}>
                        <Form.Item
                          name="hinhThucThanhToan"
                          label="Hình thức thanh toán"
                          rules={[{ required: true, message: 'Vui lòng chọn hình thức thanh toán!' }]}
                        >
                          <Select size="large">
                            <Select.Option value="Tiền mặt">💵 Tiền mặt</Select.Option>
                            <Select.Option value="Chuyển khoản">💳 Chuyển khoản ngân hàng (QR)</Select.Option>
                            <Select.Option value="Thẻ tín dụng / Ghi nợ">🏧 Quẹt thẻ POS</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        icon={<DollarCircleOutlined />}
                        loading={isSubmitting}
                        style={{
                          backgroundColor: '#0d9488',
                          borderColor: '#0d9488',
                          height: 48,
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        Xác Nhận & Xuất Hóa Đơn ({subtotal.toLocaleString('vi-VN')} đ)
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form>
            </Card>
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default CheckoutDetailDrawer;
