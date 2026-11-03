// Tipos de incidente que acepta el backend (deben coincidir con models/Incidente.js).
export const TIPOS_INCIDENTE = [
  { valor: 'accidente', etiqueta: 'Accidente' },
  { valor: 'bloqueo', etiqueta: 'Bloqueo' },
  { valor: 'clima', etiqueta: 'Clima' },
  { valor: 'retraso', etiqueta: 'Retraso' },
  { valor: 'otro', etiqueta: 'Otro' },
];

export const MAX_DESCRIPCION = 280;

export function etiquetaTipo(tipo) {
  const encontrado = TIPOS_INCIDENTE.find((t) => t.valor === tipo);
  return encontrado ? encontrado.etiqueta : 'Otro';
}

// "hace 5 min", "hace 2 h"... a partir de una fecha ISO. `ahora` se puede inyectar para probar.
export function tiempoRelativo(iso, ahora = Date.now()) {
  const marca = new Date(iso).getTime();
  if (!iso || Number.isNaN(marca)) return '';
  const minutos = Math.max(0, Math.floor((ahora - marca) / 60000));
  if (minutos < 1) return 'justo ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} d`;
}
