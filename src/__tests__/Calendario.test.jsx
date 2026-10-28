import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Calendario from '../components/Calendario';

const props = (extra = {}) => ({
  anio: 2026,
  mes: 10,
  hoy: '2026-10-27',
  seleccionado: '2026-10-27',
  turnosPorFecha: {
    '2026-10-27': [
      { id: 't1', estado: 'programado' },
      { id: 't2', estado: 'completado' },
    ],
    '2026-10-29': [{ id: 't3', estado: 'cancelado' }],
  },
  onSeleccionar: vi.fn(),
  onCambiarMes: vi.fn(),
  ...extra,
});

describe('Calendario', () => {
  it('muestra el mes y los días de la semana de lunes a domingo', () => {
    render(<Calendario {...props()} />);
    expect(screen.getByRole('heading', { name: /octubre 2026/i })).toBeInTheDocument();
    const encabezados = screen.getAllByRole('columnheader').map((e) => e.textContent);
    expect(encabezados).toEqual(['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']);
  });

  it('indica cuántos turnos tiene cada día (accesible) y marca el día seleccionado', () => {
    render(<Calendario {...props()} />);
    const dia27 = screen.getByRole('gridcell', { name: '27 de octubre, 2 turnos' });
    expect(dia27).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('gridcell', { name: '29 de octubre, 1 turno' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: '28 de octubre' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('avisa qué día se elige y cuándo se cambia de mes', async () => {
    const onSeleccionar = vi.fn();
    const onCambiarMes = vi.fn();
    render(<Calendario {...props({ onSeleccionar, onCambiarMes })} />);

    await userEvent.click(screen.getByRole('gridcell', { name: '29 de octubre, 1 turno' }));
    expect(onSeleccionar).toHaveBeenCalledWith('2026-10-29');

    await userEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(onCambiarMes).toHaveBeenCalledWith(1);
    await userEvent.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(onCambiarMes).toHaveBeenCalledWith(-1);
  });
});
