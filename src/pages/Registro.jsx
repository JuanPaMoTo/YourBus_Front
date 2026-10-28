import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { rutaInicial } from '../context/roles';

export default function Registro() {
  const { registrar } = useAuth();
  const navegar = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', repetir: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.repetir) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      const { nombre, email, password } = form;
      const usuario = await registrar({ nombre, email, password });
      navegar(rutaInicial(usuario.rol), { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Crear cuenta de pasajero</h1>
        <p>
          Las cuentas de conductor y de administrador las crea el administrador de la
          terminal.
        </p>
      </div>

      <form onSubmit={enviar} className="form-stack">
        <div>
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" autoComplete="name" value={form.nombre} onChange={cambiar} required minLength={2} />
        </div>
        <div>
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={cambiar} required />
        </div>
        <div>
          <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
          <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={cambiar} required minLength={8} />
        </div>
        <div>
          <label htmlFor="repetir">Repite la contraseña</label>
          <input id="repetir" name="repetir" type="password" autoComplete="new-password" value={form.repetir} onChange={cambiar} required minLength={8} />
        </div>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando...' : 'Crear cuenta'}
        </button>
        {error && (
          <p className="state-msg error" role="alert">
            {error}
          </p>
        )}
      </form>

      <p>
        ¿Ya tienes cuenta? <Link to="/login">Ingresa</Link>.
      </p>
    </section>
  );
}
