import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Descriptions,
  Table,
  Drawer,
  Modal,
  Tag,
  Space,
  Empty,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  Alert,
} from 'antd';
import {
  HistoryOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  SearchOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useDoctorStore } from '../../stores/useDoctorStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ROUTE_PATHS } from '../../constants/routePaths';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { useDebounce } from '../../hooks/useDebounce';
import { showError } from '../../utils/notificationUtil';

const ExaminationPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [prescForm] = Form.useForm();
  const { user } = useAuthStore();
  const {
    activePatient,
    patientHistory,
    availableDrugsPage,
    prescriptions,
    serviceOrders,
    availableServices,
    fetchAvailableDrugs,
    fetchAvailableServices,
    fetchPatientHistory,
    addPrescription,
    removePrescription,
    addServiceOrder,
    removeServiceOrder,
    completeExamination,
    resetConsultation,
    isSubmitting,
  } = useDoctorStore();

  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [drugModalVisible, setDrugModalVisible] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [drugSearch, setDrugSearch] = useState('');
  const debouncedDrugSearch = useDebounce(drugSearch, 350);

  // Fetch patient medical history on load
  React.useEffect(() => {
    if (activePatient?.maBenhNhan) {
      fetchPatientHistory(activePatient.maBenhNhan);
    }
  }, [activePatient, fetchPatientHistory]);

  // Fetch available clinical services on mount
  React.useEffect(() => {
    fetchAvailableServices();
  }, [fetchAvailableServices]);

  // Trigger drug search when modal opens or debounced keyword changes
  React.useEffect(() => {
    if (drugModalVisible) {
      fetchAvailableDrugs(debouncedDrugSearch, 1, 10);
    }
  }, [drugModalVisible, debouncedDrugSearch, fetchAvailableDrugs]);

  if (!activePatient) {
    return (
      <div>
        <PageHeader title="Phòng Khám Bệnh" subtitle="Không gian hội chẩn và kê đơn" />
        <Card style={{ textAlign: 'center', padding: '60px 0' }}>
          <Empty
            description="Chưa có bệnh nhân nào được chọn vào khám!"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              style={{ backgroundColor: '#0d9488' }}
              onClick={() => navigate(ROUTE_PATHS.DOCTOR.QUEUE)}
            >
              Xem Danh Sách Chờ Khám
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  // Handle Complete Consultation
  const handleComplete = async (values) => {
    try {
      const payload = {
        maLichHen: activePatient.maLichHen,
        maBenhNhan: activePatient.maBenhNhan,
        maBacSi: user?.userId || 'BS001',
        trieuChung: values.trieuChung || '',
        chanDoan: values.chanDoan,
        loiDan: values.loiDan || '',
        ngayHenTaiKham:
          hasFollowUp && values.ngayHenTaiKham
            ? values.ngayHenTaiKham.format('YYYY-MM-DD')
            : null,
        ghiChuTaiKham: hasFollowUp ? values.ghiChuTaiKham || '' : null,
        danhSachThuoc: prescriptions.map((p) => ({
          maThuoc: p.maThuoc,
          soLuong: p.soLuong,
          cachDung: p.cachDung,
          huongDan: p.huongDan,
        })),
        danhSachDichVu: serviceOrders.map((s) => ({
          maDichVu: s.maDichVu,
          soLuong: s.soLuong,
          donGia: s.donGia,
        })),
      };

      await completeExamination(payload);
      navigate(ROUTE_PATHS.DOCTOR.QUEUE);
    } catch {
      // Handled
    }
  };

  const handleSelectDrug = (record) => {
    setSelectedDrug(record);
    prescForm.setFieldsValue({
      drug: record,
      soLuong: 1,
      cachDung: 'Uống 1 viên sau ăn, ngày 2 lần',
    });
  };

  const handleAddDrug = (values) => {
    const drug = selectedDrug || values.drug;
    if (!drug) {
      showError('Vui lòng bấm chọn một loại thuốc trong bảng trước!');
      return;
    }
    addPrescription({
      maThuoc: drug.maThuoc,
      tenThuoc: drug.tenThuoc,
      donViTinh: drug.donViTinh,
      donGia: drug.donGia,
      soLuong: values.soLuong || 1,
      cachDung: values.cachDung || 'Uống 1 viên sau ăn, ngày 2 lần',
      huongDan: values.huongDan || '',
    });
    setSelectedDrug(null);
    prescForm.resetFields();
    setDrugModalVisible(false);
  };

  const handleAddService = (values) => {
    let serviceItem = (availableServices || []).find((s) => s.maDichVu === values.maDichVu);
    if (!serviceItem) {
      const fallbackMap = {
        DV001: { maDichVu: 'DV001', tenDichVu: 'Khám nội tổng quát', donGia: 150000 },
        DV002: { maDichVu: 'DV002', tenDichVu: 'Xét nghiệm máu toàn phần', donGia: 200000 },
        DV003: { maDichVu: 'DV003', tenDichVu: 'Chụp X-quang lồng ngực', donGia: 250000 },
      };
      serviceItem = fallbackMap[values.maDichVu];
    }
    if (serviceItem) {
      addServiceOrder({
        maDichVu: serviceItem.maDichVu,
        tenDichVu: serviceItem.tenDichVu,
        donGia: serviceItem.donGia,
        soLuong: values.soLuong || 1,
      });
    }
    setServiceModalVisible(false);
  };

  const drugColumns = [
    { title: 'Tên Thuốc', dataIndex: 'tenThuoc', key: 'tenThuoc' },
    { title: 'ĐVT', dataIndex: 'donViTinh', key: 'donViTinh', width: 70 },
    { title: 'Số Lượng', dataIndex: 'soLuong', key: 'soLuong', width: 90, align: 'center' },
    { title: 'Cách Dùng', dataIndex: 'cachDung', key: 'cachDung' },
    { title: 'Đơn Giá', dataIndex: 'donGia', key: 'donGia', width: 120, render: (v) => formatCurrency(v) },
    {
      title: 'Thành Tiền',
      key: 'total',
      width: 120,
      render: (_, r) => <strong>{formatCurrency(r.donGia * r.soLuong)}</strong>,
    },
    {
      title: '',
      key: 'del',
      width: 50,
      render: (_, __, idx) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removePrescription(idx)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Khám Bệnh: ${activePatient.tenBenhNhan}`}
        subtitle={`Số thứ tự: #${activePatient.soThuTu} | Mã lịch hẹn: ${activePatient.maLichHen}`}
        extra={
          <Space>
            <Button
              icon={<HistoryOutlined />}
              onClick={() => setHistoryDrawerVisible(true)}
            >
              Tiền Sử Bệnh Án
            </Button>
            <Button danger onClick={() => resetConsultation()}>
              Đổi Bệnh Nhân
            </Button>
          </Space>
        }
      />

      <Card style={{ marginBottom: 20 }}>
        <Descriptions title="Thông tin Bệnh nhân" size="small" bordered column={{ xs: 1, sm: 2, md: 4 }}>
          <Descriptions.Item label="Mã BN">
            <strong>{activePatient.maBenhNhan}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Họ Tên">{activePatient.tenBenhNhan}</Descriptions.Item>
          <Descriptions.Item label="SĐT">{activePatient.soDienThoai}</Descriptions.Item>
          <Descriptions.Item label="Phòng Khám">{activePatient.phongKham}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleComplete}>
        <Row gutter={20}>
          <Col xs={24} lg={12}>
            <Card title="Hồ Sơ Chẩn Đoán Y Khoa" style={{ marginBottom: 20 }}>
              <Form.Item
                name="trieuChung"
                label="Triệu chứng lâm sàng"
                initialValue="Bệnh nhân sốt, mệt mỏi, đau đầu nhẹ"
              >
                <Input.TextArea rows={3} placeholder="Mô tả triệu chứng..." />
              </Form.Item>

              <Form.Item
                name="chanDoan"
                label="Chẩn đoán xác định"
                rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán bệnh!' }]}
                initialValue="Nhiễm siêu vi đường hô hấp trên"
              >
                <Input.TextArea rows={3} placeholder="Kết luận chẩn đoán..." />
              </Form.Item>

              <Form.Item name="loiDan" label="Lời dặn bác sĩ / Chế độ ăn uống">
                <Input.TextArea rows={2} placeholder="Nghỉ ngơi, uống nhiều nước..." />
              </Form.Item>
            </Card>

            {/* CARD: CHỈ ĐỊNH LỊCH TÁI KHÁM */}
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#0d9488' }} />
                  <span>Chỉ Định Tái Khám</span>
                </Space>
              }
              extra={
                <Switch
                  checked={hasFollowUp}
                  onChange={(checked) => {
                    setHasFollowUp(checked);
                    if (checked && !form.getFieldValue('ngayHenTaiKham')) {
                      form.setFieldsValue({
                        ngayHenTaiKham: dayjs().add(7, 'day'),
                        ghiChuTaiKham: 'Tái khám sau 7 ngày kiểm tra lại',
                      });
                    }
                  }}
                  checkedChildren="Có hẹn"
                  unCheckedChildren="Không"
                />
              }
              style={{ marginBottom: 20 }}
            >
              {hasFollowUp ? (
                <div>
                  <Form.Item label="Chọn nhanh mốc tái khám" style={{ marginBottom: 12 }}>
                    <Space wrap>
                      <Button
                        size="small"
                        onClick={() => form.setFieldsValue({ ngayHenTaiKham: dayjs().add(3, 'day') })}
                      >
                        +3 ngày
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => form.setFieldsValue({ ngayHenTaiKham: dayjs().add(7, 'day') })}
                      >
                        +7 ngày (1 tuần)
                      </Button>
                      <Button
                        size="small"
                        onClick={() => form.setFieldsValue({ ngayHenTaiKham: dayjs().add(14, 'day') })}
                      >
                        +14 ngày (2 tuần)
                      </Button>
                      <Button
                        size="small"
                        onClick={() => form.setFieldsValue({ ngayHenTaiKham: dayjs().add(30, 'day') })}
                      >
                        +30 ngày (1 tháng)
                      </Button>
                    </Space>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="ngayHenTaiKham"
                        label="Ngày hẹn tái khám"
                        rules={[{ required: hasFollowUp, message: 'Vui lòng chọn ngày tái khám!' }]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          placeholder="Chọn ngày tái khám"
                          disabledDate={(curr) => curr && curr <= dayjs().endOf('day')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="ghiChuTaiKham" label="Ghi chú / Mục tiêu tái khám">
                        <Input placeholder="Lý do hoặc chỉ định cận lâm sàng..." />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>
                  Bật công tắc nếu bệnh nhân cần tái khám theo dõi hoặc làm xét nghiệm kiểm tra lại.
                </div>
              )}
            </Card>

            <Card
              title="Chỉ Định Cận Lâm Sàng"
              extra={
                <Button
                  size="small"
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => setServiceModalVisible(true)}
                >
                  Thêm Dịch Vụ
                </Button>
              }
            >
              <Table
                dataSource={serviceOrders}
                rowKey="maDichVu"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Tên Dịch Vụ', dataIndex: 'tenDichVu', key: 'tenDichVu' },
                  { title: 'Số Lượng', dataIndex: 'soLuong', key: 'soLuong', width: 80, align: 'center' },
                  { title: 'Đơn Giá', dataIndex: 'donGia', key: 'donGia', width: 120, render: (v) => formatCurrency(v) },
                  {
                    title: '',
                    key: 'del',
                    width: 50,
                    render: (_, __, i) => (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeServiceOrder(i)}
                      />
                    ),
                  },
                ]}
                locale={{ emptyText: 'Chưa có chỉ định cận lâm sàng nào.' }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Kê Đơn Thuốc Điều Trị"
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  style={{ backgroundColor: '#0d9488' }}
                  onClick={() => setDrugModalVisible(true)}
                >
                  Kê Thêm Thuốc
                </Button>
              }
              style={{ marginBottom: 20 }}
            >
              <Table
                dataSource={prescriptions}
                columns={drugColumns}
                rowKey="maThuoc"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Chưa có thuốc nào trong đơn.' }}
              />
            </Card>

            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              icon={<CheckCircleOutlined />}
              loading={isSubmitting}
              style={{
                backgroundColor: '#10b981',
                height: 52,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Hoàn Tất Khám & Lưu Hồ Sơ
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Drawer: Medical History */}
      <Drawer
        title={`Tiền Sử Bệnh Án - ${activePatient.tenBenhNhan}`}
        placement="right"
        size="large"
        open={historyDrawerVisible}
        onClose={() => setHistoryDrawerVisible(false)}
      >
        <Table
          dataSource={patientHistory}
          rowKey="maHoSo"
          pagination={false}
          size="small"
          columns={[
            { title: 'Ngày Khám', dataIndex: 'ngayKham', key: 'ngayKham', width: 130, render: (v) => formatDateTime(v) },
            { title: 'Bác Sĩ', dataIndex: 'tenBacSi', key: 'tenBacSi' },
            { title: 'Chẩn Đoán', dataIndex: 'chanDoan', key: 'chanDoan' },
            { title: 'Tổng Tiền', dataIndex: 'tongTien', key: 'tongTien', width: 110, render: (v) => formatCurrency(v) },
          ]}
          locale={{ emptyText: 'Bệnh nhân chưa có tiền sử khám bệnh trước đây.' }}
        />
      </Drawer>

      {/* Modal: Select Medicine */}
      <Modal
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#0d9488' }} />
            <span>Tra Cứu & Kê Đơn Thuốc Khả Dụng</span>
          </Space>
        }
        open={drugModalVisible}
        width={780}
        onCancel={() => {
          setDrugModalVisible(false);
          setSelectedDrug(null);
          prescForm.resetFields();
        }}
        footer={null}
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Tìm tên thuốc còn hạn & còn tồn kho..."
          value={drugSearch}
          onChange={(e) => setDrugSearch(e.target.value)}
          style={{ marginBottom: 16 }}
          size="middle"
          allowClear
        />

        <Table
          dataSource={availableDrugsPage.items}
          rowKey="maThuoc"
          size="small"
          pagination={{
            current: availableDrugsPage.page,
            pageSize: availableDrugsPage.size,
            total: availableDrugsPage.totalElements,
            onChange: (p, s) => fetchAvailableDrugs(drugSearch, p, s),
          }}
          onRow={(record) => ({
            onClick: () => handleSelectDrug(record),
            style: {
              cursor: 'pointer',
              backgroundColor: selectedDrug?.maThuoc === record.maThuoc ? '#f0fdf4' : undefined,
            },
          })}
          columns={[
            {
              title: 'Mã',
              dataIndex: 'maThuoc',
              key: 'maThuoc',
              width: 75,
              render: (code) => <Tag color="blue">{code}</Tag>,
            },
            {
              title: 'Tên Thuốc',
              dataIndex: 'tenThuoc',
              key: 'tenThuoc',
              render: (name, record) => (
                <Space>
                  <strong style={{ color: selectedDrug?.maThuoc === record.maThuoc ? '#0f766e' : '#1e293b' }}>
                    {name}
                  </strong>
                  {selectedDrug?.maThuoc === record.maThuoc && (
                    <Tag color="success" style={{ fontSize: 11, padding: '0 6px', fontWeight: 600 }}>
                      ✓ Đang chọn
                    </Tag>
                  )}
                </Space>
              ),
            },
            { title: 'ĐVT', dataIndex: 'donViTinh', key: 'donViTinh', width: 70 },
            {
              title: 'Tồn Kho',
              dataIndex: 'soLuongTon',
              key: 'soLuongTon',
              width: 90,
              render: (v) => <Tag color={v > 20 ? 'green' : 'orange'}>{v}</Tag>,
            },
            { title: 'Đơn Giá', dataIndex: 'donGia', key: 'donGia', width: 100, render: (v) => formatCurrency(v) },
            {
              title: 'Hành Động',
              key: 'act',
              width: 110,
              align: 'center',
              render: (_, record) => {
                const isSelected = selectedDrug?.maThuoc === record.maThuoc;
                return isSelected ? (
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                    style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 600 }}
                  >
                    Đã Chọn
                  </Button>
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    style={{ backgroundColor: '#0d9488' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDrug(record);
                    }}
                  >
                    Chọn
                  </Button>
                );
              },
            },
          ]}
        />

        {/* THÔNG TIN CHI TIẾT THUỐC ĐÃ CHỌN */}
        <Card
          size="small"
          style={{
            marginTop: 16,
            borderRadius: 8,
            borderColor: selectedDrug ? '#0d9488' : '#e2e8f0',
            backgroundColor: selectedDrug ? '#f0fdfa' : '#ffffff',
            transition: 'all 0.2s',
          }}
          title={
            <Space>
              <MedicineBoxOutlined style={{ color: selectedDrug ? '#0d9488' : '#64748b' }} />
              <span style={{ fontWeight: 600, color: selectedDrug ? '#0f766e' : '#334155' }}>
                {selectedDrug ? `Thuốc Đang Chọn: ${selectedDrug.tenThuoc}` : 'Chi Tiết Kê Đơn Thuốc'}
              </span>
              {selectedDrug && <Tag color="cyan">{selectedDrug.maThuoc}</Tag>}
            </Space>
          }
        >
          {selectedDrug ? (
            <div>
              {/* Highlight summary bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  padding: '8px 14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #ccfbf1',
                  borderRadius: 6,
                  marginBottom: 16,
                }}
              >
                <div>
                  <span style={{ color: '#64748b', fontSize: 13 }}>Đơn vị tính: </span>
                  <strong>{selectedDrug.donViTinh}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 13 }}>Tồn kho còn: </span>
                  <Tag color={selectedDrug.soLuongTon > 20 ? 'green' : 'orange'} style={{ fontWeight: 600 }}>
                    {selectedDrug.soLuongTon} {selectedDrug.donViTinh}
                  </Tag>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 13 }}>Đơn giá: </span>
                  <strong style={{ color: '#0d9488' }}>{formatCurrency(selectedDrug.donGia)}</strong>
                </div>
              </div>

              <Form form={prescForm} layout="vertical" onFinish={handleAddDrug}>
                <Form.Item name="drug" hidden>
                  <Input />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={8}>
                    <Form.Item
                      name="soLuong"
                      label="Số lượng kê"
                      rules={[
                        { required: true, message: 'Nhập số lượng!' },
                        {
                          type: 'number',
                          max: selectedDrug.soLuongTon,
                          message: `Tồn kho chỉ còn ${selectedDrug.soLuongTon}!`,
                        },
                      ]}
                      initialValue={1}
                    >
                      <InputNumber
                        min={1}
                        max={selectedDrug.soLuongTon || 100}
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      name="cachDung"
                      label="Liều dùng & Cách dùng"
                      rules={[{ required: true, message: 'Nhập cách dùng!' }]}
                      initialValue="Uống 1 viên sau ăn, ngày 2 lần"
                    >
                      <Input
                        size="large"
                        placeholder="Ví dụ: Ngày 2 lần, mỗi lần 1 viên sau ăn"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  icon={<PlusOutlined />}
                  style={{
                    backgroundColor: '#0d9488',
                    borderColor: '#0d9488',
                    fontWeight: 600,
                  }}
                >
                  Thêm "{selectedDrug.tenThuoc}" Vào Đơn Thuốc
                </Button>
              </Form>
            </div>
          ) : (
            <Alert
              type="info"
              showIcon
              message="Chưa chọn loại thuốc nào"
              description="Vui lòng bấm nút 'Chọn' (hoặc click trực tiếp vào một dòng thuốc ở bảng trên) để kê đơn số lượng và liều dùng."
            />
          )}
        </Card>
      </Modal>

      {/* Modal: Service Order */}
      <Modal
        title="Chỉ Định Dịch Vụ Kỹ Thuật"
        open={serviceModalVisible}
        onCancel={() => setServiceModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleAddService} initialValues={{ maDichVu: 'DV002', soLuong: 1 }}>
          <Form.Item name="maDichVu" label="Chọn Dịch Vụ Cận Lâm Sàng">
            <Select size="large">
              {availableServices && availableServices.length > 0 ? (
                availableServices.map((dv) => (
                  <Select.Option key={dv.maDichVu} value={dv.maDichVu}>
                    {dv.tenDichVu} - {Number(dv.donGia || 0).toLocaleString('vi-VN')} ₫
                  </Select.Option>
                ))
              ) : (
                <>
                  <Select.Option value="DV001">Khám nội tổng quát - 150.000 ₫</Select.Option>
                  <Select.Option value="DV002">Xét nghiệm máu toàn phần - 200.000 ₫</Select.Option>
                  <Select.Option value="DV003">Chụp X-quang lồng ngực - 250.000 ₫</Select.Option>
                </>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="soLuong" label="Số Lượng">
            <InputNumber min={1} style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" style={{ backgroundColor: '#0d9488' }}>
            Xác Nhận Chỉ Định
          </Button>
        </Form>
      </Modal>

      {/* Drawer: Tiền Sử Bệnh Án */}
      <Drawer
        title={
          <Space>
            <HistoryOutlined style={{ color: '#0d9488' }} />
            <span>Tiền Sử Bệnh Án: {activePatient?.tenBenhNhan}</span>
          </Space>
        }
        placement="right"
        width={560}
        open={historyDrawerVisible}
        onClose={() => setHistoryDrawerVisible(false)}
      >
        {patientHistory && patientHistory.length > 0 ? (
          <div>
            {patientHistory.map((h, idx) => (
              <Card
                key={h.maHoSo || idx}
                size="small"
                style={{
                  marginBottom: 16,
                  borderColor: '#cbd5e1',
                  borderRadius: 8,
                }}
                title={
                  <Space>
                    <Tag color="cyan">{h.maHoSo}</Tag>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      {formatDateTime(h.ngayKham)}
                    </span>
                  </Space>
                }
                extra={
                  <Tag color={h.trangThaiThanhToan === 'Đã thanh toán' ? 'green' : 'orange'}>
                    {h.trangThaiThanhToan || 'Đã khám'}
                  </Tag>
                }
              >
                <div style={{ marginBottom: 6 }}>
                  <strong>Bác sĩ khám:</strong> {h.tenBacSi || 'Chưa cập nhật'}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Triệu chứng:</strong> {h.trieuChung || 'Không ghi nhận'}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Chẩn đoán:</strong>{' '}
                  <span style={{ color: '#0f766e', fontWeight: 600 }}>{h.chanDoan}</span>
                </div>
                {h.tongTien && (
                  <div style={{ color: '#475569', fontSize: 12 }}>
                    Tổng chi phí: {formatCurrency(h.tongTien)}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            description="Chưa có tiền sử bệnh án nào được ghi nhận cho bệnh nhân này."
            style={{ marginTop: 60 }}
          />
        )}
      </Drawer>
    </div>
  );
};

export default ExaminationPage;
