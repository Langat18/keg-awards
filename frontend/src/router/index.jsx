import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { PageSkeleton } from '../components/Skeleton';

import Landing from '../pages/guest/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import StaffLayout from '../pages/staff/StaffLayout';
import ManagementLayout from '../pages/management/ManagementLayout';

const StaffHome = lazy(() => import('../pages/staff/Home'));
const Nominate = lazy(() => import('../pages/staff/Nominate'));
const Vote = lazy(() => import('../pages/staff/Vote'));
const StaffResults = lazy(() => import('../pages/staff/Results'));
const Profile = lazy(() => import('../pages/Profile'));

const ManagementHome = lazy(() => import('../pages/management/Home'));
const ManageCycles = lazy(() => import('../pages/management/Cycles'));
const ManageNominations = lazy(() => import('../pages/management/Nominations'));
const ManageResults = lazy(() => import('../pages/management/Results'));
const ManageUsers = lazy(() => import('../pages/management/Users'));

function page(Component) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/forbidden" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, homePath } = useAuth();
  return user ? <Navigate to={homePath} replace /> : children;
}

export const router = createBrowserRouter([
  { path: '/', element: <GuestOnly><Landing /></GuestOnly> },
  { path: '/login', element: <GuestOnly><Login /></GuestOnly> },
  { path: '/register', element: <GuestOnly><Register /></GuestOnly> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  {
    path: '/staff',
    element: <RequireAuth><StaffLayout /></RequireAuth>,
    children: [
      { index: true, element: page(StaffHome) },
      { path: 'nominate', element: page(Nominate) },
      { path: 'vote', element: page(Vote) },
      { path: 'results', element: page(StaffResults) },
      { path: 'profile', element: page(Profile) },
    ],
  },
  {
    path: '/management',
    element: <RequireAdmin><ManagementLayout /></RequireAdmin>,
    children: [
      { index: true, element: page(ManagementHome) },
      { path: 'cycles', element: page(ManageCycles) },
      { path: 'nominations', element: page(ManageNominations) },
      { path: 'results', element: page(ManageResults) },
      { path: 'users', element: page(ManageUsers) },
      { path: 'profile', element: page(Profile) },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
