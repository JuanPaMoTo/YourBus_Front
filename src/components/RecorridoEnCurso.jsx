import { useEffect, useState } from 'react';
import { useEnvioUbicacion } from '../hooks/useEnvioUbicacion';
import { formatearDistancia } from '../utils/geo';

const hora = (fecha) =>
  fecha ? fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

// Panel del conductor mientras su turno está en curso: transmite el GPS y
// muestra el estado del envío y el próximo paradero.
export default function RecorridoEnCurso({ turno, onFinalizar, onPerdido, ocupado }) {
  const { posicion, errorGps, ultimoEnvio, errorEnvio, proximoParadero, pantallaActiva } =
    useEnvioUbicacion(turno.id, true, { alPerderTurno: onPerdido });

  // Reloj para mostrar "hace X s" sin esperar a un nuevo envío
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const segundos = ultimoEnvio ? Math.max(0, Math.round((ahora - ultimoEnvio.getTime()) / 1000)) : null;

  let estado;
  if (errorGps) estado = { clase: 'mal', texto: errorGps };
  else if (!posicion) estado = { clase: 'espera', texto: 'Buscando señal GPS…' };
  else if (errorEnvio) estado = { clase: 'mal', texto: `No se pudo enviar la ubicación: ${errorEnvio}` };
  else if (!ultimoEnvio) estado = { clase: 'espera', texto: 'GPS listo, enviando…' };
  else estado = { clase: 'ok', texto: `Transmitiendo · último envío hace ${segundos} s` };

  return (
    <div className="recorrido-panel" aria-live="polite">
      <div className="recorrido-top">
        <span className="badge badge-live">Recorrido en curso</span>
        <strong>
          {turno.ruta.codigo} · {turno.bus.placa}
        </strong>
      </div>

      <p className={`recorrido-estado ${estado.clase}`}>{estado.texto}</p>

      <dl className="recorrido-datos">
        <div>
          <dt>Próximo paradero</dt>
          <dd>
            {proximoParadero
              ? `${proximoParadero.nombre} (${formatearDistancia(proximoParadero.distanciaMetros)})`
              : 'Último paradero alcanzado'}
          </dd>
        </div>
        <div>
          <dt>Último envío</dt>
          <dd>{hora(ultimoEnvio)}</dd>
        </div>
        <div>
          <dt>Precisión GPS</dt>
          <dd>{posicion && posicion.precision != null ? `${Math.round(posicion.precision)} m` : '—'}</dd>
        </div>
      </dl>

      {!pantallaActiva && (
        <p className="recorrido-aviso">
          Mantén esta pantalla encendida: si el teléfono se bloquea, el GPS puede dejar de
          transmitir.
        </p>
      )}

      <button type="button" className="btn-solid btn-peligro" onClick={onFinalizar} disabled={ocupado}>
        Finalizar recorrido
      </button>
    </div>
  );
}
