import React, { useState, useEffect } from 'react';
import { Card, Segmented } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import ExistingPatientTab from './admission/ExistingPatientTab';
import NewPatientTab from './admission/NewPatientTab';

const AdmissionPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' | 'new'
  const [initialPatient, setInitialPatient] = useState(null);
  const [newPatientPrefill, setNewPatientPrefill] = useState({});

  useEffect(() => {
    if (location.state?.patient) {
      setActiveTab('existing');
      setInitialPatient(location.state.patient);
    }
  }, [location.state]);

  const handleSwitchToNew = (searchKeyword = '') => {
    const prefill = {};
    if (/^[0-9]{9,12}$/.test(searchKeyword)) {
      prefill.soCccd = searchKeyword;
    } else if (/^[0-9]{10}$/.test(searchKeyword)) {
      prefill.soDienThoai = searchKeyword;
    } else if (searchKeyword) {
      prefill.hoTen = searchKeyword;
    }
    setNewPatientPrefill(prefill);
    setActiveTab('new');
  };

  return (
    <div>
      <PageHeader
        title="Tiếp Nhận Ca Khám Bệnh Mới"
        subtitle="Tra cứu nhanh bệnh nhân cũ hoặc đăng ký mới, tự động cấp số thứ tự và phân phối phòng khám"
      />

      <Card style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Segmented
            size="large"
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setInitialPatient(null);
            }}
            options={[
              {
                label: 'Bệnh nhân đã có hồ sơ (Tái khám)',
                value: 'existing',
                icon: <SearchOutlined />,
              },
              {
                label: 'Đăng ký bệnh nhân mới',
                value: 'new',
                icon: <UserAddOutlined />,
              },
            ]}
          />
        </div>

        {activeTab === 'existing' ? (
          <ExistingPatientTab
            initialPatient={initialPatient}
            onSwitchToNew={handleSwitchToNew}
          />
        ) : (
          <NewPatientTab initialValues={newPatientPrefill} />
        )}
      </Card>
    </div>
  );
};

export default AdmissionPage;
