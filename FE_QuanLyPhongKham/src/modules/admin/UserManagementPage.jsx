import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Radio,
  Tooltip,
  Alert,
} from 'antd';
import {
  UserAddOutlined,
  ReloadOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  SearchOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  ExperimentOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAdminStore } from '../../stores/useAdminStore';
import PageHeader from '../../components/PageHeader';
import { formatDate } from '../../utils/formatDate';
import { useDebounce } from '../../hooks/useDebounce';

const { Option } = Select;

const SPECIALTY_OPTIONS = [
  'Nội tổng quát',
  'Ngoại tổng quát',
  'Nhi khoa',
  'Tai Mũi Họng',
  'Răng Hàm Mặt',
  'Mắt (Nhãn khoa)',
  'Tim mạch',
  'Da liễu',
  'Cơ Xương Khớp',
  'Phụ sản',
];

const CLINIC_ROOMS = [
  'P.101 (Khám Nội 1)',
  'P.102 (Khám Nội 2)',
  'P.103 (Khám Nhi)',
  'P.201 (Khám Tai Mũi Họng)',
  'P.202 (Khám Răng Hàm Mặt)',
  'P.203 (Khám Mắt)',
  'P.204 (Khám Da liễu)',
  'P.205 (Khám Tim mạch)',
];

const UserManagementPage = () => {
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [resetPassForm] = Form.useForm();

  const {
    userList,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,
    isLoading,
    isSubmitting,
  } = useAdminStore();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resetPassModalVisible, setResetPassModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearch = useDebounce(searchKeyword, 350);

  // Watch selected role in create form for conditional doctor fields
  const selectedCreateRole = Form.useWatch('vaiTro', createForm);
  const selectedEditRole = Form.useWatch('vaiTro', editForm);

  useEffect(() => {
    fetchUsers(roleFilter, debouncedSearch);
  }, [roleFilter, debouncedSearch, fetchUsers]);

  // Open Create Modal
  const handleOpenCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      vaiTro: 'BAC_SI',
      matKhau: '123456',
      chuyenKhoa: 'Nội tổng quát',
      phongKham: 'P.101',
    });
    setCreateModalVisible(true);
  };

  // Submit Create
  const handleConfirmCreate = async (values) => {
    try {
      const payload = {
        tenDangNhap: values.tenDangNhap.trim(),
        matKhau: values.matKhau.trim(),
        hoTen: values.hoTen.trim(),
        soDienThoai: values.soDienThoai ? values.soDienThoai.trim() : '',
        vaiTro: values.vaiTro,
        chuyenKhoa: values.vaiTro === 'BAC_SI' ? values.chuyenKhoa : null,
        phongKham: values.vaiTro === 'BAC_SI' ? values.phongKham : null,
        soChungChi: values.vaiTro === 'BAC_SI' && values.soChungChi ? values.soChungChi.trim() : null,
      };
      await createUser(payload);
      setCreateModalVisible(false);
    } catch {
      // Handled in store
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (record) => {
    setSelectedUser(record);
    editForm.setFieldsValue({
      maNguoiDung: record.maNguoiDung,
      tenDangNhap: record.tenDangNhap,
      hoTen: record.hoTen,
      soDienThoai: record.soDienThoai,
      vaiTro: record.vaiTro,
      chuyenKhoa: record.chuyenKhoa || 'Nội tổng quát',
      phongKham: record.phongKham || 'P.101',
      soChungChi: record.soChungChi || '',
    });
    setEditModalVisible(true);
  };

  // Submit Edit
  const handleConfirmEdit = async (values) => {
    try {
      const payload = {
        maNguoiDung: selectedUser.maNguoiDung,
        hoTen: values.hoTen.trim(),
        soDienThoai: values.soDienThoai ? values.soDienThoai.trim() : '',
        vaiTro: selectedUser.vaiTro,
        chuyenKhoa: values.chuyenKhoa,
        phongKham: values.phongKham,
        soChungChi: values.soChungChi,
      };
      await updateUser(payload);
      setEditModalVisible(false);
      setSelectedUser(null);
    } catch {
      // Handled in store
    }
  };

  // Open Reset Password Modal
  const handleOpenResetPass = (record) => {
    setSelectedUser(record);
    resetPassForm.setFieldsValue({
      maNguoiDung: record.maNguoiDung,
      tenDangNhap: record.tenDangNhap,
      matKhauMoi: '123456',
    });
    setResetPassModalVisible(true);
  };

  // Submit Reset Password
  const handleConfirmResetPass = async (values) => {
    try {
      await resetUserPassword(selectedUser.maNguoiDung, values.matKhauMoi);
      setResetPassModalVisible(false);
      setSelectedUser(null);
    } catch {
      // Handled in store
    }
  };

  // Compute statistics
  const totalStaff = userList.length;
  const doctorCount = userList.filter((u) => u.vaiTro === 'BAC_SI').length;
  const receptionistCount = userList.filter((u) => u.vaiTro === 'LE_TAN').length;
  const pharmacistCount = userList.filter((u) => u.vaiTro === 'DUOC_SI').length;

  const renderRoleTag = (role) => {
    switch (role) {
      case 'BAC_SI':
        return (
          <Tag color="blue" icon={<MedicineBoxOutlined />} style={{ fontWeight: 600, padding: '2px 8px' }}>
            Bác Sĩ
          </Tag>
        );
      case 'LE_TAN':
        return (
          <Tag color="green" icon={<UserOutlined />} style={{ fontWeight: 600, padding: '2px 8px' }}>
            Lễ Tân
          </Tag>
        );
      case 'DUOC_SI':
        return (
          <Tag color="purple" icon={<ExperimentOutlined />} style={{ fontWeight: 600, padding: '2px 8px' }}>
            Dược Sĩ
          </Tag>
        );
      case 'QUAN_TRI':
        return (
          <Tag color="red" icon={<CrownOutlined />} style={{ fontWeight: 600, padding: '2px 8px' }}>
            Quản Trị Viên
          </Tag>
        );
      default:
        return <Tag>{role}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'maNguoiDung',
      key: 'maNguoiDung',
      width: 100,
      render: (code) => <Tag color="blue" style={{ fontWeight: 700 }}>{code}</Tag>,
    },
    {
      title: 'Họ & Tên Nhân Viên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      render: (name, record) => (
        <div>
          <strong style={{ color: '#0f172a', fontSize: 14 }}>{name}</strong>
          <div style={{ color: '#64748b', fontSize: 12 }}>@{record.tenDangNhap}</div>
        </div>
      ),
    },
    {
      title: 'Vai Trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      width: 140,
      render: (role) => renderRoleTag(role),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'soDienThoai',
      key: 'soDienThoai',
      width: 130,
      render: (phone) => phone || <span style={{ color: '#94a3b8' }}>Chưa có</span>,
    },
    {
      title: 'Chuyên Môn & Phòng Khám (Bác Sĩ)',
      key: 'docInfo',
      render: (_, record) => {
        if (record.vaiTro === 'BAC_SI') {
          return (
            <Space orientation="vertical" size={2}>
              <div>
                <Tag color="cyan" style={{ fontWeight: 600 }}>{record.chuyenKhoa || 'Đa khoa'}</Tag>
                <Tag color="geekblue">{record.phongKham || 'P.101'}</Tag>
              </div>
              {record.soChungChi && (
                <span style={{ fontSize: 11, color: '#64748b' }}>CCHN: {record.soChungChi}</span>
              )}
            </Space>
          );
        }
        return <span style={{ color: '#cbd5e1' }}>—</span>;
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'hoatDong',
      key: 'hoatDong',
      width: 130,
      align: 'center',
      render: (active) => (
        <Tag color={active ? 'success' : 'error'} style={{ borderRadius: 12, padding: '2px 8px' }}>
          {active ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>

          <Tooltip title="Đặt lại mật khẩu">
            <Button
              size="small"
              icon={<KeyOutlined />}
              style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}
              onClick={() => handleOpenResetPass(record)}
            />
          </Tooltip>

          {record.maNguoiDung !== 'ND001' && (
            <Popconfirm
              title={record.hoatDong ? 'Khóa tài khoản nhân viên này?' : 'Kích hoạt lại tài khoản?'}
              description={
                record.hoatDong
                  ? 'Nhân viên sẽ tạm thời không thể đăng nhập vào hệ thống.'
                  : 'Nhân viên sẽ được phép đăng nhập trở lại.'
              }
              onConfirm={() => toggleUserStatus(record.maNguoiDung, !record.hoatDong)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Tooltip title={record.hoatDong ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}>
                <Button
                  size="small"
                  danger={record.hoatDong}
                  type={record.hoatDong ? 'default' : 'primary'}
                  icon={record.hoatDong ? <LockOutlined /> : <UnlockOutlined />}
                  style={!record.hoatDong ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản Lý Nhân Sự & Đội Ngũ Bác Sĩ"
        subtitle="Khai báo nhân viên, bác sĩ chuyên khoa, phân quyền tài khoản và cấu hình phòng khám làm việc (Bảng nguoi_dung & bac_si)"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              size="large"
              style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
              onClick={handleOpenCreate}
            >
              + Thêm Nhân Viên Mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchUsers(roleFilter, debouncedSearch)}
              loading={isLoading}
              size="large"
            >
              Làm Mới
            </Button>
          </Space>
        }
      />

      {/* 4 KPI Statistic Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            style={{ borderRadius: 12, borderLeft: '4px solid #3b82f6', backgroundColor: '#fff' }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Tổng Nhân Sự</span>}
              value={totalStaff}
              prefix={<TeamOutlined style={{ color: '#3b82f6', marginRight: 6 }} />}
              valueStyle={{ color: '#1e3a8a', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            hoverable
            style={{ borderRadius: 12, borderLeft: '4px solid #0284c7', backgroundColor: '#fff' }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Bác Sĩ Điều Trị</span>}
              value={doctorCount}
              prefix={<MedicineBoxOutlined style={{ color: '#0284c7', marginRight: 6 }} />}
              valueStyle={{ color: '#0369a1', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            hoverable
            style={{ borderRadius: 12, borderLeft: '4px solid #10b981', backgroundColor: '#fff' }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Lễ Tân / Thu Ngân</span>}
              value={receptionistCount}
              prefix={<UserOutlined style={{ color: '#10b981', marginRight: 6 }} />}
              valueStyle={{ color: '#047857', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            hoverable
            style={{ borderRadius: 12, borderLeft: '4px solid #8b5cf6', backgroundColor: '#fff' }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Dược Sĩ Kho Dược</span>}
              value={pharmacistCount}
              prefix={<ExperimentOutlined style={{ color: '#8b5cf6', marginRight: 6 }} />}
              valueStyle={{ color: '#6d28d9', fontWeight: 800 }}
            />
          </Card>
        </Col>
      </Row>

      <Alert
        title="Bảo Mật Cơ Sở Dữ Liệu SQL Server (Role-Based Access Control)"
        description="Khi thêm mới Bác sĩ hoặc nhân viên, hệ thống tự động chạy Database Transaction cập nhật đồng thời bảng nguoi_dung và bac_si, đồng thời băm mật khẩu bằng thuật toán BCrypt an toàn. Chỉ tài khoản Quản trị viên (vai_tro_quan_tri) mới có quyền can thiệp vào bảng nhân sự."
        type="info"
        showIcon
        style={{ marginBottom: 20, borderRadius: 8 }}
      />

      <Card style={{ borderRadius: 12 }}>
        {/* Toolbar: Filter & Search */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle" justify="space-between">
          <Col xs={24} md={14}>
            <Space wrap>
              <span style={{ fontWeight: 600 }}>Lọc vai trò:</span>
              <Radio.Group
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="ALL">Tất cả ({totalStaff})</Radio.Button>
                <Radio.Button value="BAC_SI">Bác Sĩ ({doctorCount})</Radio.Button>
                <Radio.Button value="LE_TAN">Lễ Tân ({receptionistCount})</Radio.Button>
                <Radio.Button value="DUOC_SI">Dược Sĩ ({pharmacistCount})</Radio.Button>
                <Radio.Button value="QUAN_TRI">Quản Trị</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>

          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm theo họ tên, username, số điện thoại, chuyên khoa..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              size="middle"
            />
          </Col>
        </Row>

        <Table
          dataSource={userList}
          columns={columns}
          rowKey="maNguoiDung"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng cộng ${t} nhân sự` }}
          locale={{ emptyText: 'Không tìm thấy nhân viên phù hợp.' }}
        />
      </Card>

      {/* Modal 1: Create Staff / Doctor */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined style={{ color: '#2563eb', fontSize: 20 }} />
            <span>Khai Báo Nhân Viên / Bác Sĩ Mới</span>
          </div>
        }
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
        width={560}
      >
        <Form form={createForm} layout="vertical" onFinish={handleConfirmCreate}>
          <Form.Item
            label="Vai Trò Nhân Viên"
            name="vaiTro"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select size="large">
              <Option value="BAC_SI">Bác Sĩ Điều Trị</Option>
              <Option value="LE_TAN">Lễ Tân / Tiếp Nhận & Thu Ngân</Option>
              <Option value="DUOC_SI">Dược Sĩ Quản Lý Kho Dược</Option>
              <Option value="QUAN_TRI">Quản Trị Viên Hệ Thống</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên Đăng Nhập"
                name="tenDangNhap"
                rules={[
                  { required: true, message: 'Nhập tên đăng nhập!' },
                  { min: 3, message: 'Tối thiểu 3 ký tự!' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ chứa chữ cái, số và dấu gạch dưới!' },
                ]}
              >
                <Input placeholder="VD: bacsi_hoa, letan_nga" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mật Khẩu Khởi Tạo"
                name="matKhau"
                rules={[{ required: true, message: 'Nhập mật khẩu!' }]}
              >
                <Input.Password placeholder="Mặc định: 123456" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                label="Họ Và Tên Đầy Đủ"
                name="hoTen"
                rules={[{ required: true, message: 'Nhập họ tên nhân viên!' }]}
              >
                <Input placeholder="VD: BS. Nguyễn Văn Hùng" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                label="Số Điện Thoại"
                name="soDienThoai"
                rules={[
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại gồm 10 chữ số!' },
                ]}
              >
                <Input placeholder="VD: 0912345678" />
              </Form.Item>
            </Col>
          </Row>

          {/* Conditional Doctor Specialty Fields */}
          {selectedCreateRole === 'BAC_SI' && (
            <Card
              size="small"
              title={<span style={{ color: '#0284c7', fontSize: 13 }}>Thông Tin Chuyên Khoa Bác Sĩ (Bảng bac_si)</span>}
              style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd', marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Chuyên Khoa"
                    name="chuyenKhoa"
                    rules={[{ required: true, message: 'Chọn chuyên khoa!' }]}
                  >
                    <Select placeholder="Chọn chuyên khoa">
                      {SPECIALTY_OPTIONS.map((spec) => (
                        <Option key={spec} value={spec}>{spec}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Phòng Khám Phụ Trách"
                    name="phongKham"
                    rules={[{ required: true, message: 'Chọn phòng khám!' }]}
                  >
                    <Select placeholder="Chọn phòng khám">
                      {CLINIC_ROOMS.map((room) => (
                        <Option key={room.split(' ')[0]} value={room.split(' ')[0]}>{room}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Số Chứng Chỉ Hành Nghề (CCHN)"
                name="soChungChi"
                extra="Nếu để trống, hệ thống sẽ tự sinh mã CCHN theo mã bác sĩ."
              >
                <Input placeholder="VD: CCHN-002, 012345/BYT-CCHN" />
              </Form.Item>
            </Card>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
            >
              Xác Nhận Tạo Nhân Viên
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal 2: Edit Staff / Doctor */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#0284c7', fontSize: 20 }} />
            <span>Chỉnh Sửa Thông Tin Nhân Viên</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
        }}
        footer={null}
        destroyOnClose
        centered
        width={540}
      >
        <Form form={editForm} layout="vertical" onFinish={handleConfirmEdit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mã Nhân Viên" name="maNguoiDung">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tên Đăng Nhập" name="tenDangNhap">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                label="Họ Và Tên"
                name="hoTen"
                rules={[{ required: true, message: 'Nhập họ tên!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="Số Điện Thoại" name="soDienThoai">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {selectedUser?.vaiTro === 'BAC_SI' && (
            <Card
              size="small"
              title={<span style={{ color: '#0284c7', fontSize: 13 }}>Thông Tin Chuyên Khoa Bác Sĩ</span>}
              style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd', marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Chuyên Khoa" name="chuyenKhoa">
                    <Select>
                      {SPECIALTY_OPTIONS.map((spec) => (
                        <Option key={spec} value={spec}>{spec}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Phòng Khám" name="phongKham">
                    <Select>
                      {CLINIC_ROOMS.map((room) => (
                        <Option key={room.split(' ')[0]} value={room.split(' ')[0]}>{room}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Số CCHN" name="soChungChi">
                <Input placeholder="VD: CCHN-001" />
              </Form.Item>
            </Card>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Lưu Thay Đổi
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal 3: Reset Password */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyOutlined style={{ color: '#8b5cf6', fontSize: 20 }} />
            <span>Đặt Lại Mật Khẩu Cho Nhân Viên</span>
          </div>
        }
        open={resetPassModalVisible}
        onCancel={() => {
          setResetPassModalVisible(false);
          setSelectedUser(null);
        }}
        footer={null}
        destroyOnClose
        centered
        width={420}
      >
        <Form form={resetPassForm} layout="vertical" onFinish={handleConfirmResetPass}>
          <Form.Item label="Tài Khoản Nhân Viên" name="tenDangNhap">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Mật Khẩu Mới"
            name="matKhauMoi"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới (Mặc định: 123456)" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setResetPassModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              Xác Nhận Đổi Mật Khẩu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
