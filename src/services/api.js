// Configuración central para conectar el FRONT con el BACK.
//
// El pipeline compila el front UNA sola vez y ese mismo build se despliega en
// DEV, QA y PROD. Por eso la URL del backend no se fija al compilar: se elige
// aquí, en el navegador, según el dominio donde esté abierto el front.
//
// En local (localhost) se usa VITE_API_URL del archivo .env, o el valor por
// defecto de abajo si no existe.

export const BACKENDS_POR_DOMINIO = {
  'yourbus-front-dev-cvesf3apbsa9gpcg.chilecentral-01.azurewebsites.net':
    'https://yourbus-back-dev-bqhfb6hghpg3h7a2.chilecentral-01.azurewebsites.net/api',
  'yourbus-front-qa-b4cue0d0a9c0ghc0.chilecentral-01.azurewebsites.net':
    'https://yourbus-back-qa2-hqhuezhzaeceajd8.chilecentral-01.azurewebsites.net/api',
  'yourbus-front-prod-ckeqapbpexdpfkbb.chilecentral-01.azurewebsites.net':
    'https://yourbus-back-prod-h7a6hwhhhfd0ere0.chilecentral-01.azurewebsites.net/api',
};

// Recibe el dominio y la URL de .env como parámetros para poder probarla;
// por defecto usa los valores reales del navegador.
export function resolverApiUrl(
  dominio = typeof window !== 'undefined' ? window.location.hostname : '',
  urlEnv = import.meta.env.VITE_API_URL
) {
  return BACKENDS_POR_DOMINIO[dominio] || urlEnv || 'http://localhost:4000/api';
}

const API_URL = resolverApiUrl();

// --- Sesión -----------------------------------------------------------------
// El token vive en memoria y en localStorage (para sobrevivir a recargas).
// localStorage puede no estar disponible (modo privado, bloqueado): siempre
// dentro de try/catch y la app funciona igual, solo que sin recordar la sesión.
const CLAVE_SESION = 'yourbus.sesion';
let token = null;
let alExpirarSesion = null;

export function leerSesionGuardada() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}

// Solo se guardan los campos conocidos y siempre como texto (nunca el objeto crudo
// de la respuesta del servidor).
function sesionSegura(sesion) {
  const { id, nombre, email, rol } = sesion.usuario || {};
  return {
    token: String(sesion.token),
    usuario: { id: String(id), nombre: String(nombre), email: String(email), rol: String(rol) },
  };
}

export function guardarSesion(sesion) {
  token = sesion ? sesion.token : null;
  try {
    if (sesion) localStorage.setItem(CLAVE_SESION, JSON.stringify(sesionSegura(sesion)));
    else localStorage.removeItem(CLAVE_SESION);
  } catch {
    // sin almacenamiento: la sesión dura solo mientras la pestaña esté abierta
  }
}

// El AuthProvider registra aquí qué hacer cuando el servidor responde 401.
export function onSesionExpirada(callback) {
  alExpirarSesion = callback;
}

const inicial = leerSesionGuardada();
if (inicial) token = inicial.token;

// --- Peticiones ---------------------------------------------------------------

export class ErrorApi extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const { body, headers, ...resto } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...resto,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

  let datos = null;
  try {
    datos = await res.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    // Una sesión vencida solo importa si había una sesión (no en el login mismo).
    if (res.status === 401 && token && alExpirarSesion) alExpirarSesion();
    throw new ErrorApi(
      (datos && datos.error) || `Error en la petición: ${res.status}`,
      res.status
    );
  }
  return datos;
}

const enviar = (method, path, body) => request(path, { method, body });

const consulta = (params) => {
  const texto = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString();
  return texto ? `?${texto}` : '';
};

export const api = {
  // Público
  getRutas: () => request('/rutas'),
  getParaderos: (rutaId) => request(`/rutas/${rutaId}/paraderos`),
  getHorarios: (rutaId) => request(`/rutas/${rutaId}/horarios`),
  getBusesActivos: (rutaId) => request(`/rutas/${rutaId}/buses-activos`),
  getUbicacionBus: (busId) => request(`/buses/${busId}/ubicacion`),
  getEta: (paraderoId) => request(`/paraderos/${paraderoId}/eta`),
  getEtaBus: (turnoId, paraderoId) =>
    request(`/turnos/${turnoId}/eta${consulta({ paraderoId })}`),
  getEstadoRuta: (rutaId) => request(`/rutas/${rutaId}/estado`),

  // Sesión
  login: (email, password) => enviar('POST', '/auth/login', { email, password }),
  registro: (datos) => enviar('POST', '/auth/registro', datos),
  yo: () => request('/auth/me'),

  // Conductor
  misTurnos: (rango = {}) => request(`/turnos/mios${consulta(rango)}`),
  iniciarTurno: (id) => enviar('POST', `/turnos/${id}/iniciar`),
  enviarUbicacion: (id, posicion) => enviar('POST', `/turnos/${id}/ubicacion`, posicion),
  finalizarTurno: (id) => enviar('POST', `/turnos/${id}/finalizar`),

  // Administrador de la terminal
  getTurnos: (filtros = {}) => request(`/turnos${consulta(filtros)}`),
  crearTurno: (datos) => enviar('POST', '/turnos', datos),
  editarTurno: (id, datos) => enviar('PUT', `/turnos/${id}`, datos),
  cancelarTurno: (id) => enviar('POST', `/turnos/${id}/cancelar`),
  eliminarTurno: (id) => enviar('DELETE', `/turnos/${id}`),
  getUsuarios: (rol) => request(`/usuarios${consulta({ rol })}`),
  crearUsuario: (datos) => enviar('POST', '/usuarios', datos),
  cambiarActivoUsuario: (id, activo) => enviar('PATCH', `/usuarios/${id}`, { activo }),
  getBuses: () => request('/buses'),
  registrarBus: (data) => enviar('POST', '/buses', data),
};
