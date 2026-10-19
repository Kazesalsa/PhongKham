import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Alert,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useReceptionistStore } from '../../../stores/useReceptionistStore';
import { doctorService } from '../../../services/doctorService';
import dayjs from 'dayjs';

const NewPatientTab = ({ initialValues = {} }) => {
  const [form] = Form.useForm();
  const { admitPatient, isSubmitting } = useReceptionistStore();
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
        // Fallback handled
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, [form]);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        hoTen: values.hoTen.trim(),
        ngaySinh: values.ngaySinh.format('YYYY-MM-DD'),
        gioiTinh: values.gioiTinh,
        soDienThoai: values.soDienThoai.trim(),
        soCccd: values.soCccd ? values.soCccd.trim() : '',
        diaChi: values.diaChi ? values.diaChi.trim() : '',
        maBacSi: values.maBacSi,
        thoiGianHen: values.thoiGianHen.format('YYYY-MM-DD HH:mm:ss'),
      };
      await admitPatient(payload);
      form.resetFields();
      form.setFieldsValue({
        gioiTinh: 'Nam',
        maBacSi: doctorList.length > 0 ? doctorList[0].maBacSi : 'BS001',
        thoiGianHen: dayjs(),
      });
    } catch {
      // Handled in store/axiosClient
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        gioiTinh: 'Nam',
        maBacSi: 'BS001',
        thoiGianHen: dayjs(),
        ...initialValues,
      }}
    >
      <Alert
        type="success"
        showIcon
        title="Đăng ký hồ sơ bệnh nhân mới"
        description="Điền đầy đủ thông tin hành chính cho bệnh nhân lần đầu tới khám tại phòng khám."
        style={{ marginBottom: 20 }}
      />

      <Row gutter={16}>
        <Col xs={24} sm={16}>
          <Form.Item
            name="hoTen"
            label="Họ và Tên bệnh nhân"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên bệnh nhân!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn An" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="gioiTinh"
            label="Giới tính"
            rules={[{ required: true, message: 'Chọn giới tính!' }]}
          >
            <Select size="large">
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="ngaySinh"
            label="Ngày tháng năm sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="soDienThoai"
            label="Số điện thoại liên hệ"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số!' },
            ]}
          >
            <Input placeholder="Ví dụ: 0912345678" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="soCccd"
            label="Số Căn cước công dân (CCCD)"
            rules={[
              { required: true, message: 'Vui lòng nhập số CCCD của bệnh nhân!' },
              { pattern: /^[0-9]{9,12}$/, message: 'Số CCCD phải gồm từ 9 đến 12 chữ số!' },
            ]}
          >
            <Input placeholder="Ví dụ: 079201001234" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="diaChi"
            label="Địa chỉ nơi cư trú"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nơi cư trú của bệnh nhân!' }]}
          >
            <Input placeholder="Ví dụ: 123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM" size="large" />
          </Form.Item>
        </Col>
      </Row>

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

      <Form.Item style={{ marginTop: 20 }}>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          size="large"
          loading={isSubmitting}
          style={{ backgroundColor: '#0d9488', minWidth: 200 }}
        >
          Tiếp Nhận & Cấp STT
        </Button>
      </Form.Item>
    </Form>
  );
};

export default NewPatientTab;
