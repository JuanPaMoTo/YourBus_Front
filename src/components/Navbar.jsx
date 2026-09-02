import { NavLink } from 'react-router-dom';
import './Navbar.css';

const stops = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/rutas', label: 'Rutas' },
  { to: '/paraderos', label: 'Paraderos' },
  { to: '/horarios', label: 'Horarios' },
  { to: '/mapa', label: 'Mapa y ETA' },
  { to: '/notificaciones', label: 'Alertas' },
  { to: '/admin/buses', label: 'Flota' },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-top">
        <NavLink to="/" className="brand">
          <span className="brand-mark">YB</span>
          <span className="brand-name">YourBus</span>
        </NavLink>
      </div>
      <nav className="line" aria-label="Secciones principales">
        <div className="line-track" aria-hidden="true" />
        <ul className="line-stops">
          {stops.map((s) => (
            <li key={s.to}>
              <NavLink
                to={s.to}
                end={s.end}
                className={({ isActive }) =>
                  isActive ? 'stop active' : 'stop'
                }
              >
                <span className="stop-dot" aria-hidden="true" />
                <span className="stop-label">{s.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
