import { describe, expect, it } from 'vitest';
import { etiquetaTipo, tiempoRelativo, TIPOS_INCIDENTE } from '../utils/incidentes';

describe('etiquetaTipo', () => {
  it('devuelve la etiqueta en español de cada tipo', () => {
    expect(TIPOS_INCIDENTE.map((t) => t.valor)).toEqual(['accidente', 'bloqueo', 'clima', 'retraso', 'otro']);
    expect(etiquetaTipo('accidente')).toBe('Accidente');
    expect(etiquetaTipo('clima')).toBe('Clima');
  });

  it('un tipo desconocido se muestra como "Otro"', () => {
    expect(etiquetaTipo('ovni')).toBe('Otro');
  });
});

describe('tiempoRelativo', () => {
  const ahora = new Date('2026-11-03T12:00:00Z').getTime();
  const hace = (min) => new Date(ahora - min * 60000).toISOString();

  it('expresa minutos, horas y días', () => {
    expect(tiempoRelativo(hace(0), ahora)).toBe('justo ahora');
    expect(tiempoRelativo(hace(5), ahora)).toBe('hace 5 min');
    expect(tiempoRelativo(hace(125), ahora)).toBe('hace 2 h');
    expect(tiempoRelativo(hace(60 * 50), ahora)).toBe('hace 2 d');
  });

  it('una fecha futura o inválida no rompe', () => {
    expect(tiempoRelativo(hace(-10), ahora)).toBe('justo ahora');
    expect(tiempoRelativo('no-es-fecha', ahora)).toBe('');
    expect(tiempoRelativo(undefined, ahora)).toBe('');
  });
});
