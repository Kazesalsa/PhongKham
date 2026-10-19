export const ROUTE_PATHS = {
  LOGIN: '/login',

  // Receptionist
  RECEPTIONIST: {
    ROOT: '/receptionist',
    ADMISSION: '/receptionist/admission',
    QUEUE: '/receptionist/queue',
    PATIENTS: '/receptionist/patients',
    CHECKOUT: '/receptionist/checkout',
  },

  // Doctor
  DOCTOR: {
    ROOT: '/doctor',
    QUEUE: '/doctor/queue',
    EXAMINATION: '/doctor/examination',
  },

  // Pharmacy
  PHARMACY: {
    ROOT: '/pharmacy',
    INVENTORY: '/pharmacy/inventory',
    ALERTS: '/pharmacy/alerts',
  },

  // Admin
  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    DAILY_REPORT: '/admin/daily-report',
    ANALYTICS: '/admin/analytics',
    PRODUCTIVITY: '/admin/productivity',
    INVOICES: '/admin/invoices',
  },
};
