// Pantalla a la que va cada rol después de iniciar sesión.
export function rutaInicial(rol) {
  if (rol === 'admin') return '/admin/turnos';
  if (rol === 'conductor') return '/conductor';
  return '/mapa';
}
