import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Descriptions,
  Table,
  Tag,
  Alert,
  Empty,
  Space,
} from 'antd';
import {
  SearchOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  IdcardOutlined,
  PhoneOutlined,
  UserOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useReceptionistStore } from '../../../stores/useReceptionistStore';
import { receptionistService } from '../../../services/receptionistService';
import { doctorService } from '../../../services/doctorService';
import { formatDate, calculateAge } from '../../../utils/formatDate';
import { showError, showSuccess } from '../../../utils/notificationUtil';
import dayjs from 'dayjs';

const { Text } = Typography;

const ExistingPatientTab = ({ initialPatient = null, onSwitchToNew }) => {
  const [form] = Form.useForm();
  const { admitPatient, isSubmitting } = useReceptionistStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(initialPatient);
  const [hasSearched, setHasSearched] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const data = await doctorService.getActiveDoctors();
        if (Array.isArray(data) && data.length > 0) {
          setDoctorList(data);
          if (!form.getFieldValue('maBacSi')) {
            form.setFieldValue('maBacSi', data[0].maBacSi);
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, [form]);
  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const [isCheckingInFollowUp, setIsCheckingInFollowUp] = useState(false);

  useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient);
    }
  }, [initialPatient]);

  // Fetch pending follow-up appointments when a patient is selected
  useEffect(() => {
    if (selectedPatient?.maBenhNhan) {
      receptionistService
        .getFollowUpAppointments(selectedPatient.maBenhNhan)
        .then((res) => {
          setPendingFollowUps(Array.isArray(res) ? res : []);
        })
        .catch(() => setPendingFollowUps([]));
    } else {
      setPendingFollowUps([]);
    }
  }, [selectedPatient]);

  // Handle 1-Click Check-in for follow-up appointment
  const handleCheckInFollowUp = async (maLichHen) => {
    setIsCheckingInFollowUp(true);
    try {
      const res = await receptionistService.checkInFollowUp(maLichHen);
      showSuccess(
        `Tiếp nhận tái khám thành công! Bệnh nhân đã vào hàng chờ BS. ${res?.tenBacSi || ''} (STT: #${res?.soThuTu || 1})`
      );
      setSelectedPatient(null);
      setSearchResults([]);
      setSearchKeyword('');
      setHasSearched(false);
      setPendingFollowUps([]);
    } catch {
      // Handled in axiosClient
    } finally {
      setIsCheckingInFollowUp(false);
    }
  };

  // Handle searching patient by CCCD / SĐT / Name
  const handleSearch = async (value) => {
    const keyword = (value || searchKeyword || '').trim();
    if (!keyword) {
      showError('Vui lòng nhập số CCCD, số điện thoại hoặc họ tên để tìm kiếm!');
      return;
    }
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const res = await receptionistService.searchPatients(keyword, 1, 10);
      const list = res?.items || [];
      setSearchResults(list);
      if (list.length === 1) {
        setSelectedPatient(list[0]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Submit appointment for selected existing patient
  const handleFinish = async (values) => {
    if (!selectedPatient) {
      showError('Vui lòng tra cứu và chọn một bệnh nhân trước khi đặt khám!');
      return;
    }

    try {
      const payload = {
        hoTen: selectedPatient.hoTen.trim(),
        ngaySinh: dayjs(selectedPatient.ngaySinh).format('YYYY-MM-DD'),
        gioiTinh: selectedPatient.gioiTinh,
        soDienThoai: selectedPatient.soDienThoai.trim(),
        soCccd: selectedPatient.soCccd ? selectedPatient.soCccd.trim() : '',
        diaChi: selectedPatient.diaChi ? selectedPatient.diaChi.trim() : '',
        maBacSi: values.maBacSi,
        thoiGianHen: values.thoiGianHen.format('YYYY-MM-DD HH:mm:ss'),
      };
      await admitPatient(payload);
      setSelectedPatient(null);
      setSearchResults([]);
      setSearchKeyword('');
      setHasSearched(false);
      form.resetFields();
      form.setFieldsValue({
        maBacSi: 'BS001',
        thoiGianHen: dayjs(),
      });
    } catch {
      // Handled in store/axiosClient
    }
  };

  // Columns for search results table
  const searchColumns = [
    {
      title: 'Mã BN',
      dataIndex: 'maBenhNhan',
      key: 'maBenhNhan',
      width: 100,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Số CCCD',
      dataIndex: 'soCccd',
      key: 'soCccd',
      render: (cccd) => cccd || <Text type="secondary">Chưa có</Text>,
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'soDienThoai',
      key: 'soDienThoai',
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'ngaySinh',
      key: 'ngaySinh',
      render: (val) => `${formatDate(val)} (${calculateAge(val)}t)`,
    },
    {
      title: 'Giới Tính',
      dataIndex: 'gioiTinh',
      key: 'gioiTinh',
      align: 'center',
      render: (gt) => (
        <Tag color={gt === 'Nam' ? 'cyan' : gt === 'Nữ' ? 'magenta' : 'default'}>{gt}</Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'select',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          style={{ backgroundColor: '#0d9488' }}
          onClick={() => setSelectedPatient(record)}
        >
          Chọn bệnh nhân
        </Button>
      ),
    },
  ];

  return (
    <div>
      {!selectedPatient ? (
        <div>
          <Alert
            type="info"
            showIcon
            title="Tra cứu hồ sơ bệnh nhân nhanh"
            description="Lễ tân chỉ cần hỏi Số CCCD hoặc Số điện thoại của bệnh nhân để tự động tải hồ sơ cũ, không cần nhập lại thông tin hành chính."
            style={{ marginBottom: 20 }}
          />

          <Input.Search
            placeholder="Nhập Số CCCD (12 số) hoặc Số điện thoại (10 số) hoặc Họ tên..."
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />} style={{ backgroundColor: '#0d9488' }}>
                Tìm Bệnh Nhân
              </Button>
            }
            size="large"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            loading={searchLoading}
            style={{ marginBottom: 20 }}
          />

          {hasSearched && searchResults.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Kết quả tìm kiếm ({searchResults.length} bệnh nhân):
              </Text>
              <Table
                dataSource={searchResults}
                columns={searchColumns}
                rowKey="maBenhNhan"
                pagination={false}
                size="middle"
              />
            </div>
          )}

          {hasSearched && !searchLoading && searchResults.length === 0 && (
            <Empty
              description={
                <span>
                  Không tìm thấy bệnh nhân nào khớp với từ khóa <strong>"{searchKeyword}"</strong>.
                </span>
              }
              style={{ margin: '30px 0' }}
            >
              {onSwitchToNew && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  style={{ backgroundColor: '#0d9488' }}
                  onClick={() => onSwitchToNew(searchKeyword)}
                >
                  Tạo hồ sơ bệnh nhân mới ngay
                </Button>
              )}
            </Empty>
          )}
        </div>
      ) : (
        <div>
          {/* BANNER CẢNH BÁO PHÁT HIỆN LỊCH HẸN TÁI KHÁM */}
          {pendingFollowUps.length > 0 && (
            <Alert
              type="info"
              showIcon
              style={{
                marginBottom: 20,
                border: '1.5px solid #0284c7',
                backgroundColor: '#f0f9ff',
                borderRadius: 8,
                padding: '12px 16px',
              }}
              message={
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0369a1' }}>
                  🎯 Phát hiện Lịch Hẹn Tái Khám ({pendingFollowUps[0].maLichHen})
                </span>
              }
              description={
                <div style={{ marginTop: 8 }}>
                  <Row gutter={[16, 8]} align="middle">
                    <Col xs={24} sm={16}>
                      <div style={{ marginBottom: 4 }}>
                        <strong>Bác sĩ chỉ định:</strong> {pendingFollowUps[0].tenBacSi} ({pendingFollowUps[0].phongKham})
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <strong>Ngày hẹn tái khám:</strong>{' '}
                        <Tag color="blue" style={{ fontWeight: 600 }}>
                          {formatDate(pendingFollowUps[0].thoiGianHen)}
                        </Tag>
                      </div>
                      <div style={{ color: '#475569' }}>
                        <strong>Nội dung / Lời dặn:</strong> {pendingFollowUps[0].ghiChu || 'Tái khám theo chỉ định'}
                      </div>
                    </Col>
                    <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        loading={isCheckingInFollowUp}
                        style={{
                          backgroundColor: '#0284c7',
                          borderColor: '#0284c7',
                          fontWeight: 600,
                          borderRadius: 8,
                        }}
                        onClick={() => handleCheckInFollowUp(pendingFollowUps[0].maLichHen)}
                      >
                        Tiếp Nhận Vào Khám Ngay
                      </Button>
                    </Col>
                  </Row>
                </div>
              }
            />
          )}

          {/* THẺ HỒ SƠ BỆNH NHÂN ĐÃ CHỌN */}
          <Card
            type="inner"
            style={{
              backgroundColor: '#f0fdf4',
              borderColor: '#86efac',
              marginBottom: 24,
            }}
            title={
              <Space align="center">
                <UserOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>
                  HỒ SƠ BỆNH NHÂN ĐÃ CHỌN
                </span>
                <Tag color="green">Đã có hồ sơ ({selectedPatient.maBenhNhan})</Tag>
              </Space>
            }
            extra={
              <Button
                icon={<SwapOutlined />}
                onClick={() => {
                  setSelectedPatient(null);
                  setSearchResults([]);
                  setHasSearched(false);
                }}
              >
                Đổi bệnh nhân khác
              </Button>
            }
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="middle">
              <Descriptions.Item label="Họ và Tên">
                <strong style={{ fontSize: 15, color: '#0f172a' }}>{selectedPatient.hoTen}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Số CCCD">
                <Tag icon={<IdcardOutlined />} color="blue">
                  {selectedPatient.soCccd || 'Chưa cập nhật'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số Điện Thoại">
                <Tag icon={<PhoneOutlined />} color="green">
                  {selectedPatient.soDienThoai}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Sinh">
                {formatDate(selectedPatient.ngaySinh)} ({calculateAge(selectedPatient.ngaySinh)} tuổi)
              </Descriptions.Item>
              <Descriptions.Item label="Giới Tính">
                {selectedPatient.gioiTinh}
              </Descriptions.Item>
              <Descriptions.Item label="Địa Chỉ">
                {selectedPatient.diaChi || 'Chưa có'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* FORM CHỌN BÁC SĨ & THỜI GIAN ĐẶT KHÁM */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              maBacSi: 'BS001',
              thoiGianHen: dayjs(),
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="maBacSi"
                  label="Bác sĩ phụ trách / Phòng khám"
                  rules={[{ required: true, message: 'Vui lòng chọn bác sĩ phụ trách!' }]}
                >
                  <Select size="large" loading={loadingDoctors} placeholder="Chọn bác sĩ phụ trách">
                    {doctorList.map((doc) => (
                      <Select.Option key={doc.maBacSi} value={doc.maBacSi}>
                        {doc.hoTen} ({doc.phongKham} - {doc.chuyenKhoa})
                      </Select.Option>
                    ))}
                    {doctorList.length === 0 && (
                      <Select.Option value="BS001">BS. Nguyễn Văn A (Phòng 101 - Nội tổng quát)</Select.Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="thoiGianHen"
                  label="Thời gian đăng ký khám"
                  rules={[{ required: true, message: 'Chọn thời gian khám!' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    size="large"
                    format="DD/MM/YYYY HH:mm"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                loading={isSubmitting}
                style={{ backgroundColor: '#0d9488', minWidth: 200 }}
              >
                Xác Nhận Đặt Khám & Cấp STT
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
};

export default ExistingPatientTab;
