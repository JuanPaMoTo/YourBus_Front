import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Mapa from '../pages/Mapa';
import { crearApiMock, renderConSesion } from './helpers';

const apiMock = crearApiMock();
vi.mock('../services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  api: new Proxy({}, { get: (_, nombre) => apiMock[nombre] }),
}));
// Leaflet necesita un navegador real: aquí se reemplaza por un marcador de posición.
vi.mock('../components/MapaVivo', () => ({
  default: ({ buses, paraderoId }) => (
    <div data-testid="mapa">
      {buses.length} buses · paradero {paraderoId}
    </div>
  ),
}));

const RUTAS = [{ id: 'r1', codigo: 'L1', nombre: 'Terminal Norte - Centro' }];
const PARADEROS = [
  { id: 'p1', nombre: 'Terminal Norte', orden: 1, lat: -33.4015, lng: -70.6545 },
  { id: 'p2', nombre: 'Plaza Central', orden: 2, lat: -33.4372, lng: -70.6506 },
];
const BUS = { turnoId: 't1', placa: 'ABCD-11', lat: -33.41, lng: -70.65, sinSenalReciente: false };

beforeEach(() => {
  localStorage.clear();
  Object.values(apiMock).forEach((f) => f.mockReset?.());
  apiMock.getRutas.mockResolvedValue(RUTAS);
  apiMock.getParaderos.mockResolvedValue(PARADEROS);
  apiMock.getBusesActivos.mockResolvedValue([]);
});

describe('Mapa y ETA (pasajero)', () => {
  it('carga la ruta, sus paraderos y avisa si no hay buses circulando', async () => {
    renderConSesion(<Mapa />);
    expect(await screen.findByText(/No hay buses en recorrido/)).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: '2. Plaza Central' })).toBeInTheDocument();
    expect(apiMock.getParaderos).toHaveBeenCalledWith('r1');
  });

  it('muestra cada bus en ruta con su ETA por calles', async () => {
    apiMock.getBusesActivos.mockResolvedValue([BUS]);
    apiMock.getEtaBus.mockResolvedValue({
      estado: 'en_camino',
      minutos: 8,
      distanciaMetros: 2540,
      paradasHastaLlegar: 2,
      metodo: 'osrm',
    });
    renderConSesion(<Mapa />);

    expect(await screen.findByText('ABCD-11')).toBeInTheDocument();
    expect(await screen.findByText('8 min')).toBeInTheDocument();
    expect(screen.getByText(/2\.5 km por calles · 2 paradas/)).toBeInTheDocument();
    expect(apiMock.getEtaBus).toHaveBeenCalledWith('t1', 'p1');
    expect(screen.queryByText(/Aproximado/)).not.toBeInTheDocument();
  });

  it('avisa cuando el ETA es una estimación (el servicio de mapas no respondió)', async () => {
    apiMock.getBusesActivos.mockResolvedValue([BUS]);
    apiMock.getEtaBus.mockResolvedValue({
      estado: 'en_camino',
      minutos: 12,
      distanciaMetros: 3000,
      paradasHastaLlegar: 1,
      metodo: 'estimacion_lineal',
    });
    renderConSesion(<Mapa />);
    expect(await screen.findByText(/Aproximado/)).toBeInTheDocument();
  });

  it('si el bus ya pasó lo dice, y al cambiar de paradero consulta de nuevo', async () => {
    apiMock.getBusesActivos.mockResolvedValue([BUS]);
    apiMock.getEtaBus.mockImplementation(async (turno, paradero) =>
      paradero === 'p1' ? { estado: 'ya_paso' } : { estado: 'en_camino', minutos: 5, distanciaMetros: 900, paradasHastaLlegar: 1, metodo: 'osrm' }
    );
    renderConSesion(<Mapa />);
    expect(await screen.findByText('Ya pasó por este paradero')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Mi paradero'), 'p2');
    expect(await screen.findByText('5 min')).toBeInTheDocument();
    await waitFor(() => expect(apiMock.getEtaBus).toHaveBeenCalledWith('t1', 'p2'));
  });

  it('marca un bus sin señal reciente', async () => {
    apiMock.getBusesActivos.mockResolvedValue([{ ...BUS, sinSenalReciente: true }]);
    apiMock.getEtaBus.mockResolvedValue({ estado: 'sin_ubicacion' });
    renderConSesion(<Mapa />);
    expect(await screen.findByText('Sin señal reciente')).toBeInTheDocument();
  });
});
