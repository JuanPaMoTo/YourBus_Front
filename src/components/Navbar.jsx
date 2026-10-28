import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Navbar.css';

const PUBLICOS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/rutas', label: 'Rutas' },
  { to: '/paraderos', label: 'Paraderos' },
  { to: '/horarios', label: 'Horarios' },
  { to: '/mapa', label: 'Mapa y ETA' },
  { to: '/notificaciones', label: 'Alertas' },
];

const POR_ROL = {
  pasajero: [],
  conductor: [{ to: '/conductor', label: 'Mis turnos' }],
  admin: [
    { to: '/admin/turnos', label: 'Turnos' },
    { to: '/admin/usuarios', label: 'Usuarios' },
    { to: '/admin/buses', label: 'Flota' },
  ],
};

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  const enlaces = [...PUBLICOS, ...(usuario ? POR_ROL[usuario.rol] || [] : [])];
  if (!usuario) enlaces.push({ to: '/login', label: 'Ingresar' });

  const salir = () => {
    cerrarSesion();
    navegar('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-top">
        <NavLink to="/" className="brand">
          <span className="brand-mark">YB</span>
          <span className="brand-name">YourBus</span>
        </NavLink>
        {usuario && (
          <div className="user-chip">
            <span>
              {usuario.nombre} · <em>{usuario.rol}</em>
            </span>
            <button type="button" onClick={salir}>
              Salir
            </button>
          </div>
        )}
      </div>
      <nav className="line" aria-label="Secciones principales">
        <div className="line-track" aria-hidden="true" />
        <ul className="line-stops">
          {enlaces.map((s) => (
            <li key={s.to}>
              <NavLink
                to={s.to}
                end={s.end}
                className={({ isActive }) => (isActive ? 'stop active' : 'stop')}
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
