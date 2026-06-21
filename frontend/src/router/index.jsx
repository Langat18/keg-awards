import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

import Login           from '../pages/auth/Login';
import Register        from '../pages/auth/Register';
import NotFoundPage    from '../pages/NotFoundPage';
import ForbiddenPage   from '../pages/ForbiddenPage';
import GuestLanding    from '../pages/guest/Landing';

import StaffLayout     from '../pages/staff/StaffLayout';
import StaffHome       from '../pages/staff/Home';
import Nominate        from '../pages/staff/Nominate';
import Vote            from '../pages/staff/Vote';
import Results         from '../pages/staff/Results';
import Profile         from '../pages/staff/Profile';

import ManagementLayout   from '../pages/management/ManagementLayout';
import ManagementHome     from '../pages/management/Home';
import ManageCycles       from '../pages/management/Cycles';
import ManageNominations  from '../pages/management/Nominations';
import ManageResults      from '../pages/management/Results';
import ManageUsers        from '../pages/management/Users';
import ManageProfile      from '../pages/management/Profile';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/forbidden" replace />;
  return children;
}

export const router = createBrowserRouter([

  { path: '/',          element: <GuestLanding /> },
  { path: '/login',     element: <Login /> },
  { path: '/register',  element: <Register /> },
  { path: '/forbidden', element: <ForbiddenPage /> },


  {
    path: '/staff',
    element: <RequireAuth><StaffLayout /></RequireAuth>,
    children: [
      { index: true,         element: <StaffHome />  },
      { path: 'nominate',    element: <Nominate />   },
      { path: 'vote',        element: <Vote />        },
      { path: 'results',     element: <Results />     },
      { path: 'profile',     element: <Profile />     },
    ],
  },


  {
    path: '/management',
    element: <RequireAdmin><ManagementLayout /></RequireAdmin>,
    children: [
      { index: true,           element: <ManagementHome />    },
      { path: 'cycles',        element: <ManageCycles />      },
      { path: 'nominations',   element: <ManageNominations /> },
      { path: 'results',       element: <ManageResults />     },
      { path: 'users',         element: <ManageUsers />       },
      { path: 'profile',       element: <ManageProfile />     },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);