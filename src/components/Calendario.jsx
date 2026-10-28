import { DIAS_CORTOS, NOMBRES_MES, semanasDelMes } from '../utils/fechas';

const ETIQUETA_ESTADO = {
  programado: 'programado',
  en_curso: 'en curso',
  completado: 'completado',
  cancelado: 'cancelado',
};

/**
 * Calendario mensual (lunes a domingo). Cada día muestra un punto por turno,
 * con el color de su estado.
 *
 * @param {{ anio:number, mes:number, hoy:string, seleccionado:string,
 *   turnosPorFecha:Record<string, {id:string, estado:string}[]>,
 *   onSeleccionar:(fecha:string)=>void, onCambiarMes:(delta:number)=>void }} props
 */
export default function Calendario({
  anio,
  mes,
  hoy,
  seleccionado,
  turnosPorFecha,
  onSeleccionar,
  onCambiarMes,
}) {
  const semanas = semanasDelMes(anio, mes);

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="btn-small" onClick={() => onCambiarMes(-1)} aria-label="Mes anterior">
          ‹
        </button>
        <h2 aria-live="polite">
          {NOMBRES_MES[mes - 1]} {anio}
        </h2>
        <button type="button" className="btn-small" onClick={() => onCambiarMes(1)} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="cal-grid" role="grid">
        {DIAS_CORTOS.map((d) => (
          <span key={d} className="cal-dow" role="columnheader">
            {d}
          </span>
        ))}
        {semanas.flat().map(({ fecha, dia, delMes }) => {
          const turnos = turnosPorFecha[fecha] || [];
          const clases = ['cal-day'];
          if (!delMes) clases.push('fuera');
          if (fecha === hoy) clases.push('hoy');
          if (fecha === seleccionado) clases.push('sel');
          const resumen = turnos.length
            ? `, ${turnos.length} turno${turnos.length > 1 ? 's' : ''}`
            : '';
          return (
            <button
              key={fecha}
              type="button"
              role="gridcell"
              className={clases.join(' ')}
              aria-pressed={fecha === seleccionado}
              aria-label={`${dia} de ${NOMBRES_MES[Number(fecha.split('-')[1]) - 1]}${resumen}`}
              onClick={() => onSeleccionar(fecha)}
            >
              <span className="cal-num">{dia}</span>
              <span className="cal-dots" aria-hidden="true">
                {turnos.slice(0, 4).map((t) => (
                  <i key={t.id} className={`dot dot-${t.estado}`} title={ETIQUETA_ESTADO[t.estado]} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="cal-leyenda">
        {Object.entries(ETIQUETA_ESTADO).map(([estado, texto]) => (
          <li key={estado}>
            <i className={`dot dot-${estado}`} aria-hidden="true" /> {texto}
          </li>
        ))}
      </ul>
    </div>
  );
}
