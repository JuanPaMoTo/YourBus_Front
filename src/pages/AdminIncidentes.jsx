import { useEffect, useReducer, useState } from 'react';
import Incidente from '../components/Incidente';
import { api } from '../services/api';

const FILTROS = [
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'finalizado', etiqueta: 'Finalizados' },
  { valor: '', etiqueta: 'Todos' },
];

// Panel del administrador: ve los incidentes y marca si siguen activos o ya terminaron.
export default function AdminIncidentes() {
  const [estado, setEstado] = useState('activo');
  const [incidentes, setIncidentes] = useState(null);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [version, recargar] = useReducer((v) => v + 1, 0);

  useEffect(() => {
    let vigente = true;
    api
      .getIncidentes(estado)
      .then((lista) => {
        if (!vigente) return;
        setIncidentes(lista);
        setError(null);
      })
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [estado, version]);

  const cambiarEstado = async (incidente, nuevoEstado) => {
    setOcupado(true);
    setError(null);
    try {
      await api.cambiarEstadoIncidente(incidente.id, nuevoEstado);
      recargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Incidentes</h1>
        <p>Accidentes, bloqueos y retrasos reportados. Marca cuáles siguen activos para los pasajeros.</p>
      </div>

      <div className="form-inline">
        <div>
          <label htmlFor="filtro-estado">Mostrar</label>
          <select id="filtro-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            {FILTROS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="state-msg error" role="alert">
          {error}
        </p>
      )}
      {incidentes === null && !error && <p className="state-msg">Cargando incidentes...</p>}
      {incidentes && incidentes.length === 0 && (
        <div className="empty-state">No hay incidentes para mostrar.</div>
      )}
      {incidentes && incidentes.length > 0 && (
        <ul className="incidente-lista">
          {incidentes.map((i) => (
            <Incidente key={i.id} incidente={i}>
              <button
                type="button"
                className="btn-small"
                disabled={ocupado}
                onClick={() => cambiarEstado(i, i.estado === 'activo' ? 'finalizado' : 'activo')}
              >
                {i.estado === 'activo' ? 'Marcar como finalizado' : 'Reactivar'}
              </button>
            </Incidente>
          ))}
        </ul>
      )}
    </section>
  );
}
