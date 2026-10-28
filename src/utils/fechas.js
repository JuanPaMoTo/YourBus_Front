// Las fechas de los turnos son texto "AAAA-MM-DD" (hora local de la terminal).
// Aquí se trabaja siempre con ese texto, nunca con zonas horarias.

export const NOMBRES_MES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
export const DIAS_CORTOS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

const dos = (n) => String(n).padStart(2, '0');

export const aTexto = (anio, mes, dia) => `${anio}-${dos(mes)}-${dos(dia)}`;

// Fecha de hoy en la zona horaria de la terminal (por defecto, Chile).
export function hoyTexto(zona = 'America/Santiago', ahora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora);
}

export function sumarDias(texto, dias) {
  const [a, m, d] = texto.split('-').map(Number);
  const fecha = new Date(Date.UTC(a, m - 1, d + dias));
  return aTexto(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate());
}

// Lunes de la semana a la que pertenece la fecha.
export function lunesDeLaSemana(texto) {
  const [a, m, d] = texto.split('-').map(Number);
  const diaSemana = new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 = domingo
  return sumarDias(texto, -((diaSemana + 6) % 7));
}

// Semanas del mes para dibujar el calendario (lunes a domingo). Los días de
// relleno de otros meses vienen con `delMes: false`.
export function semanasDelMes(anio, mes) {
  const primero = aTexto(anio, mes, 1);
  let cursor = lunesDeLaSemana(primero);
  const semanas = [];
  do {
    const semana = [];
    for (let i = 0; i < 7; i += 1) {
      const [, m, d] = cursor.split('-').map(Number);
      semana.push({ fecha: cursor, dia: d, delMes: m === mes });
      cursor = sumarDias(cursor, 1);
    }
    semanas.push(semana);
  } while (Number(cursor.split('-')[1]) === mes);
  return semanas;
}

export function primerYUltimoDia(anio, mes) {
  const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  return { desde: aTexto(anio, mes, 1), hasta: aTexto(anio, mes, ultimo) };
}

export function formatearFecha(texto) {
  const [a, m, d] = texto.split('-').map(Number);
  const fecha = new Date(Date.UTC(a, m - 1, d));
  const diaSemana = new Intl.DateTimeFormat('es-CL', { weekday: 'long', timeZone: 'UTC' }).format(fecha);
  return `${diaSemana} ${d} de ${NOMBRES_MES[m - 1]}`;
}
