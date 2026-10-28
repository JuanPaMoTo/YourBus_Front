import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConductorTurnos from '../pages/ConductorTurnos';
import { hoyTexto } from '../utils/fechas';
import { CONDUCTOR, crearApiMock, renderConSesion } from './helpers';

const apiMock = crearApiMock();
vi.mock('../services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  api: new Proxy({}, { get: (_, nombre) => apiMock[nombre] }),
}));

const HOY = hoyTexto();
const turno = (extra = {}) => ({
  id: 't1',
  fecha: HOY,
  horaInicio: '08:00',
  horaFin: '12:00',
  estado: 'programado',
  ruta: { id: 'r1', codigo: 'L1', nombre: 'Terminal Norte - Centro' },
  bus: { id: 'b1', placa: 'ABCD-11', empresa: 'Norte' },
  conductor: { id: 'u2', nombre: 'Carlos' },
  ...extra,
});

// GPS simulado: el navegador entrega una posición apenas se le pide seguirla.
function simularGps() {
  const watchPosition = vi.fn((exito) => {
    exito({
      coords: { latitude: -33.4, longitude: -70.65, speed: 7, heading: 90, accuracy: 12 },
      timestamp: Date.now(),
    });
    return 1;
  });
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { watchPosition, clearWatch: vi.fn() },
  });
  return watchPosition;
}

beforeEach(() => {
  localStorage.clear();
  Object.values(apiMock).forEach((f) => f.mockReset?.());
});

afterEach(() => vi.useRealTimers());

describe('Mis turnos (conductor)', () => {
  it('muestra el calendario y los turnos del día seleccionado', async () => {
    apiMock.misTurnos.mockResolvedValue([turno()]);
    renderConSesion(<ConductorTurnos />, { usuario: CONDUCTOR, api: apiMock });

    expect(await screen.findByText('L1 · Terminal Norte - Centro')).toBeInTheDocument();
    expect(screen.getByText('Bus ABCD-11')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar recorrido' })).toBeEnabled();
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });

  it('un día sin turnos lo dice', async () => {
    apiMock.misTurnos.mockResolvedValue([]);
    renderConSesion(<ConductorTurnos />, { usuario: CONDUCTOR, api: apiMock });
    expect(await screen.findByText('No tienes turnos este día.')).toBeInTheDocument();
  });

  it('solo permite iniciar turnos de hoy', async () => {
    apiMock.misTurnos.mockResolvedValue([turno({ fecha: '2099-01-01', id: 'futuro' })]);
    renderConSesion(<ConductorTurnos />, { usuario: CONDUCTOR, api: apiMock });
    await screen.findByText('No tienes turnos este día.');
    expect(screen.queryByRole('button', { name: 'Iniciar recorrido' })).not.toBeInTheDocument();
  });

  it('inicia el recorrido, transmite el GPS y permite finalizar', async () => {
    const watch = simularGps();
    const enCurso = turno({ estado: 'en_curso' });
    // 1.ª carga: programado; después de iniciar: en curso; después de finalizar: completado
    apiMock.misTurnos
      .mockResolvedValueOnce([turno()])
      .mockResolvedValueOnce([turno()])
      .mockResolvedValue([enCurso]);
    apiMock.iniciarTurno.mockResolvedValue({ id: 't1', estado: 'en_curso' });
    apiMock.enviarUbicacion.mockResolvedValue({
      ok: true,
      ultimoParaderoOrden: 0,
      proximoParadero: { nombre: 'Terminal Norte', orden: 1, distanciaMetros: 850 },
    });
    apiMock.finalizarTurno.mockResolvedValue({ id: 't1', estado: 'completado' });

    renderConSesion(<ConductorTurnos />, { usuario: CONDUCTOR, api: apiMock });
    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar recorrido' }));
    expect(apiMock.iniciarTurno).toHaveBeenCalledWith('t1');

    // aparece el panel del recorrido y se empieza a seguir el GPS
    const panel = await screen.findByText('Recorrido en curso');
    expect(panel).toBeInTheDocument();
    await waitFor(() => expect(watch).toHaveBeenCalled());

    // primer envío (≈1,5 s después de tener posición), con los datos del dispositivo
    await waitFor(() => expect(apiMock.enviarUbicacion).toHaveBeenCalled(), { timeout: 4000 });
    expect(apiMock.enviarUbicacion).toHaveBeenCalledWith('t1', {
      lat: -33.4,
      lng: -70.65,
      velocidad: 7,
      rumbo: 90,
      precision: 12,
    });
    expect(await screen.findByText(/Terminal Norte \(850 m\)/)).toBeInTheDocument();
    expect(screen.getByText(/Transmitiendo/)).toBeInTheDocument();

    // mientras hay un recorrido en curso no se puede iniciar otro turno
    await userEvent.click(screen.getByRole('button', { name: 'Finalizar recorrido' }));
    expect(apiMock.finalizarTurno).toHaveBeenCalledWith('t1');
  });

  it('si el permiso de ubicación se deniega, lo explica al conductor', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        watchPosition: vi.fn((_, error) => {
          error({ code: 1 });
          return 1;
        }),
        clearWatch: vi.fn(),
      },
    });
    apiMock.misTurnos.mockResolvedValue([turno({ estado: 'en_curso' })]);
    renderConSesion(<ConductorTurnos />, { usuario: CONDUCTOR, api: apiMock });

    const panel = (await screen.findByText('Recorrido en curso')).closest('.recorrido-panel');
    expect(await within(panel).findByText(/Permiso de ubicación denegado/)).toBeInTheDocument();
    expect(apiMock.enviarUbicacion).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor si no se puede iniciar', async () => {
    apiMock.misTurnos.mockResolvedValue([turno()]);
    apiMock.iniciarTurno.mockRejectedValue(new Error('Ya tienes un recorrido en curso'));
    renderConSesion(<ConductorTurnos />, { usuario: CONDUCTOR, api: apiMock });
    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar recorrido' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya tienes un recorrido en curso');
  });
});
