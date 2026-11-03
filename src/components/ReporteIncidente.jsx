import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MAX_DESCRIPCION, TIPOS_INCIDENTE } from '../utils/incidentes';

// Formulario del conductor para reportar un incidente en la vía. Carga las rutas
// solo cuando se abre; si hay un recorrido en curso, su ruta viene preseleccionada.
export default function ReporteIncidente({ rutaSugerida = null }) {
  const [abierto, setAbierto] = useState(false);
  const [rutas, setRutas] = useState([]);
  const [form, setForm] = useState({ rutaId: '', tipo: '', descripcion: '' });
  const [mensaje, setMensaje] = useState(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!abierto) return undefined;
    let vigente = true;
    api
      .getRutas()
      .then((lista) => vigente && setRutas(lista))
      .catch(() => {
        if (!vigente) return;
        setOk(false);
        setMensaje('No fue posible cargar las rutas.');
      });
    return () => {
      vigente = false;
    };
  }, [abierto]);

  const rutaId = form.rutaId || rutaSugerida || '';
  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      await api.reportarIncidente({ rutaId, tipo: form.tipo, descripcion: form.descripcion });
      setOk(true);
      setMensaje('Incidente reportado. Los pasajeros ya pueden verlo en Alertas.');
      setForm({ rutaId: form.rutaId, tipo: '', descripcion: '' });
    } catch (err) {
      setOk(false);
      setMensaje(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!abierto) {
    return (
      <div className="reporte-incidente">
        <button type="button" className="btn-small" onClick={() => setAbierto(true)}>
          Reportar incidente
        </button>
      </div>
    );
  }

  return (
    <form className="panel reporte-incidente" onSubmit={enviar}>
      <h2 className="subtitulo">Reportar un incidente</h2>
      <div className="form-grid">
        <div>
          <label htmlFor="inc-tipo">Tipo de incidente</label>
          <select id="inc-tipo" name="tipo" value={form.tipo} onChange={cambiar} required>
            <option value="">Selecciona un tipo</option>
            {TIPOS_INCIDENTE.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="inc-ruta">Ruta afectada</label>
          <select id="inc-ruta" name="rutaId" value={rutaId} onChange={cambiar} required>
            <option value="">Selecciona una ruta</option>
            {rutas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} · {r.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="inc-desc">Descripción</label>
        <textarea
          id="inc-desc"
          name="descripcion"
          rows={3}
          maxLength={MAX_DESCRIPCION}
          placeholder="Qué pasó y dónde (ej. choque en la Av. Norte, tránsito lento)"
          value={form.descripcion}
          onChange={cambiar}
          required
        />
        <small className="contador">
          {form.descripcion.length}/{MAX_DESCRIPCION}
        </small>
      </div>
      <div className="reporte-acciones">
        <button type="submit" className="btn-solid" disabled={enviando}>
          Enviar reporte
        </button>
        <button type="button" className="btn-small" onClick={() => setAbierto(false)}>
          Cerrar
        </button>
      </div>
      {mensaje && (
        <p className={`state-msg ${ok ? 'success' : 'error'}`} role="status">
          {mensaje}
        </p>
      )}
    </form>
  );
}
