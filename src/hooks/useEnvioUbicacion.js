import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useGeolocalizacion } from './useGeolocalizacion';

/**
 * Polling GPS del conductor: mientras `activo`, sigue la posición del teléfono y
 * la envía al servidor cada `intervaloMs` (aunque no se mueva, como "latido",
 * para que los pasajeros sepan que el bus sigue transmitiendo).
 *
 * Mantiene la pantalla encendida (Wake Lock) porque la mayoría de los
 * navegadores dejan de reportar ubicación con la pantalla apagada.
 */
export function useEnvioUbicacion(turnoId, activo, { intervaloMs = 5000, alPerderTurno } = {}) {
  const { posicion, error: errorGps } = useGeolocalizacion(activo);
  const posicionRef = useRef(null);
  const perderRef = useRef(alPerderTurno);
  const [envio, setEnvio] = useState({
    ultimoEnvio: null,
    errorEnvio: null,
    proximoParadero: null,
    ultimoParaderoOrden: 0,
    pantallaActiva: false,
  });

  useEffect(() => {
    posicionRef.current = posicion;
    perderRef.current = alPerderTurno;
  });

  // Envío periódico
  useEffect(() => {
    if (!activo) return undefined;
    let cancelado = false;

    const enviar = async () => {
      const p = posicionRef.current;
      if (!p) return;
      try {
        const r = await api.enviarUbicacion(turnoId, {
          lat: p.lat,
          lng: p.lng,
          velocidad: p.velocidad,
          rumbo: p.rumbo,
          precision: p.precision,
        });
        if (cancelado) return;
        setEnvio((previo) => ({
          ...previo,
          ultimoEnvio: new Date(),
          errorEnvio: null,
          proximoParadero: r.proximoParadero,
          ultimoParaderoOrden: r.ultimoParaderoOrden,
        }));
      } catch (err) {
        if (cancelado) return;
        // 409: el turno ya no está en curso (lo finalizó el sistema u otro dispositivo)
        if (err.status === 409 && perderRef.current) perderRef.current();
        setEnvio((previo) => ({ ...previo, errorEnvio: err.message }));
      }
    };

    const id = setInterval(enviar, intervaloMs);
    // Primer envío apenas haya posición (sin esperar al primer intervalo completo)
    const primero = setTimeout(enviar, 1500);
    return () => {
      cancelado = true;
      clearInterval(id);
      clearTimeout(primero);
    };
  }, [turnoId, activo, intervaloMs]);

  // Pantalla encendida mientras dure el recorrido
  useEffect(() => {
    if (!activo || !('wakeLock' in navigator)) return undefined;
    let candado = null;
    let terminado = false;

    const pedir = async () => {
      try {
        candado = await navigator.wakeLock.request('screen');
        if (!terminado) setEnvio((previo) => ({ ...previo, pantallaActiva: true }));
      } catch {
        // el navegador puede negarlo (ahorro de batería): no es crítico
      }
    };
    // El candado se pierde al ocultar la pestaña; se vuelve a pedir al volver.
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') pedir();
    };

    pedir();
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      terminado = true;
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      if (candado) candado.release().catch(() => {});
    };
  }, [activo]);

  return { posicion, errorGps, ...envio };
}
