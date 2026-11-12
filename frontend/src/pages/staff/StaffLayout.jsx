import AppShell from '../../components/AppShell';
import { useAuth } from '../../store/AuthContext';

export default function StaffLayout() {
  const { user, canViewResults } = useAuth();

  const links = [
    { to: '/staff', label: 'Home', icon: 'home', end: true },
    { to: '/staff/nominate', label: 'Nominate', icon: 'pen' },
    { to: '/staff/vote', label: 'Vote', icon: 'ballot' },
    ...(canViewResults ? [{ to: '/staff/results', label: 'Results', icon: 'trophy' }] : []),
  ];

  return <AppShell links={links} profilePath="/staff/profile" subtitle={user?.department || 'Staff'} />;
}
