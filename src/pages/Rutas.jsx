import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Rutas() {
  const [rutas, setRutas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getRutas()
      .then(setRutas)
      .catch(() => setError('No fue posible cargar las rutas.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="page-head">
        <h1>Rutas disponibles</h1>
        <p>Todas las líneas activas del servicio, con su código de identificación.</p>
      </div>

      {loading && <p className="state-msg">Cargando rutas...</p>}
      {error && <p className="state-msg error">{error}</p>}
      {!loading && !error && rutas.length === 0 && (
        <div className="empty-state">
          Aún no hay rutas cargadas. Conecta el backend para verlas aquí.
        </div>
      )}

      <ul className="route-list">
        {rutas.map((ruta) => (
          <li key={ruta.id} className="route-item">
            <span className="route-code">{ruta.codigo}</span>
            <span className="route-name">{ruta.nombre}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
