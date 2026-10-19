import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { ROLES } from '../constants/roleConstants';
import { ROUTE_PATHS } from '../constants/routePaths';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LoginPage from '../modules/auth/LoginPage';

// Receptionist
import AdmissionPage from '../modules/receptionist/AdmissionPage';
import WaitingQueuePage from '../modules/receptionist/WaitingQueuePage';
import PatientSearchPage from '../modules/receptionist/PatientSearchPage';
import CheckoutPage from '../modules/receptionist/CheckoutPage';

// Doctor
import DoctorQueuePage from '../modules/doctor/DoctorQueuePage';
import ExaminationPage from '../modules/doctor/ExaminationPage';

// Pharmacy
import DrugInventoryPage from '../modules/pharmacy/DrugInventoryPage';
import DrugAlertPage from '../modules/pharmacy/DrugAlertPage';

// Admin
import UserManagementPage from '../modules/admin/UserManagementPage';
import RevenueAnalyticsPage from '../modules/admin/RevenueAnalyticsPage';
import DoctorProductivityPage from '../modules/admin/DoctorProductivityPage';
import InvoiceHistoryPage from '../modules/admin/InvoiceHistoryPage';

// Helper component for smart Root redirect
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }
  switch (user.role) {
    case ROLES.ADMIN:
      return <Navigate to={ROUTE_PATHS.ADMIN.ANALYTICS} replace />;
    case ROLES.DOCTOR:
      return <Navigate to={ROUTE_PATHS.DOCTOR.QUEUE} replace />;
    case ROLES.RECEPTIONIST:
      return <Navigate to={ROUTE_PATHS.RECEPTIONIST.QUEUE} replace />;
    case ROLES.PHARMACIST:
      return <Navigate to={ROUTE_PATHS.PHARMACY.INVENTORY} replace />;
    default:
      return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root smart redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
      </Route>

      {/* Protected Main Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Receptionist Routes */}
        <Route
          path={ROUTE_PATHS.RECEPTIONIST.ADMISSION}
          element={
            <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
              <AdmissionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.RECEPTIONIST.QUEUE}
          element={
            <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
              <WaitingQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.RECEPTIONIST.PATIENTS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
              <PatientSearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.RECEPTIONIST.CHECKOUT}
          element={
            <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path={ROUTE_PATHS.DOCTOR.QUEUE}
          element={
            <ProtectedRoute allowedRoles={[ROLES.DOCTOR, ROLES.ADMIN]}>
              <DoctorQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.DOCTOR.EXAMINATION}
          element={
            <ProtectedRoute allowedRoles={[ROLES.DOCTOR, ROLES.ADMIN]}>
              <ExaminationPage />
            </ProtectedRoute>
          }
        />

        {/* Pharmacy Routes */}
        <Route
          path={ROUTE_PATHS.PHARMACY.INVENTORY}
          element={
            <ProtectedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.ADMIN]}>
              <DrugInventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.PHARMACY.ALERTS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.ADMIN]}>
              <DrugAlertPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path={ROUTE_PATHS.ADMIN.USERS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.ADMIN.DAILY_REPORT}
          element={<Navigate to={ROUTE_PATHS.ADMIN.ANALYTICS} replace />}
        />
        <Route
          path={ROUTE_PATHS.ADMIN.ANALYTICS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <RevenueAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.ADMIN.PRODUCTIVITY}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <DoctorProductivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.ADMIN.INVOICES}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <InvoiceHistoryPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
