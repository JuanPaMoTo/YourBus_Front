import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  api,
  guardarSesion,
  leerSesionGuardada,
  onSesionExpirada,
} from '../services/api';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesionGuardada());

  const cerrarSesion = useCallback(() => {
    guardarSesion(null);
    setSesion(null);
  }, []);

  // Si el servidor dice que la sesión venció, se cierra sola.
  useEffect(() => {
    onSesionExpirada(cerrarSesion);
    return () => onSesionExpirada(null);
  }, [cerrarSesion]);

  // Al abrir la app con una sesión guardada, se refrescan los datos del usuario
  // (por si cambió su rol o lo desactivaron mientras estaba fuera).
  useEffect(() => {
    if (!sesion) return;
    api
      .yo()
      .then(({ usuario }) => {
        setSesion((actual) => {
          if (!actual) return actual;
          const nueva = { ...actual, usuario };
          guardarSesion(nueva);
          return nueva;
        });
      })
      .catch(() => {
        // 401 ya cerró la sesión; un error de red no debe sacar al usuario.
      });
    // Solo al montar: no hay que repetirlo en cada cambio de sesión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarYEntrar = useCallback((respuesta) => {
    const nueva = { token: respuesta.token, usuario: respuesta.usuario };
    guardarSesion(nueva);
    setSesion(nueva);
    return nueva.usuario;
  }, []);

  const iniciarSesion = useCallback(
    async (email, password) => guardarYEntrar(await api.login(email, password)),
    [guardarYEntrar]
  );

  const registrar = useCallback(
    async (datos) => guardarYEntrar(await api.registro(datos)),
    [guardarYEntrar]
  );

  const valor = useMemo(
    () => ({
      usuario: sesion ? sesion.usuario : null,
      iniciarSesion,
      registrar,
      cerrarSesion,
    }),
    [sesion, iniciarSesion, registrar, cerrarSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
