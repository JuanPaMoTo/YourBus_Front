import { useState } from 'react';
import { api } from '../services/api';

export default function Mapa() {
  const [busId, setBusId] = useState('');
  const [paraderoId, setParaderoId] = useState('');
  const [ubicacion, setUbicacion] = useState(null);
  const [eta, setEta] = useState(null);
  const [error, setError] = useState(null);

  const consultarUbicacion = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setUbicacion(await api.getUbicacionBus(busId));
    } catch {
      setError('La ubicación del bus no está disponible.');
    }
  };

  const consultarEta = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setEta(await api.getEta(paraderoId));
    } catch {
      setError('El ETA no está disponible.');
    }
  };

  return (
    <section className="page">
      <h1>Ubicación del bus y ETA</h1>

      <form onSubmit={consultarUbicacion} className="form-inline">
        <input
          placeholder="ID del bus"
          value={busId}
          onChange={(e) => setBusId(e.target.value)}
        />
        <button type="submit">Ver ubicación</button>
      </form>
      {ubicacion && (
        <p>
          Lat: {ubicacion.lat} — Lng: {ubicacion.lng}
        </p>
      )}

      <form onSubmit={consultarEta} className="form-inline">
        <input
          placeholder="ID del paradero"
          value={paraderoId}
          onChange={(e) => setParaderoId(e.target.value)}
        />
        <button type="submit">Ver ETA</button>
      </form>
      {eta && <p>Tiempo estimado de llegada: {eta.minutos} min</p>}

      {error && <p className="error">{error}</p>}
    </section>
  );
}
