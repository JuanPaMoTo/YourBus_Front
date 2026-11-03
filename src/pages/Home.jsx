import { Link } from "react-router-dom";

const iconoProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

const quickLinks = [
  {
    to: "/rutas",
    title: "Rutas",
    desc: "Consulta el trazado y las líneas activas del servicio.",
    cta: "Ver rutas",
    icon: (
      <svg {...iconoProps}>
        <circle cx="6" cy="19" r="2.5" />
        <circle cx="18" cy="5" r="2.5" />
        <path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" />
      </svg>
    ),
  },
  {
    to: "/horarios",
    title: "Horarios",
    desc: "Frecuencias por jornada para cada ruta.",
    cta: "Ver horarios",
    icon: (
      <svg {...iconoProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    to: "/mapa",
    title: "Mapa y ETA",
    desc: "Ubicación del bus en vivo y tiempo estimado de llegada.",
    cta: "Abrir el mapa",
    tag: "En vivo",
    icon: (
      <svg {...iconoProps}>
        <path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    to: "/notificaciones",
    title: "Alertas",
    desc: "Retrasos, desvíos e incidentes reportados en la red.",
    cta: "Ver alertas",
    icon: (
      <svg {...iconoProps}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
  },
];

const pasos = [
  {
    n: "01",
    title: "Elige tu ruta",
    desc: "Busca la línea y el paradero que necesitas para tu viaje.",
  },
  {
    n: "02",
    title: "Sigue el bus en el mapa",
    desc: "Mira dónde va el bus ahora y cuánto falta para que llegue.",
  },
  {
    n: "03",
    title: "Sal con tiempo",
    desc: "Revisa las alertas de la red antes de salir de casa.",
  },
];

const BUS_PATH = "M20 170 L110 60 L200 100 L300 40";

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">Rutas intermunicipales y rurales</p>
          <h1>
            Sabe exactamente <span className="resalte">cuándo llega</span> tu
            bus.
          </h1>
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
          <ul className="hero-chips">
            <li style={{ "--chip": "#4bd18b" }}>Ubicación en vivo</li>
            <li style={{ "--chip": "#4da3ff" }}>Tiempo de llegada</li>
            <li style={{ "--chip": "#ff4d6d" }}>Alertas de la red</li>
          </ul>
        </div>

        <div className="hero-visual">
          <svg
            className="hero-map"
            viewBox="0 0 320 220"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Red de rutas con paraderos conectados y un bus en movimiento"
          >
            <path className="ruta" d={BUS_PATH} stroke="var(--l1)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path className="ruta" d="M20 60 L100 130 L180 190 L280 150" stroke="var(--l4)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path className="ruta" d="M40 20 L120 100 L220 60 L290 130" stroke="var(--l3)" strokeWidth="4" strokeLinecap="round" fill="none" />

            {[
              [20, 170],
              [110, 60],
              [200, 100],
              [300, 40],
              [20, 60],
              [100, 130],
              [180, 190],
              [280, 150],
              [40, 20],
              [220, 60],
              [290, 130],
            ].map(([cx, cy], i) => (
              <g key={i}>
                {i % 4 === 0 && (
                  <circle className="parada-aro" cx={cx} cy={cy} r="7" fill="none" stroke="var(--amber)" strokeWidth="1.5" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={i % 4 === 0 ? 7 : 5}
                  fill="var(--cream)"
                  stroke="var(--navy)"
                  strokeWidth="2.5"
                />
              </g>
            ))}

            <g className="hero-bus" style={{ offsetPath: `path("${BUS_PATH}")` }}>
              <rect x="-14" y="-9" width="28" height="18" rx="5" fill="var(--amber)" stroke="var(--navy)" strokeWidth="2" />
              <rect x="-9" y="-5" width="18" height="5" rx="1.5" fill="var(--navy)" opacity="0.85" />
            </g>
          </svg>
          <span className="badge-ejemplo">Vista de ejemplo</span>
          <div className="hero-card" aria-hidden="true">
            <span className="codigo">R1</span>
            <div>
              <strong>Llega en pocos minutos</strong>
              <small>Tiempo estimado de llegada</small>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="explora">
        <div className="seccion-head">
          <p className="eyebrow">Explora</p>
          <h2 id="explora">Todo lo que necesitas para moverte</h2>
        </div>
        <div className="quick-grid">
          {quickLinks.map((q) => (
            <Link to={q.to} key={q.to} className="quick-card">
              {q.tag && <span className="quick-tag">{q.tag}</span>}
              <span className="quick-icon">{q.icon}</span>
              <h3>{q.title}</h3>
              <p>{q.desc}</p>
              <span className="quick-cta">{q.cta}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="como">
        <div className="seccion-head">
          <p className="eyebrow">Así de simple</p>
          <h2 id="como">Tu viaje en tres pasos</h2>
        </div>
        <ol className="pasos">
          {pasos.map((p) => (
            <li key={p.n} className="paso">
              <span className="paso-num">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-band">
        <div>
          <h2>¿Eres conductor o administrador?</h2>
          <p>Ingresa para ver tus turnos y gestionar la flota.</p>
        </div>
        <Link to="/login" className="btn-primary">
          Ingresar
        </Link>
      </section>
    </div>
  );
}
