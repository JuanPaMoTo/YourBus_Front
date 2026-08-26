import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/rutas', label: 'Rutas' },
  { to: '/paraderos', label: 'Paraderos' },
  { to: '/horarios', label: 'Horarios' },
  { to: '/mapa', label: 'Mapa / ETA' },
  { to: '/notificaciones', label: 'Notificaciones' },
  { to: '/admin/buses', label: 'Admin Buses' },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">🚌 Bus Tracker</span>
      <div className="navbar-links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
