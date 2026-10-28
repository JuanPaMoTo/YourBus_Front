import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import RutaProtegida from '../components/RutaProtegida';
import { ErrorApi, leerSesionGuardada } from '../services/api';
import { ADMIN, CONDUCTOR, PASAJERO, crearApiMock, renderConSesion } from './helpers';

const apiMock = crearApiMock();
vi.mock('../services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  api: new Proxy({}, { get: (_, nombre) => apiMock[nombre] }),
}));

const Paginas = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Registro />} />
    <Route path="/conductor" element={<h1>Panel del conductor</h1>} />
    <Route path="/admin/turnos" element={<h1>Panel del admin</h1>} />
    <Route path="/mapa" element={<h1>Mapa del pasajero</h1>} />
    <Route
      path="/privado"
      element={
        <RutaProtegida roles={['admin']}>
          <h1>Zona del administrador</h1>
        </RutaProtegida>
      }
    />
  </Routes>
);

beforeEach(() => {
  localStorage.clear();
  Object.values(apiMock).forEach((f) => f.mockReset?.());
});

async function completarLogin(email, password) {
  await userEvent.type(screen.getByLabelText('Correo'), email);
  await userEvent.type(screen.getByLabelText('Contraseña'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('Login', () => {
  it.each([
    [ADMIN, 'Panel del admin'],
    [CONDUCTOR, 'Panel del conductor'],
    [PASAJERO, 'Mapa del pasajero'],
  ])('lleva a cada rol a su pantalla (%#)', async (usuario, titulo) => {
    apiMock.login.mockResolvedValue({ token: 'tok', usuario });
    renderConSesion(<Paginas />, { ruta: '/login' });
    await completarLogin('x@y.cl', 'clave-larga-1');

    expect(await screen.findByRole('heading', { name: titulo })).toBeInTheDocument();
    expect(apiMock.login).toHaveBeenCalledWith('x@y.cl', 'clave-larga-1');
    // la sesión queda guardada para sobrevivir a una recarga
    expect(leerSesionGuardada()).toMatchObject({ token: 'tok', usuario: { rol: usuario.rol } });
  });

  it('muestra el error del servidor y permite reintentar', async () => {
    apiMock.login.mockRejectedValue(new ErrorApi('Correo o contraseña incorrectos', 401));
    renderConSesion(<Paginas />, { ruta: '/login' });
    await completarLogin('x@y.cl', 'mala-clave-1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
    expect(leerSesionGuardada()).toBeNull();
  });
});

describe('Registro', () => {
  const llenar = async (password, repetir) => {
    await userEvent.type(screen.getByLabelText('Nombre'), 'Paula Pasajera');
    await userEvent.type(screen.getByLabelText('Correo'), 'paula@correo.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), password);
    await userEvent.type(screen.getByLabelText('Repite la contraseña'), repetir);
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  };

  it('no envía si las contraseñas no coinciden', async () => {
    renderConSesion(<Paginas />, { ruta: '/registro' });
    await llenar('clave-larga-1', 'clave-larga-2');
    expect(await screen.findByRole('alert')).toHaveTextContent('no coinciden');
    expect(apiMock.registro).not.toHaveBeenCalled();
  });

  it('crea la cuenta (sin enviar la confirmación ni un rol) y entra como pasajero', async () => {
    apiMock.registro.mockResolvedValue({ token: 'tok', usuario: PASAJERO });
    renderConSesion(<Paginas />, { ruta: '/registro' });
    await llenar('clave-larga-1', 'clave-larga-1');

    expect(await screen.findByRole('heading', { name: 'Mapa del pasajero' })).toBeInTheDocument();
    expect(apiMock.registro).toHaveBeenCalledWith({
      nombre: 'Paula Pasajera',
      email: 'paula@correo.cl',
      password: 'clave-larga-1',
    });
  });
});

describe('RutaProtegida', () => {
  it('sin sesión redirige al login', async () => {
    renderConSesion(<Paginas />, { ruta: '/privado' });
    expect(await screen.findByRole('heading', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('con un rol que no corresponde muestra "Sin permiso"', async () => {
    renderConSesion(<Paginas />, { ruta: '/privado', usuario: CONDUCTOR, api: apiMock });
    expect(await screen.findByRole('heading', { name: 'Sin permiso' })).toBeInTheDocument();
    expect(screen.queryByText('Zona del administrador')).not.toBeInTheDocument();
  });

  it('con el rol correcto muestra la página', async () => {
    renderConSesion(<Paginas />, { ruta: '/privado', usuario: ADMIN, api: apiMock });
    expect(await screen.findByRole('heading', { name: 'Zona del administrador' })).toBeInTheDocument();
  });

  it('al abrir con una sesión guardada refresca los datos del usuario', async () => {
    renderConSesion(<Paginas />, { ruta: '/privado', usuario: ADMIN, api: apiMock });
    await waitFor(() => expect(apiMock.yo).toHaveBeenCalled());
  });
});
