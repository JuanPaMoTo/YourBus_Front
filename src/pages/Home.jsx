import { Link } from 'react-router-dom';

const quickLinks = [
  {
    to: '/rutas',
    title: 'Rutas',
    desc: 'Consulta el trazado y las líneas activas del servicio.',
  },
  {
    to: '/horarios',
    title: 'Horarios',
    desc: 'Frecuencias por jornada para cada ruta.',
  },
  {
    to: '/mapa',
    title: 'Mapa y ETA',
    desc: 'Ubicación del bus en vivo y tiempo estimado de llegada.',
  },
  {
    to: '/notificaciones',
    title: 'Alertas',
    desc: 'Retrasos, desvíos e incidentes reportados en la red.',
  },
];

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <p className="hero-eyebrow">Transporte público en tiempo real</p>
        <h1>Sabe exactamente cuándo llega tu bus.</h1>
        <p className="hero-lead">
          YourBus reúne rutas, paraderos, horarios y la ubicación en vivo de
          la flota en un solo lugar, para que dejes de adivinar.
        </p>
        <div className="hero-actions">
          <Link to="/rutas" className="btn-primary">
            Ver rutas disponibles
          </Link>
          <Link to="/mapa" className="btn-ghost">
            Rastrear un bus
          </Link>
        </div>
      </section>

      <section className="quick-grid">
        {quickLinks.map((q) => (
          <Link to={q.to} key={q.to} className="quick-card">
            <h3>{q.title}</h3>
            <p>{q.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
