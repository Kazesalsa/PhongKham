import { message as antdMessage, notification as antdNotification } from 'antd';

let messageInstance = antdMessage;
let notificationInstance = antdNotification;

export const setAntdInstances = ({ message, notification }) => {
  if (message) messageInstance = message;
  if (notification) notificationInstance = notification;
};

export const showSuccess = (msg) => {
  messageInstance.success(msg);
};

export const showError = (msg) => {
  messageInstance.error(msg || 'Đã có lỗi xảy ra!');
};

export const showWarning = (msg) => {
  messageInstance.warning(msg);
};

export const showDbErrorNotification = (dbMessage) => {
  notificationInstance.error({
    message: 'Lỗi Phân Quyền DBMS (SQL Server)',
    description: dbMessage || 'Bạn không có quyền thực hiện thao tác này trên cơ sở dữ liệu!',
    placement: 'topRight',
    duration: 6,
  });
};

