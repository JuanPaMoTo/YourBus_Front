import { useState } from 'react';
import { api } from '../services/api';

export default function Paraderos() {
  const [rutaId, setRutaId] = useState('');
  const [paraderos, setParaderos] = useState([]);
  const [error, setError] = useState(null);

  const buscar = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.getParaderos(rutaId);
      setParaderos(data);
    } catch {
      setError('No hay paraderos disponibles para esta ruta.');
    }
  };

  return (
    <section className="page">
      <h1>Paraderos por ruta</h1>
      <form onSubmit={buscar} className="form-inline">
        <input
          placeholder="ID o código de ruta"
          value={rutaId}
          onChange={(e) => setRutaId(e.target.value)}
        />
        <button type="submit">Consultar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ol className="list">
        {paraderos.map((p) => (
          <li key={p.id}>{p.nombre}</li>
        ))}
      </ol>
    </section>
  );
}
