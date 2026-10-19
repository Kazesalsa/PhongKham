import React, { useState, useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useReceptionistStore } from '../../stores/useReceptionistStore';
import PageHeader from '../../components/PageHeader';
import PendingCheckoutTable from './checkout/PendingCheckoutTable';
import CheckoutDetailDrawer from './checkout/CheckoutDetailDrawer';
import InvoiceReceiptModal from './checkout/InvoiceReceiptModal';

const CheckoutPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualForm] = Form.useForm();

  const {
    pendingCheckoutList,
    selectedCheckoutDetail,
    lastCompletedInvoice,
    isReceiptOpen,
    isLoadingPending,
    isLoadingDetail,
    isSubmitting,
    fetchPendingCheckout,
    fetchCheckoutDetail,
    clearSelectedCheckoutDetail,
    closeReceiptModal,
    checkoutInvoice,
  } = useReceptionistStore();

  useEffect(() => {
    fetchPendingCheckout();
  }, [fetchPendingCheckout]);

  const handleSelectRecord = async (maHoSo) => {
    try {
      await fetchCheckoutDetail(maHoSo);
      setIsDrawerOpen(true);
    } catch {
      // Error handled by store/axiosClient
    }
  };

  const handleManualLookup = async (values) => {
    const maHoSo = values.maHoSo?.trim();
    if (!maHoSo) return;
    setManualModalOpen(false);
    manualForm.resetFields();
    await handleSelectRecord(maHoSo);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    clearSelectedCheckoutDetail();
  };

  const handleConfirmCheckout = async (checkoutData) => {
    try {
      await checkoutInvoice(checkoutData);
      setIsDrawerOpen(false);
    } catch {
      // Handled
    }
  };

  return (
    <div>
      <PageHeader
        title="Thanh Toán Viện Phí & Xuất Hóa Đơn"
        subtitle="Danh sách các ca khám chờ thu viện phí, xem trước bảng kê chi tiết và chốt hóa đơn (Stored Procedure sp_gd_thanh_toan_hoa_don)"
      />

      {/* Bảng danh sách ca chờ thanh toán */}
      <PendingCheckoutTable
        data={pendingCheckoutList}
        loading={isLoadingPending}
        onRefresh={() => fetchPendingCheckout()}
        onSelectRecord={handleSelectRecord}
        onManualInput={() => setManualModalOpen(true)}
      />

      {/* Drawer xem trước bảng kê và chốt thanh toán */}
      <CheckoutDetailDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        detail={selectedCheckoutDetail}
        loading={isLoadingDetail}
        isSubmitting={isSubmitting}
        onConfirmCheckout={handleConfirmCheckout}
      />

      {/* Modal biên lai hóa đơn sau khi thanh toán thành công */}
      <InvoiceReceiptModal
        open={isReceiptOpen}
        invoice={lastCompletedInvoice}
        onClose={closeReceiptModal}
      />

      {/* Modal nhập trực tiếp mã hồ sơ khám */}
      <Modal
        title="Tra Cứu Trực Tiếp Mã Hồ Sơ Khám"
        open={manualModalOpen}
        onCancel={() => {
          setManualModalOpen(false);
          manualForm.resetFields();
        }}
        onOk={() => manualForm.submit()}
        okText="Xem Bảng Kê Viện Phí"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={manualForm}
          layout="vertical"
          onFinish={handleManualLookup}
          initialValues={{ maHoSo: '' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="maHoSo"
            label="Nhập mã hồ sơ khám bệnh"
            rules={[{ required: true, message: 'Vui lòng nhập mã hồ sơ (Ví dụ: HS001)!' }]}
          >
            <Input
              placeholder="Ví dụ: HS001"
              size="large"
              style={{ textTransform: 'uppercase' }}
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
