import { describe, it, expect } from 'vitest';
import { distanciaMetros, formatearDistancia, paraderoMasCercano } from '../utils/geo';

const PLAZA = { lat: -33.4372, lng: -70.6506 };
const ESTACION = { lat: -33.4528, lng: -70.6783 };

describe('utils/geo', () => {
  it('calcula la distancia en línea recta', () => {
    const d = distanciaMetros(PLAZA, ESTACION);
    expect(d).toBeGreaterThan(2900);
    expect(d).toBeLessThan(3400);
    expect(distanciaMetros(PLAZA, PLAZA)).toBe(0);
  });

  it('elige el paradero más cercano e ignora los que no tienen coordenadas', () => {
    const paraderos = [
      { id: 'a', nombre: 'Sin coordenadas' },
      { id: 'b', nombre: 'Lejos', ...ESTACION },
      { id: 'c', nombre: 'Cerca', lat: -33.4375, lng: -70.6504 },
    ];
    const r = paraderoMasCercano(PLAZA, paraderos);
    expect(r.paradero.id).toBe('c');
    expect(r.distancia).toBeLessThan(100);
    expect(paraderoMasCercano(PLAZA, [{ id: 'a' }])).toBeNull();
    expect(paraderoMasCercano(PLAZA, [])).toBeNull();
  });

  it('formatea distancias', () => {
    expect(formatearDistancia(350.4)).toBe('350 m');
    expect(formatearDistancia(2540)).toBe('2.5 km');
    expect(formatearDistancia(null)).toBe('—');
  });
});
