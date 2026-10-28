import { useEffect, useState } from 'react';

const MENSAJES = {
  1: 'Permiso de ubicación denegado. Actívalo en el navegador para continuar.',
  2: 'No se pudo determinar la ubicación (¿sin señal GPS?).',
  3: 'La ubicación tardó demasiado en responder.',
};

// Sigue la posición del dispositivo mientras `activo` sea true.
// Devuelve { posicion, error } con posicion = { lat, lng, velocidad, rumbo, precision, momento }.
export function useGeolocalizacion(activo) {
  const [estado, setEstado] = useState({ posicion: null, error: null });
  const soportado = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  useEffect(() => {
    if (!activo || !soportado) return undefined;
    const id = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) =>
        setEstado({
          error: null,
          posicion: {
            lat: coords.latitude,
            lng: coords.longitude,
            velocidad: coords.speed,
            rumbo: coords.heading,
            precision: coords.accuracy,
            momento: timestamp,
          },
        }),
      (err) =>
        setEstado((previo) => ({
          ...previo,
          error: MENSAJES[err.code] || 'No se pudo obtener la ubicación.',
        })),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [activo, soportado]);

  if (activo && !soportado) {
    return { posicion: null, error: 'Este dispositivo no permite obtener la ubicación.' };
  }
  return estado;
}
