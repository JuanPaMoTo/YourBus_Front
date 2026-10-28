import { useEffect, useMemo, useReducer, useState } from 'react';
import { api } from '../services/api';
import Calendario from '../components/Calendario';
import RecorridoEnCurso from '../components/RecorridoEnCurso';
import { formatearFecha, hoyTexto, primerYUltimoDia, sumarDias } from '../utils/fechas';

const ETIQUETA = {
  programado: 'Programado',
  en_curso: 'En curso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export default function ConductorTurnos() {
  const hoy = useMemo(() => hoyTexto(), []);
  const [vista, setVista] = useState(() => {
    const [anio, mes] = hoy.split('-').map(Number);
    return { anio, mes };
  });
  const [seleccionado, setSeleccionado] = useState(hoy);
  const [turnosMes, setTurnosMes] = useState([]);
  const [activos, setActivos] = useState([]); // turnos de ayer y hoy, para detectar el que está en curso
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const [version, recargar] = useReducer((v) => v + 1, 0);

  useEffect(() => {
    let vigente = true;
    const { desde, hasta } = primerYUltimoDia(vista.anio, vista.mes);
    Promise.all([
      api.misTurnos({ desde, hasta }),
      api.misTurnos({ desde: sumarDias(hoy, -1), hasta: hoy }),
    ])
      .then(([mes, recientes]) => {
        if (!vigente) return;
        setTurnosMes(mes);
        setActivos(recientes);
      })
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [vista, hoy, version]);

  const turnosPorFecha = useMemo(() => {
    const mapa = {};
    for (const t of turnosMes) (mapa[t.fecha] ||= []).push(t);
    return mapa;
  }, [turnosMes]);

  const enCurso = activos.find((t) => t.estado === 'en_curso');
  const delDia = turnosPorFecha[seleccionado] || [];

  const cambiarMes = (delta) => {
    setVista(({ anio, mes }) => {
      const nuevo = mes + delta;
      if (nuevo < 1) return { anio: anio - 1, mes: 12 };
      if (nuevo > 12) return { anio: anio + 1, mes: 1 };
      return { anio, mes: nuevo };
    });
  };

  const accion = async (fn) => {
    setOcupado(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      recargar();
      setOcupado(false);
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>Mis turnos</h1>
        <p>Tu calendario de recorridos. Desde aquí inicias el turno del día y compartes tu posición.</p>
      </div>

      {error && (
        <p className="state-msg error" role="alert">
          {error}
        </p>
      )}

      {enCurso && (
        <RecorridoEnCurso
          turno={enCurso}
          ocupado={ocupado}
          onFinalizar={() => accion(() => api.finalizarTurno(enCurso.id))}
          onPerdido={recargar}
        />
      )}

      <div className="layout-two">
        <Calendario
          anio={vista.anio}
          mes={vista.mes}
          hoy={hoy}
          seleccionado={seleccionado}
          turnosPorFecha={turnosPorFecha}
          onSeleccionar={setSeleccionado}
          onCambiarMes={cambiarMes}
        />

        <div>
          <h2 className="subtitulo">{formatearFecha(seleccionado)}</h2>
          {delDia.length === 0 && <div className="empty-state">No tienes turnos este día.</div>}
          <ul className="turno-lista">
            {delDia.map((t) => (
              <li key={t.id} className="turno-card">
                <div className="turno-hora">
                  {t.horaInicio}
                  <span>{t.horaFin}</span>
                </div>
                <div className="turno-info">
                  <strong>
                    {t.ruta.codigo} · {t.ruta.nombre}
                  </strong>
                  <span>Bus {t.bus.placa}</span>
                  <span className={`estado-chip estado-${t.estado}`}>{ETIQUETA[t.estado]}</span>
                </div>
                {t.estado === 'programado' && t.fecha === hoy && (
                  <button
                    type="button"
                    className="btn-solid"
                    disabled={ocupado || Boolean(enCurso)}
                    onClick={() => accion(() => api.iniciarTurno(t.id))}
                  >
                    Iniciar recorrido
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
