import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../context/AuthProvider';
import { guardarSesion } from '../services/api';

export const ADMIN = { id: 'u1', nombre: 'Ana Admin', email: 'ana@yourbus.cl', rol: 'admin', activo: true };
export const CONDUCTOR = { id: 'u2', nombre: 'Carlos Conductor', email: 'carlos@yourbus.cl', rol: 'conductor', activo: true };
export const PASAJERO = { id: 'u3', nombre: 'Paula Pasajera', email: 'paula@correo.cl', rol: 'pasajero', activo: true };

// Mock de la capa de API: cada prueba define lo que necesita con mockResolvedValue.
export function crearApiMock() {
  return {
    login: vi.fn(),
    registro: vi.fn(),
    yo: vi.fn(),
    getRutas: vi.fn().mockResolvedValue([]),
    getParaderos: vi.fn().mockResolvedValue([]),
    getBusesActivos: vi.fn().mockResolvedValue([]),
    getEtaBus: vi.fn(),
    misTurnos: vi.fn().mockResolvedValue([]),
    iniciarTurno: vi.fn(),
    finalizarTurno: vi.fn(),
    enviarUbicacion: vi.fn(),
    getTurnos: vi.fn().mockResolvedValue([]),
    crearTurno: vi.fn(),
    cancelarTurno: vi.fn(),
    eliminarTurno: vi.fn(),
    getUsuarios: vi.fn().mockResolvedValue([]),
    crearUsuario: vi.fn(),
    cambiarActivoUsuario: vi.fn(),
    getBuses: vi.fn().mockResolvedValue([]),
    registrarBus: vi.fn(),
  };
}

// Renderiza con router + sesión. Si `usuario` es null, no hay sesión.
export function renderConSesion(ui, { usuario = null, ruta = '/', api } = {}) {
  guardarSesion(usuario ? { token: 'token-de-prueba', usuario } : null);
  if (api && usuario) api.yo.mockResolvedValue({ usuario });
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}
