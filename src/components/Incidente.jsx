import { etiquetaTipo, tiempoRelativo } from '../utils/incidentes';

// Una tarjeta de incidente. `children` recibe las acciones (por ejemplo, el botón
// de finalizar en el panel del administrador).
export default function Incidente({ incidente, mostrarRuta = true, children }) {
  const { tipo, descripcion, ruta, creadoEn, estado, reportadoPor } = incidente;
  return (
    <li className={`incidente incidente-${tipo}${estado === 'finalizado' ? ' incidente-cerrado' : ''}`}>
      <span className="incidente-tipo">{etiquetaTipo(tipo)}</span>
      <div className="incidente-cuerpo">
        {mostrarRuta && ruta && (
          <strong>
            {ruta.codigo} · {ruta.nombre}
          </strong>
        )}
        <p>{descripcion}</p>
        <small>
          {tiempoRelativo(creadoEn)}
          {reportadoPor && ` · Reportado por ${reportadoPor.nombre}`}
          {estado === 'finalizado' && ' · Finalizado'}
        </small>
      </div>
      {children}
    </li>
  );
}
