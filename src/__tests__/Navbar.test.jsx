import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from '../components/Navbar';
import { ADMIN, CONDUCTOR, PASAJERO, crearApiMock, renderConSesion } from './helpers';

const apiMock = crearApiMock();
vi.mock('../services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  api: new Proxy({}, { get: (_, nombre) => apiMock[nombre] }),
}));

beforeEach(() => localStorage.clear());

describe('Navbar', () => {
  it('muestra el nombre de la marca', () => {
    renderConSesion(<Navbar />);
    expect(screen.getByText('YourBus')).toBeInTheDocument();
  });

  it('incluye los enlaces principales de navegación', () => {
    renderConSesion(<Navbar />);
    expect(screen.getByText('Rutas')).toBeInTheDocument();
    expect(screen.getByText('Horarios')).toBeInTheDocument();
    expect(screen.getByText('Mapa y ETA')).toBeInTheDocument();
  });

  it('sin sesión ofrece "Ingresar" y oculta las secciones de operación', () => {
    renderConSesion(<Navbar />);
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
    expect(screen.queryByText('Mis turnos')).not.toBeInTheDocument();
    expect(screen.queryByText('Flota')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument();
  });

  it('el conductor ve "Mis turnos" y no las secciones del administrador', () => {
    renderConSesion(<Navbar />, { usuario: CONDUCTOR, api: apiMock });
    expect(screen.getByText('Mis turnos')).toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.getByText(/Carlos Conductor/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
  });

  it('el administrador ve Turnos, Usuarios y Flota', () => {
    renderConSesion(<Navbar />, { usuario: ADMIN, api: apiMock });
    expect(screen.getByText('Turnos')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Flota')).toBeInTheDocument();
    expect(screen.queryByText('Ingresar')).not.toBeInTheDocument();
  });

  it('el pasajero no tiene secciones extra', () => {
    renderConSesion(<Navbar />, { usuario: PASAJERO, api: apiMock });
    expect(screen.queryByText('Mis turnos')).not.toBeInTheDocument();
    expect(screen.queryByText('Turnos')).not.toBeInTheDocument();
  });
});
