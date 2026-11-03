import { useEffect, useReducer, useState } from 'react';
import { api } from '../services/api';

const PARADERO_VACIO = { nombre: '', orden: '', lat: '', lng: '' };
const HORARIO_VACIO = { jornada: '', hora: '' };

// Los campos opcionales vacíos no se envían; los números llegan como número.
function datosParadero(form) {
  const datos = { nombre: form.nombre };
  if (form.orden !== '') datos.orden = Number(form.orden);
  if (form.lat !== '') datos.lat = Number(form.lat);
  if (form.lng !== '') datos.lng = Number(form.lng);
  return datos;
}

// Botón de eliminar con confirmación en el mismo lugar (sin ventanas emergentes).
function Eliminar({ etiqueta, onConfirmar, disabled }) {
  const [confirmando, setConfirmando] = useState(false);
  if (!confirmando) {
    return (
      <button
        type="button"
        className="btn-small btn-peligro-suave"
        aria-label={`Eliminar ${etiqueta}`}
        disabled={disabled}
        onClick={() => setConfirmando(true)}
      >
        Eliminar
      </button>
    );
  }
  return (
    <span className="confirmar-eliminar">
      <button
        type="button"
        className="btn-small btn-peligro-suave"
        aria-label={`Confirmar eliminar ${etiqueta}`}
        disabled={disabled}
        onClick={() => {
          setConfirmando(false);
          onConfirmar();
        }}
      >
        Sí, eliminar
      </button>
      <button type="button" className="btn-small" onClick={() => setConfirmando(false)}>
        Cancelar
      </button>
    </span>
  );
}

// Panel del administrador: ordena los paraderos de una ruta y administra sus horarios.
export default function AdminConfiguracion() {
  const [rutas, setRutas] = useState([]);
  const [rutaId, setRutaId] = useState('');
  const [paraderos, setParaderos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [formParadero, setFormParadero] = useState(PARADERO_VACIO);
  const [formHorario, setFormHorario] = useState(HORARIO_VACIO);
  const [editando, setEditando] = useState(null); // { id, jornada, hora }
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [version, recargar] = useReducer((v) => v + 1, 0);

  useEffect(() => {
    let vigente = true;
    api
      .getRutas()
      .then((lista) => vigente && setRutas(lista))
      .catch(() => vigente && setError('No fue posible cargar las rutas.'));
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    if (!rutaId) return undefined;
    let vigente = true;
    Promise.all([api.getParaderos(rutaId), api.getHorarios(rutaId)])
      .then(([p, h]) => {
        if (!vigente) return;
        setParaderos(p);
        setHorarios(h);
      })
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [rutaId, version]);

  const ejecutar = async (accion, textoOk) => {
    setOcupado(true);
    setError(null);
    setMensaje(null);
    try {
      await accion();
      if (textoOk) setMensaje(textoOk);
      recargar();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setOcupado(false);
    }
  };

  const elegirRuta = (e) => {
    setRutaId(e.target.value);
    setParaderos([]);
    setHorarios([]);
    setEditando(null);
    setError(null);
    setMensaje(null);
  };

  const agregarParadero = async (e) => {
    e.preventDefault();
    const ok = await ejecutar(
      () => api.agregarParadero(rutaId, datosParadero(formParadero)),
      'Paradero agregado.'
    );
    if (ok) setFormParadero(PARADERO_VACIO);
  };

  const mover = (p, delta) => ejecutar(() => api.editarParadero(p.id, { orden: p.orden + delta }));

  const agregarHorario = async (e) => {
    e.preventDefault();
    const ok = await ejecutar(() => api.agregarHorario(rutaId, formHorario), 'Horario agregado.');
    if (ok) setFormHorario(HORARIO_VACIO);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    const { id, jornada, hora } = editando;
    const ok = await ejecutar(() => api.editarHorario(id, { jornada, hora }), 'Horario actualizado.');
    if (ok) setEditando(null);
  };

  const cambiarP = (e) => setFormParadero({ ...formParadero, [e.target.name]: e.target.value });
  const cambiarH = (e) => setFormHorario({ ...formHorario, [e.target.name]: e.target.value });

  return (
    <section>
      <div className="page-head">
        <h1>Paraderos y horarios</h1>
        <p>Configura el orden de los paraderos de cada ruta y mantén su programación al día.</p>
      </div>

      <div className="form-inline">
        <div>
          <label htmlFor="cfg-ruta">Ruta</label>
          <select id="cfg-ruta" value={rutaId} onChange={elegirRuta}>
            <option value="">Selecciona una ruta</option>
            {rutas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} · {r.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="state-msg error" role="alert">
          {error}
        </p>
      )}
      {mensaje && (
        <p className="state-msg success" role="status">
          {mensaje}
        </p>
      )}

      {rutaId && (
        <div className="layout-two">
          <div>
            <h2 className="subtitulo">Paraderos</h2>
            {paraderos.length === 0 && <div className="empty-state">Esta ruta aún no tiene paraderos.</div>}
            <ol className="cfg-lista">
              {paraderos.map((p, i) => (
                <li key={p.id} className="cfg-item">
                  <span className="route-code">{p.orden}</span>
                  <span className="route-name">{p.nombre}</span>
                  <span className="cfg-acciones">
                    <button
                      type="button"
                      className="btn-small"
                      aria-label={`Subir ${p.nombre}`}
                      disabled={ocupado || i === 0}
                      onClick={() => mover(p, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn-small"
                      aria-label={`Bajar ${p.nombre}`}
                      disabled={ocupado || i === paraderos.length - 1}
                      onClick={() => mover(p, 1)}
                    >
                      ↓
                    </button>
                    <Eliminar
                      etiqueta={p.nombre}
                      disabled={ocupado}
                      onConfirmar={() => ejecutar(() => api.eliminarParadero(p.id), 'Paradero eliminado.')}
                    />
                  </span>
                </li>
              ))}
            </ol>

            <form className="panel form-grid" onSubmit={agregarParadero}>
              <h3 className="subtitulo">Agregar paradero</h3>
              <div>
                <label htmlFor="p-nombre">Nombre del paradero</label>
                <input id="p-nombre" name="nombre" value={formParadero.nombre} onChange={cambiarP} required />
              </div>
              <div>
                <label htmlFor="p-orden">Posición (opcional)</label>
                <input id="p-orden" name="orden" type="number" min="1" value={formParadero.orden} onChange={cambiarP} />
              </div>
              <div>
                <label htmlFor="p-lat">Latitud (opcional)</label>
                <input id="p-lat" name="lat" type="number" step="any" value={formParadero.lat} onChange={cambiarP} />
              </div>
              <div>
                <label htmlFor="p-lng">Longitud (opcional)</label>
                <input id="p-lng" name="lng" type="number" step="any" value={formParadero.lng} onChange={cambiarP} />
              </div>
              <button type="submit" className="btn-solid" disabled={ocupado}>
                Agregar paradero
              </button>
            </form>
          </div>

          <div>
            <h2 className="subtitulo">Horarios</h2>
            {horarios.length === 0 && <div className="empty-state">Esta ruta aún no tiene horarios.</div>}
            <ul className="cfg-lista">
              {horarios.map((h) =>
                editando && editando.id === h.id ? (
                  <li key={h.id} className="cfg-item">
                    <form className="cfg-edicion" onSubmit={guardarEdicion}>
                      <input
                        aria-label="Jornada"
                        value={editando.jornada}
                        onChange={(e) => setEditando({ ...editando, jornada: e.target.value })}
                        required
                      />
                      <input
                        aria-label="Horario"
                        value={editando.hora}
                        onChange={(e) => setEditando({ ...editando, hora: e.target.value })}
                        required
                      />
                      <button type="submit" className="btn-small" disabled={ocupado}>
                        Guardar
                      </button>
                      <button type="button" className="btn-small" onClick={() => setEditando(null)}>
                        Cancelar
                      </button>
                    </form>
                  </li>
                ) : (
                  <li key={h.id} className="cfg-item">
                    <span className="route-code">{h.jornada}</span>
                    <span className="route-name">{h.hora}</span>
                    <span className="cfg-acciones">
                      <button
                        type="button"
                        className="btn-small"
                        aria-label={`Editar ${h.jornada}`}
                        disabled={ocupado}
                        onClick={() => setEditando({ id: h.id, jornada: h.jornada, hora: h.hora })}
                      >
                        Editar
                      </button>
                      <Eliminar
                        etiqueta={h.jornada}
                        disabled={ocupado}
                        onConfirmar={() => ejecutar(() => api.eliminarHorario(h.id), 'Horario eliminado.')}
                      />
                    </span>
                  </li>
                )
              )}
            </ul>

            <form className="panel form-grid" onSubmit={agregarHorario}>
              <h3 className="subtitulo">Agregar horario</h3>
              <div>
                <label htmlFor="h-jornada">Jornada</label>
                <input id="h-jornada" name="jornada" placeholder="Ej. Mañana" value={formHorario.jornada} onChange={cambiarH} required />
              </div>
              <div>
                <label htmlFor="h-hora">Horario</label>
                <input id="h-hora" name="hora" placeholder="Ej. 06:00 - 09:00, cada 10 min" value={formHorario.hora} onChange={cambiarH} required />
              </div>
              <button type="submit" className="btn-solid" disabled={ocupado}>
                Agregar horario
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
