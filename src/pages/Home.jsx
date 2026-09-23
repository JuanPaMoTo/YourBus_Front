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
        <div className="hero-copy">
          <p className="hero-eyebrow">Rutas intermunicipales y rurales</p>
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
        </div>

        <svg
          className="hero-map"
          viewBox="0 0 320 220"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Red de rutas con paraderos conectados"
        >
          <path d="M20 170 L110 60 L200 100 L300 40" stroke="var(--l1)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M20 60 L100 130 L180 190 L280 150" stroke="var(--l4)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M40 20 L120 100 L220 60 L290 130" stroke="var(--l3)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85" />

          {[
            [20, 170], [110, 60], [200, 100], [300, 40],
            [20, 60], [100, 130], [180, 190], [280, 150],
            [40, 20], [220, 60], [290, 130],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i % 4 === 0 ? 7 : 5} fill="var(--cream)" stroke="var(--navy)" strokeWidth="2.5" />
          ))}
        </svg>
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
