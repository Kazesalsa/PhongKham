import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Tag, Button, Flex, Typography } from 'antd';
import {
  MedicineBoxOutlined,
  UserAddOutlined,
  TeamOutlined,
  SearchOutlined,
  DollarOutlined,
  UnorderedListOutlined,
  DatabaseOutlined,
  AlertOutlined,
  BarChartOutlined,
  RiseOutlined,
  LogoutOutlined,
  UserOutlined,
  HeartFilled,
  FileTextOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../constants/roleConstants';
import { ROUTE_PATHS } from '../constants/routePaths';
import './MainLayout.scss';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  // Build menu items based strictly on user's role
  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case ROLES.RECEPTIONIST:
        return [
          {
            key: ROUTE_PATHS.RECEPTIONIST.ADMISSION,
            icon: <UserAddOutlined />,
            label: 'Tiếp Nhận Khám',
          },
          {
            key: ROUTE_PATHS.RECEPTIONIST.QUEUE,
            icon: <TeamOutlined />,
            label: 'Hàng Chờ Hôm Nay',
          },
          {
            key: ROUTE_PATHS.RECEPTIONIST.PATIENTS,
            icon: <SearchOutlined />,
            label: 'Tra Cứu Bệnh Nhân',
          },
          {
            key: ROUTE_PATHS.RECEPTIONIST.CHECKOUT,
            icon: <DollarOutlined />,
            label: 'Thanh Toán Viện Phí',
          },
        ];

      case ROLES.DOCTOR:
        return [
          {
            key: ROUTE_PATHS.DOCTOR.QUEUE,
            icon: <UnorderedListOutlined />,
            label: 'Danh Sách Chờ Khám',
          },
          {
            key: ROUTE_PATHS.DOCTOR.EXAMINATION,
            icon: <MedicineBoxOutlined />,
            label: 'Phòng Khám Bệnh',
          },
        ];

      case ROLES.PHARMACIST:
        return [
          {
            key: ROUTE_PATHS.PHARMACY.INVENTORY,
            icon: <DatabaseOutlined />,
            label: 'Danh Mục Kho Thuốc',
          },
          {
            key: ROUTE_PATHS.PHARMACY.ALERTS,
            icon: <AlertOutlined />,
            label: 'Cảnh Báo Tồn & Hạn',
          },
        ];

      case ROLES.ADMIN:
        return [
          {
            key: ROUTE_PATHS.ADMIN.USERS,
            icon: <TeamOutlined />,
            label: 'Quản Lý Nhân Sự',
          },
          {
            key: ROUTE_PATHS.ADMIN.ANALYTICS,
            icon: <BarChartOutlined />,
            label: 'Phân Tích Doanh Thu',
          },
          {
            key: ROUTE_PATHS.ADMIN.PRODUCTIVITY,
            icon: <RiseOutlined />,
            label: 'Năng Suất Bác Sĩ',
          },
          {
            key: ROUTE_PATHS.ADMIN.INVOICES,
            icon: <FileTextOutlined />,
            label: 'Lịch Sử Hóa Đơn',
          },
        ];

      default:
        return [];
    }
  };

  const userMenuItems = [
    {
      key: 'info',
      label: (
        <div>
          <div style={{ fontWeight: 600 }}>{user?.fullName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            @{user?.username} ({user?.userId})
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="main-sider"
        width={240}
      >
        <div className="logo-container">
          <HeartFilled className="logo-icon" />
          {!collapsed && <span className="logo-text">MEDICARE CLINIC</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header className="main-header">
          <Flex align="center" gap="middle">
            <Text strong style={{ fontSize: 16 }}>
              Hệ Thống Quản Lý Phòng Khám
            </Text>
            {user?.role && (
              <Tag color={ROLE_COLORS[user.role]}>
                {ROLE_LABELS[user.role] || user.role}
              </Tag>
            )}
          </Flex>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <div className="user-profile">
              <Avatar
                style={{ backgroundColor: '#0d9488' }}
                icon={<UserOutlined />}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
              <Text strong style={{ color: '#334155' }}>
                {user?.fullName || user?.username}
              </Text>
            </div>
          </Dropdown>
        </Header>

        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
