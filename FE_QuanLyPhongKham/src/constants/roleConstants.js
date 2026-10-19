export const ROLES = {
  ADMIN: 'QUAN_TRI',
  DOCTOR: 'BAC_SI',
  RECEPTIONIST: 'LE_TAN',
  PHARMACIST: 'DUOC_SI',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Quản Trị Viên',
  [ROLES.DOCTOR]: 'Bác Sĩ Khám Bệnh',
  [ROLES.RECEPTIONIST]: 'Lễ Tân & Thu Ngân',
  [ROLES.PHARMACIST]: 'Dược Sĩ Kho Thuốc',
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'purple',
  [ROLES.DOCTOR]: 'blue',
  [ROLES.RECEPTIONIST]: 'cyan',
  [ROLES.PHARMACIST]: 'green',
};
