import React, { useEffect, useState, useMemo } from 'react';
import { Card, Table, Button, Tag, Row, Col, Statistic, Input, Flex, Typography, Progress, Avatar } from 'antd';
import {
  ReloadOutlined,
  TrophyOutlined,
  UserOutlined,
  DollarCircleOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useAdminStore } from '../../stores/useAdminStore';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';

const { Text } = Typography;

const DoctorProductivityPage = () => {
  const { doctorProductivity, fetchDoctorProductivity, isLoading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctorProductivity();
  }, [fetchDoctorProductivity]);

  // Filter list by search term
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return doctorProductivity;
    const q = searchTerm.toLowerCase().trim();
    return doctorProductivity.filter(
      (d) =>
        d.tenBacSi?.toLowerCase().includes(q) ||
        d.maBacSi?.toLowerCase().includes(q) ||
        d.chuyenKhoa?.toLowerCase().includes(q) ||
        d.phongKham?.toLowerCase().includes(q)
    );
  }, [doctorProductivity, searchTerm]);

  // Overall totals
  const stats = useMemo(() => {
    const totalDoctors = doctorProductivity.length;
    const totalCases = doctorProductivity.reduce((acc, curr) => acc + (Number(curr.soCaKham) || 0), 0);
    const totalRev = doctorProductivity.reduce((acc, curr) => acc + (Number(curr.tongDoanhThu || curr.tongTienKham) || 0), 0);
    const topDoctor = doctorProductivity.length > 0 ? doctorProductivity[0] : null;

    return { totalDoctors, totalCases, totalRev, topDoctor };
  }, [doctorProductivity]);

  const columns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 90,
      align: 'center',
      render: (_, __, index) => {
        if (index === 0) return <Tag color="gold" style={{ fontWeight: 700, fontSize: 13 }}>🥇 Top 1</Tag>;
        if (index === 1) return <Tag color="cyan" style={{ fontWeight: 700, fontSize: 13 }}>🥈 Top 2</Tag>;
        if (index === 2) return <Tag color="orange" style={{ fontWeight: 700, fontSize: 13 }}>🥉 Top 3</Tag>;
        return <Tag style={{ fontWeight: 600 }}>#{index + 1}</Tag>;
      },
    },
    {
      title: 'Mã Bác Sĩ',
      dataIndex: 'maBacSi',
      key: 'maBacSi',
      width: 120,
      render: (t) => <Tag color="default"><strong>{t}</strong></Tag>,
    },
    {
      title: 'Bác Sĩ Điều Trị',
      dataIndex: 'tenBacSi',
      key: 'tenBacSi',
      width: 220,
      render: (name) => (
        <Flex align="center" gap="small">
          <Avatar style={{ backgroundColor: '#0d9488' }} icon={<UserOutlined />} />
          <Text strong style={{ fontSize: 14 }}>{name}</Text>
        </Flex>
      ),
    },
    {
      title: 'Chuyên Khoa',
      dataIndex: 'chuyenKhoa',
      key: 'chuyenKhoa',
      width: 160,
      render: (v) => <Tag color="blue">{v || 'Nội tổng quát'}</Tag>,
    },
    {
      title: 'Phòng Khám',
      dataIndex: 'phongKham',
      key: 'phongKham',
      width: 130,
      render: (v) => <Tag color="purple">{v || 'P.Khám'}</Tag>,
    },
    {
      title: 'Số Ca Hoàn Tất',
      dataIndex: 'soCaKham',
      key: 'soCaKham',
      align: 'center',
      width: 140,
      render: (count) => (
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
          {count || 0} ca
        </span>
      ),
    },
    {
      title: 'Tổng Giá Trị Doanh Thu',
      dataIndex: 'tongDoanhThu',
      key: 'tongDoanhThu',
      align: 'right',
      width: 190,
      render: (val, r) => (
        <strong style={{ color: '#0d9488', fontSize: 15 }}>
          {formatCurrency(val || r.tongTienKham || 0)}
        </strong>
      ),
    },
    {
      title: 'Tỷ Trọng Doanh Số',
      key: 'ratio',
      width: 160,
      render: (_, r) => {
        const rev = Number(r.tongDoanhThu || r.tongTienKham || 0);
        const percent = stats.totalRev > 0 ? Math.round((rev / stats.totalRev) * 100) : 0;
        return (
          <div style={{ width: 120 }}>
            <Progress percent={percent} size="small" strokeColor="#0d9488" />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Báo Cáo Năng Suất & Doanh Số Bác Sĩ"
        subtitle="Theo dõi hiệu suất điều trị, số ca khám và doanh số mang lại từ dịch vụ & đơn thuốc"
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => fetchDoctorProductivity()}
            loading={isLoading}
            style={{ backgroundColor: '#0d9488' }}
          >
            Làm Mới
          </Button>
        }
      />

      {/* KPI Highlights */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#ccfbf1', background: '#f0fdfa' }}>
            <Statistic
              title={<Text strong style={{ color: '#0f766e' }}>Tổng Doanh Thu Khám & Thuốc</Text>}
              value={stats.totalRev}
              styles={{ content: { color: '#0d9488', fontWeight: 700, fontSize: 24 } }}
              prefix={<DollarCircleOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#e0f2fe', background: '#f0f9ff' }}>
            <Statistic
              title={<Text strong style={{ color: '#0369a1' }}>Tổng Ca Khám Đã Hoàn Tất</Text>}
              value={stats.totalCases}
              styles={{ content: { color: '#0284c7', fontWeight: 700, fontSize: 24 } }}
              prefix={<MedicineBoxOutlined />}
              suffix="ca"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#fef3c7', background: '#fffbeb' }}>
            <Statistic
              title={<Text strong style={{ color: '#b45309' }}>Bác Sĩ Dẫn Đầu Doanh Số</Text>}
              value={stats.topDoctor?.tenBacSi || 'Chưa có dữ liệu'}
              styles={{ content: { color: '#d97706', fontWeight: 700, fontSize: 18 } }}
              prefix={<TrophyOutlined />}
            />
            <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>
              {stats.topDoctor ? `${stats.topDoctor.soCaKham || 0} ca (${formatCurrency(stats.topDoctor.tongDoanhThu || 0)})` : ''}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#f3e8ff', background: '#faf5ff' }}>
            <Statistic
              title={<Text strong style={{ color: '#7e22ce' }}>Đội Ngũ Bác Sĩ Hoạt Động</Text>}
              value={stats.totalDoctors}
              styles={{ content: { color: '#9333ea', fontWeight: 700, fontSize: 24 } }}
              prefix={<UserOutlined />}
              suffix="bác sĩ"
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table with Search Filter */}
      <Card
        title={
          <Flex justify="space-between" align="center" wrap="wrap" gap="small">
            <span style={{ fontWeight: 600, fontSize: 16 }}>
              <TrophyOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
              Bảng Xếp Hạng & Đánh Giá Năng Suất
            </span>
            <Input
              placeholder="Tìm theo tên bác sĩ, chuyên khoa, phòng..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />
          </Flex>
        }
      >
        <Table
          dataSource={filteredList}
          columns={columns}
          rowKey="maBacSi"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: 'Chưa có dữ liệu thống kê năng suất bác sĩ.' }}
        />
      </Card>
    </div>
  );
};

export default DoctorProductivityPage;
