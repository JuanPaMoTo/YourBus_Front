const RADIO_TIERRA_M = 6371000;
const aRadianes = (g) => (g * Math.PI) / 180;

// Distancia en línea recta entre dos puntos {lat, lng}, en metros.
export function distanciaMetros(a, b) {
  const dLat = aRadianes(b.lat - a.lat);
  const dLng = aRadianes(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(h));
}

// Paradero (con lat/lng) más cercano a un punto; null si ninguno tiene coordenadas.
export function paraderoMasCercano(punto, paraderos) {
  let mejor = null;
  for (const p of paraderos) {
    if (typeof p.lat !== 'number' || typeof p.lng !== 'number') continue;
    const distancia = distanciaMetros(punto, p);
    if (!mejor || distancia < mejor.distancia) mejor = { paradero: p, distancia };
  }
  return mejor;
}

export function formatearDistancia(metros) {
  if (metros == null) return '—';
  return metros < 1000 ? `${Math.round(metros)} m` : `${(metros / 1000).toFixed(1)} km`;
}
