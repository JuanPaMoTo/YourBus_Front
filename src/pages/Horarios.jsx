import { useState } from 'react';
import { api } from '../services/api';

export default function Horarios() {
  const [rutaId, setRutaId] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [error, setError] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    setError(null);
    setBuscado(true);
    try {
      setHorarios(await api.getHorarios(rutaId));
    } catch {
      setError('No hay información de horarios para esta ruta.');
      setHorarios([]);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Horarios</h1>
        <p>Frecuencias de paso por jornada para la ruta que elijas.</p>
      </div>

      <form onSubmit={buscar} className="form-inline">
        <div>
          <label htmlFor="rutaHorario">Código o nombre de ruta</label>
          <input
            id="rutaHorario"
            placeholder="Ej. L4"
            value={rutaId}
            onChange={(e) => setRutaId(e.target.value)}
          />
        </div>
        <button type="submit" style={{ alignSelf: 'flex-end' }}>Consultar</button>
      </form>

      {error && <p className="state-msg error">{error}</p>}

      {buscado && !error && horarios.length === 0 && (
        <div className="empty-state">No hay horarios registrados para esa ruta.</div>
      )}

      <ul className="route-list">
        {horarios.map((h) => (
          <li key={h.id} className="route-item">
            <span className="route-code">{h.jornada}</span>
            <span className="route-name">{h.hora}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
