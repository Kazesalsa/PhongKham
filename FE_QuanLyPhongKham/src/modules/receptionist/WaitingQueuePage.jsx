import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Input, Form, Space, Tag } from 'antd';
import { ReloadOutlined, StopOutlined } from '@ant-design/icons';
import { useReceptionistStore } from '../../stores/useReceptionistStore';
import PageHeader from '../../components/PageHeader';
import StatusTag from '../../components/StatusTag';
import { formatDateTime } from '../../utils/formatDate';

const WaitingQueuePage = () => {
  const { queueList, fetchQueue, cancelAppointment, isLoading, isSubmitting } =
    useReceptionistStore();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleOpenCancel = (record) => {
    setSelectedAppointment(record);
    form.resetFields();
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async (values) => {
    if (!selectedAppointment) return;
    try {
      await cancelAppointment({
        maLichHen: selectedAppointment.maLichHen,
        lyDo: values.lyDo || 'Bệnh nhân xin hủy lịch',
      });
      setCancelModalVisible(false);
      setSelectedAppointment(null);
    } catch {
      // Handled
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'soThuTu',
      key: 'soThuTu',
      width: 70,
      align: 'center',
      render: (stt) => (
        <Tag color="cyan" style={{ fontSize: 14, fontWeight: 700, padding: '2px 10px' }}>
          #{stt}
        </Tag>
      ),
    },
    {
      title: 'Mã Lịch Hẹn',
      dataIndex: 'maLichHen',
      key: 'maLichHen',
      width: 120,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Họ Tên Bệnh Nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'soDienThoai',
      key: 'soDienThoai',
      width: 130,
    },
    {
      title: 'Bác Sĩ Khám',
      dataIndex: 'tenBacSi',
      key: 'tenBacSi',
    },
    {
      title: 'Phòng Khám',
      dataIndex: 'phongKham',
      key: 'phongKham',
      width: 120,
    },
    {
      title: 'Thời Gian Hẹn',
      dataIndex: 'thoiGianHen',
      key: 'thoiGianHen',
      width: 160,
      render: (val) => formatDateTime(val),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (stt) => <StatusTag status={stt} />,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<StopOutlined />}
          disabled={record.trangThai !== 'Chờ khám'}
          onClick={() => handleOpenCancel(record)}
        >
          Hủy Lịch
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hàng Chờ Khám Hôm Nay"
        subtitle="Danh sách bệnh nhân tiếp nhận trong ngày theo số thứ tự (View v_hang_cho_kham_hom_nay)"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchQueue()}
            loading={isLoading}
          >
            Làm Mới
          </Button>
        }
      />

      <Card>
        <Table
          dataSource={queueList}
          columns={columns}
          rowKey="maLichHen"
          loading={isLoading}
          pagination={{ pageSize: 15 }}
          locale={{ emptyText: 'Hiện không có bệnh nhân nào trong hàng chờ hôm nay.' }}
        />
      </Card>

      <Modal
        title="Hủy Lịch Hẹn Khám Bệnh"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        okText="Xác Nhận Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn hủy lịch khám của bệnh nhân{' '}
          <strong>{selectedAppointment?.tenBenhNhan}</strong> (Mã:{' '}
          {selectedAppointment?.maLichHen})?
        </p>
        <Form form={form} layout="vertical" onFinish={handleConfirmCancel}>
          <Form.Item
            name="lyDo"
            label="Lý do hủy lịch"
            rules={[{ required: true, message: 'Vui lòng nhập lý do hủy lịch!' }]}
            initialValue="Bệnh nhân bận việc đột xuất xin hủy"
          >
            <Input.TextArea rows={3} placeholder="Nhập lý do chi tiết..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WaitingQueuePage;
