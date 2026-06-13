import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { VenuesPage } from '@/pages/venues/VenuesPage';
import { VenueDetailPage } from '@/pages/venues/VenueDetailPage';
import { VenueFormPage } from '@/pages/venues/VenueFormPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { OwnerRegisterPage } from '@/pages/auth/OwnerRegisterPage';
import { UserDashboardPage } from '@/pages/dashboard/UserDashboardPage';
import { OwnerDashboardPage } from '@/pages/dashboard/OwnerDashboardPage';
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';
import { BookingsPage } from '@/pages/bookings/BookingsPage';
import { BookingDetailPage } from '@/pages/bookings/BookingDetailPage';
import { CreateBookingPage } from '@/pages/bookings/CreateBookingPage';
import { InvitationPage } from '@/pages/invitation/InvitationPage';
import { MyVenuesPage } from '@/pages/venues/MyVenuesPage';
import { AdminVenuesPage } from '@/pages/admin/AdminVenuesPage';
import { AdminOwnersPage } from '@/pages/admin/AdminOwnersPage';
import { VenueManagePage } from '@/pages/venues/VenueManagePage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'venues', element: <VenuesPage /> },
      { path: 'venues/:id', element: <VenueDetailPage /> },
      { path: 'invitation/:slug', element: <InvitationPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'register/owner', element: <OwnerRegisterPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <UserDashboardPage /> },
      {
        path: 'owner',
        element: (
          <ProtectedRoute roles={['owner']}>
            <OwnerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'bookings/:id', element: <BookingDetailPage /> },
      {
        path: 'bookings/new/:venueId',
        element: (
          <ProtectedRoute roles={['user']}>
            <CreateBookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-venues',
        element: (
          <ProtectedRoute roles={['owner', 'admin']}>
            <MyVenuesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'venues/new',
        element: (
          <ProtectedRoute roles={['owner', 'admin']}>
            <VenueFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'venues/:id/edit',
        element: (
          <ProtectedRoute roles={['owner', 'admin']}>
            <VenueFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'venues/:id/manage',
        element: (
          <ProtectedRoute roles={['owner', 'admin']}>
            <VenueManagePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/venues',
        element: (
          <ProtectedRoute roles={['admin']}>
            <AdminVenuesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/bookings',
        element: (
          <ProtectedRoute roles={['admin']}>
            <BookingsPage admin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/owners',
        element: (
          <ProtectedRoute roles={['admin']}>
            <AdminOwnersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    element: <PublicLayout />,
    children: [{ path: 'invitation/:slug', element: <InvitationPage /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
