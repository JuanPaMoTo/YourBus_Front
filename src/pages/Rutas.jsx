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
    <section className="page">
      <h1>Rutas disponibles</h1>
      {loading && <p>Cargando rutas...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && rutas.length === 0 && (
        <p>No hay rutas disponibles por el momento.</p>
      )}
      <ul className="list">
        {rutas.map((ruta) => (
          <li key={ruta.id}>
            <strong>{ruta.codigo}</strong> — {ruta.nombre}
          </li>
        ))}
      </ul>
    </section>
  );
}
