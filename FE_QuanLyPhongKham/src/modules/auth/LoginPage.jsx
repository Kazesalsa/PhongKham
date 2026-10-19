import React from 'react';
import { Card, Form, Input, Button, Typography, Space, Row, Col } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  HeartFilled,
  LoginOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { ROLES } from '../../constants/roleConstants';
import { ROUTE_PATHS } from '../../constants/routePaths';
import './LoginPage.scss';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleFinish = async (values) => {
    try {
      const user = await login(values.username, values.password);
      // Navigate to corresponding home page
      switch (user.role) {
        case ROLES.ADMIN:
          navigate(ROUTE_PATHS.ADMIN.ANALYTICS);
          break;
        case ROLES.DOCTOR:
          navigate(ROUTE_PATHS.DOCTOR.QUEUE);
          break;
        case ROLES.RECEPTIONIST:
          navigate(ROUTE_PATHS.RECEPTIONIST.QUEUE);
          break;
        case ROLES.PHARMACIST:
          navigate(ROUTE_PATHS.PHARMACY.INVENTORY);
          break;
        default:
          navigate('/');
      }
    } catch {
      // Error handled by axiosClient interceptor
    }
  };

  const setTestAccount = (username, password) => {
    form.setFieldsValue({ username, password });
  };

  return (
    <Card className="login-card">
      <div className="login-header">
        <HeartFilled className="brand-icon" />
        <Title level={3} className="brand-title">
          HỆ THỐNG PHÒNG KHÁM
        </Title>
        <div className="brand-sub">Đăng nhập cổng nghiệp vụ phân quyền y tế</div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ username: 'letan1', password: '123456' }}
      >
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Ví dụ: letan1, bacsi1..."
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Nhập mật khẩu..."
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8, marginTop: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isLoading}
            icon={<LoginOutlined />}
            style={{ backgroundColor: '#0d9488', height: 44, fontWeight: 600 }}
          >
            Đăng Nhập
          </Button>
        </Form.Item>
      </Form>

      <div className="quick-accounts">
        <div className="quick-title">Tài khoản kiểm thử nhanh (Password: 123456)</div>
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Button
              size="small"
              block
              onClick={() => setTestAccount('letan1', '123456')}
            >
              👩‍💼 Lễ tân (letan1)
            </Button>
          </Col>
          <Col span={12}>
            <Button
              size="small"
              block
              onClick={() => setTestAccount('bacsi1', '123456')}
            >
              👨‍⚕️ Bác sĩ (bacsi1)
            </Button>
          </Col>
          <Col span={12}>
            <Button
              size="small"
              block
              onClick={() => setTestAccount('duocsi1', '123456')}
            >
              💊 Dược sĩ (duocsi1)
            </Button>
          </Col>
          <Col span={12}>
            <Button
              size="small"
              block
              onClick={() => setTestAccount('admin', '123456')}
            >
              🛡️ Quản trị (admin)
            </Button>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default LoginPage;
