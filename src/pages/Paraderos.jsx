import { useState } from 'react';
import { api } from '../services/api';

export default function Paraderos() {
  const [rutaId, setRutaId] = useState('');
  const [paraderos, setParaderos] = useState([]);
  const [error, setError] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    setError(null);
    setBuscado(true);
    try {
      setParaderos(await api.getParaderos(rutaId));
    } catch {
      setError('No hay paraderos disponibles para esta ruta.');
      setParaderos([]);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Paraderos por ruta</h1>
        <p>Ingresa el código de una ruta para ver el orden de sus paraderos.</p>
      </div>

      <form onSubmit={buscar} className="form-inline">
        <div>
          <label htmlFor="rutaId">Código de ruta</label>
          <input
            id="rutaId"
            placeholder="Ej. L4"
            value={rutaId}
            onChange={(e) => setRutaId(e.target.value)}
          />
        </div>
        <button type="submit" style={{ alignSelf: 'flex-end' }}>Consultar</button>
      </form>

      {error && <p className="state-msg error">{error}</p>}

      {buscado && !error && paraderos.length === 0 && (
        <div className="empty-state">No se encontraron paraderos para esa ruta.</div>
      )}

      <ol className="stop-list">
        {paraderos.map((p) => (
          <li key={p.id}>{p.nombre}</li>
        ))}
      </ol>
    </section>
  );
}
