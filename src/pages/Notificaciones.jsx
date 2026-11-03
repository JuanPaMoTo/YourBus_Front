import { useState } from 'react';
import Incidente from '../components/Incidente';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';

const CADA_30_SEGUNDOS = 30000;

export default function Notificaciones() {
  const [incidentes, setIncidentes] = useState(null);
  const [error, setError] = useState(null);

  usePolling(() => {
    api
      .getIncidentesActivos()
      .then((lista) => {
        setIncidentes(lista);
        setError(null);
      })
      .catch(() => setError('No fue posible cargar las alertas.'));
  }, CADA_30_SEGUNDOS);

  return (
    <section>
      <div className="page-head">
        <h1>Alertas del servicio</h1>
        <p>Retrasos, desvíos e incidentes reportados en la red de rutas.</p>
      </div>

      {error && <p className="state-msg error">{error}</p>}
      {incidentes === null && !error && <p className="state-msg">Cargando alertas...</p>}
      {incidentes && incidentes.length === 0 && (
        <div className="empty-state">No hay alertas activas en este momento.</div>
      )}
      {incidentes && incidentes.length > 0 && (
        <ul className="incidente-lista">
          {incidentes.map((i) => (
            <Incidente key={i.id} incidente={i} />
          ))}
        </ul>
      )}
    </section>
  );
}
