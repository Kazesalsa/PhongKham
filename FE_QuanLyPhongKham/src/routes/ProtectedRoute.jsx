import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { ROUTE_PATHS } from '../constants/routePaths';
import { Result, Button } from 'antd';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="403 - Truy cập bị từ chối"
        subTitle={`Vai trò [${user.role}] của bạn không có quyền truy cập vào chức năng này theo chính sách bảo mật DBMS.`}
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Quay lại
          </Button>
        }
        style={{ marginTop: 60 }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
