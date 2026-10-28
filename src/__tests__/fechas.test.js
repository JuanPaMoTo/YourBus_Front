import { describe, it, expect } from 'vitest';
import {
  aTexto,
  formatearFecha,
  hoyTexto,
  lunesDeLaSemana,
  primerYUltimoDia,
  semanasDelMes,
  sumarDias,
} from '../utils/fechas';

describe('utils/fechas', () => {
  it('suma días cruzando meses, años y bisiestos', () => {
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01');
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarDias('2028-02-28', 1)).toBe('2028-02-29');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('encuentra el lunes de la semana (el domingo pertenece a la semana anterior)', () => {
    expect(lunesDeLaSemana('2026-10-27')).toBe('2026-10-26'); // martes
    expect(lunesDeLaSemana('2026-10-26')).toBe('2026-10-26'); // lunes
    expect(lunesDeLaSemana('2026-11-01')).toBe('2026-10-26'); // domingo
  });

  it('arma las semanas de octubre de 2026 (lun–dom, con relleno)', () => {
    const semanas = semanasDelMes(2026, 10);
    expect(semanas).toHaveLength(5);
    expect(semanas.every((s) => s.length === 7)).toBe(true);
    // 1 de octubre de 2026 es jueves: la primera semana arranca el lunes 28 de septiembre
    expect(semanas[0][0]).toEqual({ fecha: '2026-09-28', dia: 28, delMes: false });
    expect(semanas[0][3]).toEqual({ fecha: '2026-10-01', dia: 1, delMes: true });
    expect(semanas.flat().filter((d) => d.delMes)).toHaveLength(31);
  });

  it('un mes que empieza en lunes no agrega una semana vacía antes', () => {
    // 1 de junio de 2026 es lunes
    const semanas = semanasDelMes(2026, 6);
    expect(semanas[0][0].fecha).toBe('2026-06-01');
    expect(semanas.flat().filter((d) => d.delMes)).toHaveLength(30);
  });

  it('da el primer y último día del mes', () => {
    expect(primerYUltimoDia(2026, 2)).toEqual({ desde: '2026-02-01', hasta: '2026-02-28' });
    expect(primerYUltimoDia(2028, 2).hasta).toBe('2028-02-29');
  });

  it('"hoy" respeta la zona horaria de la terminal', () => {
    const instante = new Date('2026-10-27T02:30:00Z');
    expect(hoyTexto('America/Santiago', instante)).toBe('2026-10-26');
    expect(hoyTexto('UTC', instante)).toBe('2026-10-27');
  });

  it('formatea y rellena con ceros', () => {
    expect(aTexto(2026, 3, 5)).toBe('2026-03-05');
    expect(formatearFecha('2026-10-27')).toBe('martes 27 de octubre');
  });
});
