import { useState } from 'react';
import { api } from '../services/api';

export default function Horarios() {
  const [rutaId, setRutaId] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [error, setError] = useState(null);

  const buscar = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.getHorarios(rutaId);
      setHorarios(data);
    } catch {
      setError('No hay información de horarios para esta ruta.');
    }
  };

  return (
    <section className="page">
      <h1>Horarios</h1>
      <form onSubmit={buscar} className="form-inline">
        <input
          placeholder="Código o nombre de ruta"
          value={rutaId}
          onChange={(e) => setRutaId(e.target.value)}
        />
        <button type="submit">Consultar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {horarios.map((h) => (
          <li key={h.id}>
            {h.jornada}: {h.hora}
          </li>
        ))}
      </ul>
    </section>
  );
}
