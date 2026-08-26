// Configuración central para conectar el FRONT con el BACK.
// Cuando el equipo de backend entregue la URL real, reemplázala aquí
// o defínela en un archivo .env como VITE_API_URL=http://localhost:3000/api

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`Error en la petición: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getRutas: () => request('/rutas'),
  getParaderos: (rutaId) => request(`/rutas/${rutaId}/paraderos`),
  getHorarios: (rutaId) => request(`/rutas/${rutaId}/horarios`),
  getUbicacionBus: (busId) => request(`/buses/${busId}/ubicacion`),
  getEta: (paraderoId) => request(`/paraderos/${paraderoId}/eta`),
  getEstadoRuta: (rutaId) => request(`/rutas/${rutaId}/estado`),
  registrarBus: (data) =>
    request('/buses', { method: 'POST', body: JSON.stringify(data) }),
};
