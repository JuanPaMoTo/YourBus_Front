import { useEffect, useMemo, useReducer, useState } from 'react';
import { api } from '../services/api';
import { formatearFecha, hoyTexto, lunesDeLaSemana, sumarDias } from '../utils/fechas';

const ETIQUETA = {
  programado: 'Programado',
  en_curso: 'En curso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

const FORM_VACIO = { conductorId: '', rutaId: '', busId: '', fecha: '', horaInicio: '08:00', horaFin: '12:00' };

export default function AdminTurnos() {
  const hoy = useMemo(() => hoyTexto(), []);
  const [semana, setSemana] = useState(() => lunesDeLaSemana(hoy));
  const [turnos, setTurnos] = useState([]);
  const [catalogos, setCatalogos] = useState({ conductores: [], rutas: [], buses: [] });
  const [form, setForm] = useState({ ...FORM_VACIO, fecha: hoy });
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [version, recargar] = useReducer((v) => v + 1, 0);

  useEffect(() => {
    let vigente = true;
    api
      .getTurnos({ desde: semana, hasta: sumarDias(semana, 6) })
      .then((lista) => vigente && setTurnos(lista))
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [semana, version]);

  useEffect(() => {
    Promise.all([api.getUsuarios('conductor'), api.getRutas(), api.getBuses()])
      .then(([conductores, rutas, buses]) => {
        setCatalogos({ conductores: conductores.filter((c) => c.activo), rutas, buses });
      })
      .catch((err) => setError(err.message));
  }, []);

  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(semana, i));
  const porDia = (fecha) => turnos.filter((t) => t.fecha === fecha);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    try {
      await api.crearTurno(form);
      setAviso('Turno creado.');
      setSemana(lunesDeLaSemana(form.fecha));
      recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const ejecutar = async (fn, mensaje) => {
    setError(null);
    setAviso(null);
    try {
      await fn();
      setAviso(mensaje);
      recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const sinCatalogo = catalogos.conductores.length === 0 || catalogos.rutas.length === 0 || catalogos.buses.length === 0;

  return (
    <section>
      <div className="page-head">
        <h1>Turnos de la terminal</h1>
        <p>Asigna conductor, bus y ruta a cada turno. El sistema evita cruces de horario.</p>
      </div>

      <form onSubmit={crear} className="panel form-grid" aria-label="Nuevo turno">
        <h2 className="subtitulo">Nuevo turno</h2>
        <div>
          <label htmlFor="conductorId">Conductor</label>
          <select id="conductorId" name="conductorId" value={form.conductorId} onChange={cambiar} required>
            <option value="">Elige…</option>
            {catalogos.conductores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rutaId">Ruta</label>
          <select id="rutaId" name="rutaId" value={form.rutaId} onChange={cambiar} required>
            <option value="">Elige…</option>
            {catalogos.rutas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} · {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="busId">Bus</label>
          <select id="busId" name="busId" value={form.busId} onChange={cambiar} required>
            <option value="">Elige…</option>
            {catalogos.buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.placa} · {b.empresa}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fecha">Fecha</label>
          <input id="fecha" name="fecha" type="date" value={form.fecha} onChange={cambiar} required />
        </div>
        <div>
          <label htmlFor="horaInicio">Hora de inicio</label>
          <input id="horaInicio" name="horaInicio" type="time" value={form.horaInicio} onChange={cambiar} required />
        </div>
        <div>
          <label htmlFor="horaFin">Hora de fin</label>
          <input id="horaFin" name="horaFin" type="time" value={form.horaFin} onChange={cambiar} required />
        </div>
        <button type="submit" className="btn-solid" disabled={sinCatalogo}>
          Crear turno
        </button>
        {sinCatalogo && (
          <p className="state-msg">
            Para crear turnos necesitas al menos un conductor (sección Usuarios), una ruta y un bus
            (sección Flota).
          </p>
        )}
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

      <div className="semana-nav">
        <button type="button" className="btn-small" onClick={() => setSemana(sumarDias(semana, -7))}>
          ‹ Semana anterior
        </button>
        <strong>
          {formatearFecha(semana)} – {formatearFecha(sumarDias(semana, 6))}
        </strong>
        <button type="button" className="btn-small" onClick={() => setSemana(sumarDias(semana, 7))}>
          Semana siguiente ›
        </button>
      </div>

      {dias.map((fecha) => (
        <div key={fecha} className="dia-bloque">
          <h3 className={fecha === hoy ? 'dia-hoy' : ''}>{formatearFecha(fecha)}</h3>
          {porDia(fecha).length === 0 ? (
            <p className="dia-vacio">Sin turnos</p>
          ) : (
            <ul className="turno-lista">
              {porDia(fecha).map((t) => (
                <li key={t.id} className="turno-card">
                  <div className="turno-hora">
                    {t.horaInicio}
                    <span>{t.horaFin}</span>
                  </div>
                  <div className="turno-info">
                    <strong>
                      {t.ruta.codigo} · {t.bus.placa}
                    </strong>
                    <span>{t.conductor ? t.conductor.nombre : 'Sin conductor'}</span>
                    <span className={`estado-chip estado-${t.estado}`}>{ETIQUETA[t.estado]}</span>
                  </div>
                  <div className="turno-acciones">
                    {t.estado === 'programado' && (
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => ejecutar(() => api.cancelarTurno(t.id), 'Turno cancelado.')}
                      >
                        Cancelar
                      </button>
                    )}
                    {t.estado !== 'en_curso' && (
                      <button
                        type="button"
                        className="btn-small btn-peligro-suave"
                        onClick={() => ejecutar(() => api.eliminarTurno(t.id), 'Turno eliminado.')}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}
