import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminTurnos from '../pages/AdminTurnos';
import AdminUsuarios from '../pages/AdminUsuarios';
import { hoyTexto } from '../utils/fechas';
import { ADMIN, crearApiMock, renderConSesion } from './helpers';

const apiMock = crearApiMock();
vi.mock('../services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  api: new Proxy({}, { get: (_, nombre) => apiMock[nombre] }),
}));

const HOY = hoyTexto();
const CONDUCTORES = [
  { id: 'c1', nombre: 'Carlos Ruiz', rol: 'conductor', activo: true },
  { id: 'c2', nombre: 'Dada de baja', rol: 'conductor', activo: false },
];
const RUTAS = [{ id: 'r1', codigo: 'L1', nombre: 'Terminal Norte - Centro' }];
const BUSES = [{ id: 'b1', placa: 'ABCD-11', empresa: 'Norte' }];
const TURNO = {
  id: 't1',
  fecha: HOY,
  horaInicio: '08:00',
  horaFin: '12:00',
  estado: 'programado',
  ruta: { id: 'r1', codigo: 'L1', nombre: 'Terminal Norte - Centro' },
  bus: { id: 'b1', placa: 'ABCD-11' },
  conductor: { id: 'c1', nombre: 'Carlos Ruiz' },
};

beforeEach(() => {
  localStorage.clear();
  Object.values(apiMock).forEach((f) => f.mockReset?.());
  apiMock.getUsuarios.mockResolvedValue(CONDUCTORES);
  apiMock.getRutas.mockResolvedValue(RUTAS);
  apiMock.getBuses.mockResolvedValue(BUSES);
  apiMock.getTurnos.mockResolvedValue([TURNO]);
});

const montarTurnos = () => renderConSesion(<AdminTurnos />, { usuario: ADMIN, api: apiMock });

describe('AdminTurnos', () => {
  it('lista los turnos de la semana y ofrece solo conductores activos', async () => {
    montarTurnos();
    expect(await screen.findByText('L1 · ABCD-11')).toBeInTheDocument();
    const conductor = screen.getByLabelText('Conductor');
    await waitFor(() => expect(within(conductor).getByRole('option', { name: 'Carlos Ruiz' })).toBeInTheDocument());
    expect(within(conductor).queryByRole('option', { name: 'Dada de baja' })).not.toBeInTheDocument();
  });

  it('crea un turno con los datos del formulario', async () => {
    apiMock.crearTurno.mockResolvedValue(TURNO);
    montarTurnos();
    await screen.findByRole('option', { name: 'Carlos Ruiz' });

    await userEvent.selectOptions(screen.getByLabelText('Conductor'), 'c1');
    await userEvent.selectOptions(screen.getByLabelText('Ruta'), 'r1');
    await userEvent.selectOptions(screen.getByLabelText('Bus'), 'b1');
    await userEvent.click(screen.getByRole('button', { name: 'Crear turno' }));

    await waitFor(() =>
      expect(apiMock.crearTurno).toHaveBeenCalledWith({
        conductorId: 'c1',
        rutaId: 'r1',
        busId: 'b1',
        fecha: HOY,
        horaInicio: '08:00',
        horaFin: '12:00',
      })
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Turno creado.');
  });

  it('muestra el conflicto de horario que informa el servidor', async () => {
    apiMock.crearTurno.mockRejectedValue(new Error('El conductor ya tiene un turno que se cruza (08:00–12:00) ese día'));
    montarTurnos();
    await screen.findByRole('option', { name: 'Carlos Ruiz' });
    await userEvent.selectOptions(screen.getByLabelText('Conductor'), 'c1');
    await userEvent.selectOptions(screen.getByLabelText('Ruta'), 'r1');
    await userEvent.selectOptions(screen.getByLabelText('Bus'), 'b1');
    await userEvent.click(screen.getByRole('button', { name: 'Crear turno' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('se cruza');
  });

  it('cancela y elimina turnos', async () => {
    apiMock.cancelarTurno.mockResolvedValue({});
    apiMock.eliminarTurno.mockResolvedValue(null);
    montarTurnos();
    await screen.findByText('L1 · ABCD-11');

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(apiMock.cancelarTurno).toHaveBeenCalledWith('t1');
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(apiMock.eliminarTurno).toHaveBeenCalledWith('t1');
  });

  it('un turno en curso no se puede eliminar ni cancelar', async () => {
    apiMock.getTurnos.mockResolvedValue([{ ...TURNO, estado: 'en_curso' }]);
    montarTurnos();
    await screen.findByText('L1 · ABCD-11');
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  it('avisa si faltan conductores, rutas o buses para crear turnos', async () => {
    apiMock.getUsuarios.mockResolvedValue([]);
    montarTurnos();
    expect(await screen.findByText(/necesitas al menos un conductor/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear turno' })).toBeDisabled();
  });
});

describe('AdminUsuarios', () => {
  const USUARIOS = [
    { ...ADMIN },
    { id: 'c1', nombre: 'Carlos Ruiz', email: 'carlos@yourbus.cl', rol: 'conductor', activo: true },
  ];

  it('lista las cuentas y no deja desactivar la propia', async () => {
    apiMock.getUsuarios.mockResolvedValue(USUARIOS);
    renderConSesion(<AdminUsuarios />, { usuario: ADMIN, api: apiMock });
    expect(await screen.findByText('carlos@yourbus.cl')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Desactivar/ })).toHaveLength(1);
  });

  it('crea un conductor', async () => {
    apiMock.getUsuarios.mockResolvedValue(USUARIOS);
    apiMock.crearUsuario.mockResolvedValue({});
    renderConSesion(<AdminUsuarios />, { usuario: ADMIN, api: apiMock });
    await screen.findByText('carlos@yourbus.cl');

    await userEvent.type(screen.getByLabelText('Nombre'), 'Marta Soto');
    await userEvent.type(screen.getByLabelText('Correo'), 'marta@yourbus.cl');
    await userEvent.type(screen.getByLabelText(/Contraseña inicial/), 'clave-conductora-1');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() =>
      expect(apiMock.crearUsuario).toHaveBeenCalledWith({
        nombre: 'Marta Soto',
        email: 'marta@yourbus.cl',
        password: 'clave-conductora-1',
        rol: 'conductor',
      })
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Cuenta de conductor creada para Marta Soto.');
  });

  it('desactiva una cuenta', async () => {
    apiMock.getUsuarios.mockResolvedValue(USUARIOS);
    apiMock.cambiarActivoUsuario.mockResolvedValue({});
    renderConSesion(<AdminUsuarios />, { usuario: ADMIN, api: apiMock });
    await userEvent.click(await screen.findByRole('button', { name: 'Desactivar' }));
    expect(apiMock.cambiarActivoUsuario).toHaveBeenCalledWith('c1', false);
  });
});
