import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { rutaInicial } from '../context/roles';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const usuario = await iniciarSesion(form.email, form.password);
      navegar((ubicacion.state && ubicacion.state.desde) || rutaInicial(usuario.rol), {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Ingresar</h1>
        <p>Pasajeros, conductores y administradores de la terminal entran por aquí.</p>
      </div>

      <form onSubmit={enviar} className="form-stack">
        <div>
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={cambiar}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={cambiar}
            required
          />
        </div>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
        {error && (
          <p className="state-msg error" role="alert">
            {error}
          </p>
        )}
      </form>

      <p>
        ¿Eres pasajero y no tienes cuenta? <Link to="/registro">Crea una aquí</Link>.
      </p>
    </section>
  );
}
