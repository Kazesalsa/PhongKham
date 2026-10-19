import React, { useEffect } from 'react';
import { Card, Table, Button, Tag, Space } from 'antd';
import { ReloadOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDoctorStore } from '../../stores/useDoctorStore';
import { ROUTE_PATHS } from '../../constants/routePaths';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';
import { formatDateTime } from '../../utils/formatDate';

const DoctorQueuePage = () => {
  const navigate = useNavigate();
  const { doctorQueue, fetchDoctorQueue, setActivePatient, isLoading } = useDoctorStore();

  useEffect(() => {
    fetchDoctorQueue();
  }, [fetchDoctorQueue]);

  const handleStartExam = (patient) => {
    setActivePatient(patient);
    navigate(ROUTE_PATHS.DOCTOR.EXAMINATION);
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'soThuTu',
      key: 'soThuTu',
      width: 70,
      align: 'center',
      render: (stt) => (
        <Tag color="cyan" style={{ fontSize: 14, fontWeight: 700, padding: '2px 8px' }}>
          #{stt}
        </Tag>
      ),
    },
    {
      title: 'Mã Lịch Hẹn',
      dataIndex: 'maLichHen',
      key: 'maLichHen',
      width: 120,
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: 'Bệnh Nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <small style={{ color: '#64748b' }}>Mã: {record.maBenhNhan}</small>
        </div>
      ),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'soDienThoai',
      key: 'soDienThoai',
      width: 130,
    },
    {
      title: 'Loại Khám',
      dataIndex: 'loaiLichHen',
      key: 'loaiLichHen',
      width: 110,
      align: 'center',
      render: (type, record) => {
        const isFollowUp =
          type === 'Tái khám' ||
          (record.ghiChu && record.ghiChu.toLowerCase().includes('tái khám'));
        return isFollowUp ? (
          <Tag color="geekblue" style={{ fontWeight: 600, borderRadius: 12, padding: '2px 10px' }}>
            Tái Khám
          </Tag>
        ) : (
          <Tag color="green" style={{ fontWeight: 500, borderRadius: 12, padding: '2px 10px' }}>
            Khám Mới
          </Tag>
        );
      },
    },
    {
      title: 'Phòng Khám',
      dataIndex: 'phongKham',
      key: 'phongKham',
      width: 120,
    },
    {
      title: 'Thời Gian Đăng Ký',
      dataIndex: 'thoiGianHen',
      key: 'thoiGianHen',
      width: 160,
      render: (val) => formatDateTime(val),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      render: (stt) => <StatusTag status={stt} />,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<MedicineBoxOutlined />}
          style={{ backgroundColor: '#0d9488' }}
          onClick={() => handleStartExam(record)}
        >
          Khám Bệnh
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Danh Sách Bệnh Nhân Đang Chờ Khám"
        subtitle="Hàng chờ khám bệnh của bác sĩ trong ngày hôm nay"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchDoctorQueue()}
            loading={isLoading}
          >
            Làm Mới
          </Button>
        }
      />

      <Card>
        <Table
          dataSource={doctorQueue}
          columns={columns}
          rowKey="maLichHen"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Hiện không có bệnh nhân nào chờ phòng khám của bạn.' }}
        />
      </Card>
    </div>
  );
};

export default DoctorQueuePage;
