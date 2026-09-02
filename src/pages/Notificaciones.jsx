export default function Notificaciones() {
  return (
    <section>
      <div className="page-head">
        <h1>Alertas del servicio</h1>
        <p>Retrasos, desvíos e incidentes reportados en la red de rutas.</p>
      </div>

      <div className="empty-state">
        No hay alertas activas en este momento. Cuando el backend exponga
        eventos en tiempo real, se mostrarán aquí.
      </div>
    </section>
  );
}
