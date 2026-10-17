// Configuración central para conectar el FRONT con el BACK.
//
// El pipeline compila el front UNA sola vez y ese mismo build se despliega en
// DEV, QA y PROD. Por eso la URL del backend no se fija al compilar: se elige
// aquí, en el navegador, según el dominio donde esté abierto el front.
//
// En local (localhost) se usa VITE_API_URL del archivo .env, o el valor por
// defecto de abajo si no existe.

const BACKENDS_POR_DOMINIO = {
  'yourbus-front-dev-cvesf3apbsa9gpcg.chilecentral-01.azurewebsites.net':
    'https://yourbus-back-dev-bqhfb6hghpg3h7a2.chilecentral-01.azurewebsites.net/api',
  'yourbus-front-qa-b4cue0d0a9c0ghc0.chilecentral-01.azurewebsites.net':
    'https://yourbus-back-qa2-hqhuezhzaeceajd8.chilecentral-01.azurewebsites.net/api',
  'yourbus-front-prod-ckeqapbpexdpfkbb.chilecentral-01.azurewebsites.net':
    'https://yourbus-back-prod-h7a6hwhhhfd0ere0.chilecentral-01.azurewebsites.net/api',
};

function resolverApiUrl() {
  debugger;
  const dominio =
    typeof window !== 'undefined' ? window.location.hostname : '';
  return (
    BACKENDS_POR_DOMINIO[dominio] ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000/api'
  );
}

const API_URL = resolverApiUrl();

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