import React from 'react';
import { Tag } from 'antd';
import {
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const StatusTag = ({ status }) => {
  if (!status) return <Tag>N/A</Tag>;

  switch (status) {
    case 'Chờ khám':
      return (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          Chờ khám
        </Tag>
      );
    case 'Đang khám':
      return (
        <Tag icon={<SyncOutlined spin />} color="gold">
          Đang khám
        </Tag>
      );
    case 'Đã khám':
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Đã khám
        </Tag>
      );
    case 'Đã hủy':
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          Đã hủy
        </Tag>
      );
    case 'Chưa thanh toán':
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="warning">
          Chưa thanh toán
        </Tag>
      );
    case 'Đã thanh toán':
      return (
        <Tag icon={<DollarCircleOutlined />} color="cyan">
          Đã thanh toán
        </Tag>
      );
    case 'Sắp hết hạn':
      return <Tag color="red">Sắp hết hạn</Tag>;
    case 'Cận hạn':
      return <Tag color="orange">Cận hạn</Tag>;
    case 'Còn hạn':
      return <Tag color="green">Còn hạn</Tag>;
    default:
      return <Tag color="default">{status}</Tag>;
  }
};

export default StatusTag;
