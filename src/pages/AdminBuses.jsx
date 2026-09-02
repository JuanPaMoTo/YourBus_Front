import { useState } from 'react';
import { api } from '../services/api';

export default function AdminBuses() {
  const [form, setForm] = useState({ placa: '', empresa: '' });
  const [mensaje, setMensaje] = useState(null);
  const [ok, setOk] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.registrarBus(form);
      setOk(true);
      setMensaje('Bus registrado correctamente.');
      setForm({ placa: '', empresa: '' });
    } catch {
      setOk(false);
      setMensaje('No fue posible registrar el bus. Revisa los datos.');
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Registrar bus en la flota</h1>
        <p>Solo para operadores. Agrega una unidad nueva al sistema.</p>
      </div>

      <form onSubmit={handleSubmit} className="form-stack">
        <div>
          <label htmlFor="placa">Placa</label>
          <input
            id="placa"
            name="placa"
            placeholder="Ej. ABCD-12"
            value={form.placa}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="empresa">Empresa</label>
          <input
            id="empresa"
            name="empresa"
            placeholder="Nombre del operador"
            value={form.empresa}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Guardar bus</button>
      </form>

      {mensaje && (
        <p className={`state-msg ${ok ? 'success' : 'error'}`}>{mensaje}</p>
      )}
    </section>
  );
}
