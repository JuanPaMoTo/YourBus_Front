import { useEffect, useReducer, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';

const FORM_VACIO = { nombre: '', email: '', password: '', rol: 'conductor' };

export default function AdminUsuarios() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [version, recargar] = useReducer((v) => v + 1, 0);

  useEffect(() => {
    let vigente = true;
    api
      .getUsuarios()
      .then((lista) => vigente && setUsuarios(lista))
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [version]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    try {
      await api.crearUsuario(form);
      setAviso(`Cuenta de ${form.rol} creada para ${form.nombre}.`);
      setForm(FORM_VACIO);
      recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const alternarActivo = async (u) => {
    setError(null);
    setAviso(null);
    try {
      await api.cambiarActivoUsuario(u.id, !u.activo);
      recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Usuarios</h1>
        <p>Crea las cuentas de conductores y administradores. Los pasajeros se registran solos.</p>
      </div>

      <form onSubmit={crear} className="panel form-grid" aria-label="Nueva cuenta">
        <h2 className="subtitulo">Nueva cuenta</h2>
        <div>
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" value={form.nombre} onChange={cambiar} required minLength={2} />
        </div>
        <div>
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" value={form.email} onChange={cambiar} required />
        </div>
        <div>
          <label htmlFor="password">Contraseña inicial (mínimo 8)</label>
          <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={cambiar} required minLength={8} />
        </div>
        <div>
          <label htmlFor="rol">Rol</label>
          <select id="rol" name="rol" value={form.rol} onChange={cambiar}>
            <option value="conductor">Conductor</option>
            <option value="admin">Administrador de terminal</option>
          </select>
        </div>
        <button type="submit" className="btn-solid">
          Crear cuenta
        </button>
      </form>

      {error && (
        <p className="state-msg error" role="alert">
          {error}
        </p>
      )}
      {aviso && (
        <p className="state-msg success" role="status">
          {aviso}
        </p>
      )}

      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? 'Activa' : 'Desactivada'}</td>
                <td>
                  {u.id !== yo.id && (
                    <button type="button" className="btn-small" onClick={() => alternarActivo(u)}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
