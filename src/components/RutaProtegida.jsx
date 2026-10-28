import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Muestra la página solo a usuarios con sesión y (si se indica) con uno de los
// roles permitidos. Es una comodidad de la interfaz: la seguridad real la
// aplica el servidor en cada petición.
export default function RutaProtegida({ roles, children }) {
  const { usuario } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    return (
      <section>
        <div className="page-head">
          <h1>Sin permiso</h1>
          <p>Tu cuenta ({usuario.rol}) no puede ver esta sección.</p>
        </div>
      </section>
    );
  }
  return children;
}
