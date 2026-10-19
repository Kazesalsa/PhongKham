import React from 'react';
import { Modal, Button, Divider, Space, Tag, Typography, Row, Col } from 'antd';
import {
  PrinterOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  HomeOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const InvoiceReceiptModal = ({ open, invoice, onClose }) => {
  if (!invoice) return null;

  const patient = invoice.patientInfo || {};
  const services = patient.danhSachDichVu || [];
  const drugs = patient.danhSachThuoc || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={680}
      footer={[
        <Button key="close" onClick={onClose} size="large">
          Đóng & Hoàn tất
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          size="large"
          onClick={handlePrint}
          style={{ backgroundColor: '#0d9488', borderColor: '#0d9488', fontWeight: 600 }}
        >
          In Biên Lai Thu Tiền
        </Button>,
      ]}
      centered
      destroyOnClose
    >
      <div id="clinic-invoice-receipt" style={{ padding: '8px 4px', color: '#1f2937' }}>
        {/* Header phòng khám */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b' }}>
            Hệ Thống Y Tế Medicare Clinic
          </div>
          <Title level={4} style={{ margin: '4px 0', color: '#0f766e', textTransform: 'uppercase' }}>
            Biên Lai Thu Viện Phí & Quyết Toán Hóa Đơn
          </Title>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            <span><HomeOutlined /> 123 Đường Sức Khỏe, Quận 1, TP. Hồ Chí Minh</span>
            <span style={{ marginLeft: 12 }}><PhoneOutlined /> Hotline: 1900 6868</span>
          </div>
        </div>

        {/* Thông tin hóa đơn */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '10px 16px',
            marginBottom: 16,
          }}
        >
          <Row gutter={[16, 8]} style={{ fontSize: 13 }}>
            <Col span={12}>
              <Text type="secondary">Mã hóa đơn:</Text>{' '}
              <Tag color="cyan" style={{ fontSize: 13, fontWeight: 700 }}>
                {invoice.maHoaDon || invoice.maHoaDonCode || 'HD---'}
              </Tag>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Text type="secondary">Ngày giờ lập:</Text>{' '}
              <Text strong>
                {invoice.ngayLap ? dayjs(invoice.ngayLap).format('HH:mm DD/MM/YYYY') : dayjs().format('HH:mm DD/MM/YYYY')}
              </Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Mã hồ sơ khám:</Text>{' '}
              <Text strong>{invoice.maHoSo || invoice.maHoSoCode || patient.maHoSo || '---'}</Text>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Text type="secondary">Hình thức:</Text>{' '}
              <Tag color="geekblue">{invoice.hinhThucThanhToan || 'Tiền mặt'}</Tag>
            </Col>
          </Row>
        </div>

        {/* Thông tin người bệnh */}
        <div style={{ marginBottom: 16, fontSize: 13 }}>
          <Row gutter={[16, 6]}>
            <Col span={14}>
              <Text type="secondary">Họ tên người bệnh:</Text>{' '}
              <Text strong style={{ fontSize: 14, color: '#0f766e' }}>
                {patient.tenBenhNhan || '---'}
              </Text>
              {patient.gioiTinh && (
                <span style={{ color: '#64748b', marginLeft: 8 }}>({patient.gioiTinh})</span>
              )}
            </Col>
            <Col span={10}>
              <Text type="secondary">Số điện thoại:</Text>{' '}
              <Text strong>{patient.soDienThoai || '---'}</Text>
            </Col>
            <Col span={14}>
              <Text type="secondary">Số CCCD / CMND:</Text>{' '}
              <Text>{patient.soCccd || '---'}</Text>
            </Col>
            <Col span={10}>
              <Text type="secondary">Ngày sinh:</Text>{' '}
              <Text>{patient.ngaySinh ? dayjs(patient.ngaySinh).format('DD/MM/YYYY') : '---'}</Text>
            </Col>
            <Col span={24}>
              <Text type="secondary">Bác sĩ khám phụ trách:</Text>{' '}
              <Text strong>{patient.tenBacSi || 'Bác sĩ phòng khám'}</Text>
              {patient.phongKham && (
                <span style={{ color: '#64748b', marginLeft: 6 }}>({patient.phongKham})</span>
              )}
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Bảng kê vắn tắt các khoản thu */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#334155' }}>
            CHI TIẾT CÁC KHOẢN VIỆN PHÍ
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Nội dung khoản mục</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', width: 60 }}>SL</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', width: 140 }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {/* Dịch vụ */}
              {services.map((s, idx) => (
                <tr key={`s-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <Text>DV: {s.tenDichVu}</Text>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{s.soLuong}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                    {Number(s.thanhTien || 0).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}

              {/* Thuốc */}
              {drugs.map((d, idx) => (
                <tr key={`d-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <Text>Thuốc: {d.tenThuoc} ({d.donViTinh || 'Đơn vị'})</Text>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{d.soLuong}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                    {Number(d.thanhTien || 0).toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}

              {services.length === 0 && drugs.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '10px 8px', textAlign: 'center', color: '#94a3b8' }}>
                    Viện phí khám bệnh tiêu chuẩn
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tổng kết viện phí & Thực thu */}
        <div
          style={{
            backgroundColor: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
          }}
        >
          <Row gutter={[16, 6]} style={{ fontSize: 13 }}>
            <Col span={14}>Tổng tiền dịch vụ kỹ thuật:</Col>
            <Col span={10} style={{ textAlign: 'right', fontWeight: 600 }}>
              {Number(invoice.tienDichVu || patient.tienDichVu || 0).toLocaleString('vi-VN')} đ
            </Col>
            <Col span={14}>Tổng tiền thuốc điều trị:</Col>
            <Col span={10} style={{ textAlign: 'right', fontWeight: 600 }}>
              {Number(invoice.tienThuoc || patient.tienThuoc || 0).toLocaleString('vi-VN')} đ
            </Col>
            {Number(invoice.tienGiamGia || 0) > 0 && (
              <>
                <Col span={14} style={{ color: '#d97706' }}>Miễn giảm / BHYT chi trả:</Col>
                <Col span={10} style={{ textAlign: 'right', fontWeight: 600, color: '#d97706' }}>
                  - {Number(invoice.tienGiamGia).toLocaleString('vi-VN')} đ
                </Col>
              </>
            )}
            <Col span={24} style={{ borderTop: '1px dashed #0d9488', margin: '6px 0 2px 0' }} />
            <Col span={12} style={{ fontSize: 15, fontWeight: 700, color: '#0f766e' }}>
              TỔNG TIỀN THỰC THU:
            </Col>
            <Col span={12} style={{ textAlign: 'right', fontSize: 18, fontWeight: 800, color: '#0d9488' }}>
              {Number(invoice.tongTien || invoice.thucThu || 0).toLocaleString('vi-VN')} VND
            </Col>
          </Row>
        </div>

        {/* Con dấu trạng thái */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <Space>
            <CheckCircleFilled style={{ color: '#16a34a', fontSize: 20 }} />
            <Text strong style={{ color: '#16a34a', fontSize: 14 }}>
              TRẠNG THÁI: ĐÃ THANH TOÁN ĐỦ
            </Text>
          </Space>
          <div style={{ textAlign: 'center', minWidth: 160 }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Thu ngân phụ trách</div>
            <div style={{ fontWeight: 600, marginTop: 24 }}>Lễ Tân & Thu Ngân</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceReceiptModal;
