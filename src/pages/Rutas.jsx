import { useEffect, useState } from "react";
import Incidente from "../components/Incidente";
import { api } from "../services/api";

export default function Rutas() {
  const [rutas, setRutas] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getRutas()
      .then(setRutas)
      .catch(() => setError("No fue posible cargar las rutas."))
      .finally(() => setLoading(false));

    // Los avisos son un extra: si fallan, las rutas se muestran igual.
    api
      .getIncidentesActivos()
      .then(setAvisos)
      .catch(() => setAvisos([]));
  }, []);

  const avisosDe = (ruta) =>
    avisos.filter((a) => a.ruta && a.ruta.id === ruta.id);

  return (
    <section>
      <div className="page-head">
        <h1>Rutas disponibles</h1>
        <p>
          Todas las líneas activas del servicio, con su código de
          identificación.
        </p>
      </div>

      {loading && <p className="state-msg">Cargando rutas...</p>}
      {error && <p className="state-msg error">{error}</p>}
      {!loading && !error && rutas.length === 0 && (
        <div className="empty-state">
          Aún no hay rutas cargadas. Conecta el backend para verlas aquí.
        </div>
      )}

      <ul className="route-list">
        {rutas.map((ruta) => {
          const delaRuta = avisosDe(ruta);
          return (
            <li key={ruta.id} className="route-item">
              <span className="route-code">{ruta.codigo}</span>
              <span className="route-name">{ruta.nombre}</span>
              {delaRuta.length > 0 && (
                <ul className="route-avisos" aria-label={`Avisos de la ruta ${ruta.codigo}`}>
                  {delaRuta.map((a) => (
                    <Incidente key={a.id} incidente={a} mostrarRuta={false} />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
