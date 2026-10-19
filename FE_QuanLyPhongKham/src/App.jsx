import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './stores/useAuthStore';
import { setAntdInstances } from './utils/notificationUtil';

const AntdContextBridge = () => {
  const { message, notification } = AntdApp.useApp();
  useEffect(() => {
    setAntdInstances({ message, notification });
  }, [message, notification]);
  return null;
};

// Ant Design Custom Theme Configuration (Medical Palette)
const themeConfig = {
  token: {
    colorPrimary: '#0d9488',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0284c7',
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 38,
      borderRadius: 6,
    },
    Input: {
      controlHeight: 38,
      borderRadius: 6,
    },
    Select: {
      controlHeight: 38,
      borderRadius: 6,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      borderRadius: 8,
      headerBg: '#f8fafc',
      headerColor: '#1e293b',
    },
  },
};

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ConfigProvider theme={themeConfig}>
      <AntdApp>
        <AntdContextBridge />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
