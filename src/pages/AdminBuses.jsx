import { useState } from 'react';
import { api } from '../services/api';

export default function AdminBuses() {
  const [form, setForm] = useState({ placa: '', empresa: '' });
  const [mensaje, setMensaje] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.registrarBus(form);
      setMensaje('Bus registrado correctamente.');
      setForm({ placa: '', empresa: '' });
    } catch {
      setMensaje('No fue posible registrar el bus. Revisa los datos.');
    }
  };

  return (
    <section className="page">
      <h1>Registrar bus</h1>
      <form onSubmit={handleSubmit} className="form-stack">
        <input
          name="placa"
          placeholder="Placa"
          value={form.placa}
          onChange={handleChange}
          required
        />
        <input
          name="empresa"
          placeholder="Empresa"
          value={form.empresa}
          onChange={handleChange}
          required
        />
        <button type="submit">Guardar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </section>
  );
}
