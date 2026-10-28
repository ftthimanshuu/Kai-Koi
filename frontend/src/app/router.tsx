import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { HomePage } from '@/features/home/HomePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
