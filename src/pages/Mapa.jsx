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
      setError('El tiempo estimado de llegada no está disponible.');
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Mapa y ETA</h1>
        <p>Rastrea un bus en vivo o calcula cuánto falta para que llegue a un paradero.</p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div>
          <h3 style={{ marginBottom: '0.75rem' }}>Ubicación en vivo</h3>
          <form onSubmit={consultarUbicacion} className="form-stack">
            <div>
              <label htmlFor="busId">ID del bus</label>
              <input
                id="busId"
                placeholder="Ej. BUS-102"
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
              />
            </div>
            <button type="submit">Ver ubicación</button>
          </form>
          {ubicacion && (
            <div className="result-panel">
              <span className="badge badge-live">En ruta</span>
              <p style={{ marginTop: '0.6rem' }}>
                Lat {ubicacion.lat} · Lng {ubicacion.lng}
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: '0.75rem' }}>Tiempo estimado de llegada</h3>
          <form onSubmit={consultarEta} className="form-stack">
            <div>
              <label htmlFor="paraderoId">ID del paradero</label>
              <input
                id="paraderoId"
                placeholder="Ej. P-045"
                value={paraderoId}
                onChange={(e) => setParaderoId(e.target.value)}
              />
            </div>
            <button type="submit">Ver ETA</button>
          </form>
          {eta && (
            <div className="result-panel">
              <span className="value">{eta.minutos} min</span>
            </div>
          )}
        </div>
      </div>

      {error && <p className="state-msg error" style={{ marginTop: '1.5rem' }}>{error}</p>}
    </section>
  );
}
