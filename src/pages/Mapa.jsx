import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { useGeolocalizacion } from '../hooks/useGeolocalizacion';
import { formatearDistancia, paraderoMasCercano } from '../utils/geo';

// Leaflet pesa bastante: se descarga solo cuando el usuario abre esta página.
const MapaVivo = lazy(() => import('../components/MapaVivo'));

const INTERVALO_BUSES_MS = 5000;
const INTERVALO_ETA_MS = 10000;

function TextoEta({ eta }) {
  if (!eta) return <span>Calculando…</span>;
  if (eta.estado === 'ya_paso') return <span>Ya pasó por este paradero</span>;
  if (eta.estado !== 'en_camino') return <span>Sin datos suficientes para calcular</span>;
  return (
    <>
      <span className="value">{eta.minutos} min</span>
      <span className="eta-detalle">
        {formatearDistancia(eta.distanciaMetros)} por calles · {eta.paradasHastaLlegar}{' '}
        {eta.paradasHastaLlegar === 1 ? 'parada' : 'paradas'}
      </span>
      {eta.metodo === 'estimacion_lineal' && (
        <span className="eta-aviso">Aproximado: el servicio de mapas no respondió.</span>
      )}
    </>
  );
}

export default function Mapa() {
  const [rutas, setRutas] = useState([]);
  const [rutaId, setRutaId] = useState('');
  const [paraderos, setParaderos] = useState([]);
  const [buses, setBuses] = useState([]);
  const [paraderoId, setParaderoId] = useState('');
  const [eligioParadero, setEligioParadero] = useState(false);
  const [etas, setEtas] = useState({});
  const [error, setError] = useState(null);
  const [compartiendo, setCompartiendo] = useState(false);
  const { posicion: miPosicion, error: errorGps } = useGeolocalizacion(compartiendo);
  const ultimaRuta = useRef('');

  // Rutas disponibles
  useEffect(() => {
    api
      .getRutas()
      .then((lista) => {
        setRutas(lista);
        if (lista.length) setRutaId(lista[0].id);
      })
      .catch(() => setError('No fue posible cargar las rutas.'));
  }, []);

  // Paraderos de la ruta elegida
  useEffect(() => {
    if (!rutaId) return;
    ultimaRuta.current = rutaId;
    api
      .getParaderos(rutaId)
      .then((lista) => {
        if (ultimaRuta.current !== rutaId) return;
        setParaderos(lista);
        setEligioParadero(false);
        setParaderoId(lista.length ? lista[0].id : '');
        setBuses([]);
        setEtas({});
      })
      .catch(() => setError('No fue posible cargar los paraderos.'));
  }, [rutaId]);

  // Si el pasajero comparte su ubicación y no eligió paradero, se propone el más cercano.
  const masCercano = miPosicion ? paraderoMasCercano(miPosicion, paraderos) : null;
  const paraderoActivo = !eligioParadero && masCercano ? masCercano.paradero.id : paraderoId;

  // Polling de la posición de los buses (cada 5 s)
  usePolling(
    async () => {
      try {
        const lista = await api.getBusesActivos(rutaId);
        if (ultimaRuta.current === rutaId) {
          setBuses(lista);
          setError(null);
        }
      } catch {
        setError('No se pudo actualizar la posición de los buses.');
      }
    },
    INTERVALO_BUSES_MS,
    Boolean(rutaId)
  );

  // ETA por calles de cada bus hacia el paradero elegido (cada 10 s)
  usePolling(
    async () => {
      const resultados = await Promise.all(
        buses.map((b) =>
          api
            .getEtaBus(b.turnoId, paraderoActivo)
            .then((eta) => [b.turnoId, eta])
            .catch(() => [b.turnoId, null])
        )
      );
      setEtas(Object.fromEntries(resultados));
    },
    INTERVALO_ETA_MS,
    Boolean(paraderoActivo) && buses.length > 0,
    `${paraderoActivo}|${buses.map((b) => b.turnoId).join(',')}`
  );

  const paradero = paraderos.find((p) => p.id === paraderoActivo);
  const aPie =
    miPosicion && paradero && typeof paradero.lat === 'number'
      ? paraderoMasCercano(miPosicion, [paradero]).distancia
      : null;

  const elegirParadero = (id) => {
    setEligioParadero(true);
    setParaderoId(id);
    setEtas({});
  };

  return (
    <section>
      <div className="page-head">
        <h1>Mapa y ETA</h1>
        <p>Mira dónde van los buses de tu ruta y cuánto falta para que lleguen a tu paradero.</p>
      </div>

      <div className="form-inline">
        <div>
          <label htmlFor="ruta">Ruta</label>
          <select id="ruta" value={rutaId} onChange={(e) => setRutaId(e.target.value)}>
            {rutas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} · {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="paradero">Mi paradero</label>
          <select id="paradero" value={paraderoActivo} onChange={(e) => elegirParadero(e.target.value)}>
            {paraderos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.orden}. {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-solid" onClick={() => setCompartiendo((v) => !v)}>
          {compartiendo ? 'Dejar de usar mi ubicación' : 'Usar mi ubicación'}
        </button>
      </div>

      {error && (
        <p className="state-msg error" role="alert">
          {error}
        </p>
      )}
      {errorGps && compartiendo && <p className="state-msg error">{errorGps}</p>}
      {aPie != null && (
        <p className="state-msg">
          Estás a {formatearDistancia(aPie)} (en línea recta) de «{paradero.nombre}».
        </p>
      )}

      <div className="layout-mapa">
        <Suspense fallback={<div className="mapa-leaflet mapa-cargando">Cargando mapa…</div>}>
          <MapaVivo
            paraderos={paraderos}
            buses={buses}
            miPosicion={miPosicion}
            paraderoId={paraderoActivo}
            onSeleccionarParadero={elegirParadero}
            claveRuta={rutaId}
          />
        </Suspense>

        <aside className="eta-lista" aria-live="polite">
          <h2 className="subtitulo">Buses en ruta</h2>
          {buses.length === 0 ? (
            <div className="empty-state">No hay buses en recorrido por esta ruta ahora mismo.</div>
          ) : (
            <ul>
              {buses.map((b) => (
                <li key={b.turnoId} className="eta-card">
                  <div className="eta-top">
                    <strong>{b.placa}</strong>
                    <span className={`badge ${b.sinSenalReciente ? 'badge-sin-senal' : 'badge-live'}`}>
                      {b.sinSenalReciente ? 'Sin señal reciente' : 'En ruta'}
                    </span>
                  </div>
                  <TextoEta eta={etas[b.turnoId]} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
