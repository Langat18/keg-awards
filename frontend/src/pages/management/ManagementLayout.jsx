import AppShell from '../../components/AppShell';

const LINKS = [
  { to: '/management', label: 'Overview', icon: 'grid', end: true },
  { to: '/management/cycles', label: 'Cycles', icon: 'layers' },
  { to: '/management/nominations', label: 'Nominations', icon: 'list' },
  { to: '/management/results', label: 'Results', icon: 'trophy' },
  { to: '/management/users', label: 'Staff accounts', icon: 'users' },
];

export default function ManagementLayout() {
  return <AppShell links={LINKS} profilePath="/management/profile" subtitle="Administrator" areaLabel="Administration" />;
}
