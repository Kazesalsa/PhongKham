import React, { useEffect, useState, useMemo } from 'react';
import { Card, Table, DatePicker, Button, Flex, Space, Typography, Row, Col, Statistic, Tag } from 'antd';
import {
  SearchOutlined,
  DollarCircleOutlined,
  AuditOutlined,
  MedicineBoxOutlined,
  UsergroupAddOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useAdminStore } from '../../stores/useAdminStore';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const RevenueAnalyticsPage = () => {
  const { dateRangeRevenue, fetchDateRangeRevenue, isLoading } = useAdminStore();
  const [dates, setDates] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const loadData = (range) => {
    if (!range || range.length < 2) return;
    const [from, to] = range;
    fetchDateRangeRevenue(from.format('YYYY-MM-DD'), to.format('YYYY-MM-DD'));
  };

  useEffect(() => {
    loadData(dates);
  }, []);

  // Compute summary metrics across the selected date range
  const summary = useMemo(() => {
    return dateRangeRevenue.reduce(
      (acc, curr) => {
        acc.totalRevenue += Number(curr.thucThu || curr.tongTienThu || curr.tongDoanhThu || 0);
        acc.totalVisits += Number(curr.soHoaDon || curr.soLuotKham || 0);
        acc.totalService += Number(curr.doanhThuDichVu || 0);
        acc.totalDrug += Number(curr.doanhThuThuoc || 0);
        acc.totalDiscount += Number(curr.tongGiamGia || 0);
        return acc;
      },
      { totalRevenue: 0, totalVisits: 0, totalService: 0, totalDrug: 0, totalDiscount: 0 }
    );
  }, [dateRangeRevenue]);

  const getPaymentMethodTag = (method) => {
    if (!method) return <Tag>Chưa rõ</Tag>;
    const lower = method.toLowerCase();
    if (lower.includes('chuyển khoản') || lower.includes('transfer') || lower.includes('qr')) {
      return <Tag color="blue">Chuyển Khoản</Tag>;
    }
    if (lower.includes('thẻ') || lower.includes('card')) {
      return <Tag color="purple">Thẻ POS</Tag>;
    }
    return <Tag color="green">Tiền Mặt</Tag>;
  };

  const columns = [
    {
      title: 'Ngày Giao Dịch',
      dataIndex: 'ngayGiaoDich',
      key: 'ngayGiaoDich',
      width: 130,
      render: (v, r) => <strong>{formatDate(v || r.ngayKham)}</strong>,
    },
    {
      title: 'Phương Thức',
      dataIndex: 'hinhThucThanhToan',
      key: 'hinhThucThanhToan',
      width: 140,
      align: 'center',
      render: (v) => getPaymentMethodTag(v),
    },
    {
      title: 'Số Hóa Đơn',
      dataIndex: 'soHoaDon',
      key: 'soHoaDon',
      align: 'center',
      width: 110,
      render: (v, r) => (
        <Tag color="cyan">
          <strong>{v || r.soLuotKham || 0}</strong> HĐ
        </Tag>
      ),
    },
    {
      title: 'Doanh Thu Dịch Vụ',
      dataIndex: 'doanhThuDichVu',
      key: 'doanhThuDichVu',
      align: 'right',
      width: 150,
      render: (v) => <span>{formatCurrency(v || 0)}</span>,
    },
    {
      title: 'Doanh Thu Thuốc',
      dataIndex: 'doanhThuThuoc',
      key: 'doanhThuThuoc',
      align: 'right',
      width: 150,
      render: (v) => <span>{formatCurrency(v || 0)}</span>,
    },
    {
      title: 'Giảm Trừ',
      dataIndex: 'tongGiamGia',
      key: 'tongGiamGia',
      align: 'right',
      width: 130,
      render: (v) => (
        <span style={{ color: Number(v) > 0 ? '#ef4444' : '#64748b' }}>
          {Number(v) > 0 ? `-${formatCurrency(v)}` : '0 ₫'}
        </span>
      ),
    },
    {
      title: 'Thực Thu',
      dataIndex: 'thucThu',
      key: 'thucThu',
      align: 'right',
      width: 170,
      render: (v, r) => (
        <strong style={{ color: '#0d9488', fontSize: 15 }}>
          {formatCurrency(v || r.tongTienThu || r.tongDoanhThu || 0)}
        </strong>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Phân Tích & Thống Kê Doanh Thu Khoảng Ngày"
        subtitle="Tra cứu tổng hợp giao dịch viện phí và doanh số theo giai đoạn (Stored Procedure: sp_thong_ke_doanh_thu_khoang_ngay)"
      />

      {/* Date Range Selection Bar */}
      <Card style={{ marginBottom: 20 }}>
        <Flex gap="middle" align="center" wrap="wrap">
          <Text strong style={{ fontSize: 14 }}>Chọn Khoảng Ngày:</Text>
          <RangePicker
            size="large"
            value={dates}
            onChange={(val) => setDates(val)}
            format="DD/MM/YYYY"
            allowClear={false}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="large"
            style={{ backgroundColor: '#0d9488' }}
            onClick={() => loadData(dates)}
            loading={isLoading}
          >
            Tra Cứu Báo Cáo
          </Button>
          <Space>
            <Button
              size="middle"
              onClick={() => {
                const r = [dayjs().startOf('month'), dayjs()];
                setDates(r);
                loadData(r);
              }}
            >
              Tháng Này
            </Button>
            <Button
              size="middle"
              onClick={() => {
                const r = [dayjs().subtract(7, 'day'), dayjs()];
                setDates(r);
                loadData(r);
              }}
            >
              7 Ngày Qua
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* 4 KPI Summary Cards for Filtered Range */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#ccfbf1', background: '#f0fdfa' }}>
            <Statistic
              title={<Text strong style={{ color: '#0f766e' }}>Tổng Doanh Thu Thực Thu</Text>}
              value={summary.totalRevenue}
              styles={{ content: { color: '#0d9488', fontWeight: 700, fontSize: 24 } }}
              prefix={<DollarCircleOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#e0f2fe', background: '#f0f9ff' }}>
            <Statistic
              title={<Text strong style={{ color: '#0369a1' }}>Tổng Số Hóa Đơn Phát Sinh</Text>}
              value={summary.totalVisits}
              styles={{ content: { color: '#0284c7', fontWeight: 700, fontSize: 24 } }}
              prefix={<UsergroupAddOutlined />}
              suffix="hóa đơn"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#fef3c7', background: '#fffbeb' }}>
            <Statistic
              title={<Text strong style={{ color: '#b45309' }}>Tổng Thu Dịch Vụ Khám</Text>}
              value={summary.totalService}
              styles={{ content: { color: '#d97706', fontWeight: 700, fontSize: 24 } }}
              prefix={<AuditOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered hoverable style={{ borderColor: '#f3e8ff', background: '#faf5ff' }}>
            <Statistic
              title={<Text strong style={{ color: '#7e22ce' }}>Tổng Doanh Thu Kê Đơn Thuốc</Text>}
              value={summary.totalDrug}
              styles={{ content: { color: '#9333ea', fontWeight: 700, fontSize: 24 } }}
              prefix={<MedicineBoxOutlined />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title={
          <Flex justify="space-between" align="center" wrap="wrap" gap="small">
            <span style={{ fontWeight: 600, fontSize: 16 }}>
              <CreditCardOutlined style={{ marginRight: 8, color: '#0d9488' }} />
              Bảng Kê Chi Tiết Giao Dịch Trong Kỳ
            </span>
            <Space size="large">
              <Text type="secondary">
                Ghi nhận: <strong>{dateRangeRevenue.length}</strong> dòng dữ liệu
              </Text>
            </Space>
          </Flex>
        }
      >
        <Table
          dataSource={dateRangeRevenue}
          columns={columns}
          rowKey={(r, idx) => `${r.ngayGiaoDich || r.ngayKham || 'row'}_${r.hinhThucThanhToan || idx}`}
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          locale={{ emptyText: 'Không tìm thấy dữ liệu phát sinh trong khoảng thời gian đã chọn.' }}
        />
      </Card>
    </div>
  );
};

export default RevenueAnalyticsPage;
