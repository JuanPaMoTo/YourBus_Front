import { useEffect, useRef } from 'react';

// Ejecuta `tarea` ahora y luego cada `intervaloMs` mientras `activo` sea true.
// No hace consultas con la pestaña oculta (ahorra batería y datos) y se pone
// al día apenas vuelve a verse. Si cambia `clave`, vuelve a ejecutar de inmediato
// (por ejemplo, al elegir otro paradero no hay que esperar al siguiente ciclo).
export function usePolling(tarea, intervaloMs, activo = true, clave = null) {
  const tareaRef = useRef(tarea);

  useEffect(() => {
    tareaRef.current = tarea;
  });

  useEffect(() => {
    if (!activo) return undefined;
    const ejecutar = () => {
      if (document.visibilityState === 'visible') tareaRef.current();
    };
    ejecutar();
    const id = setInterval(ejecutar, intervaloMs);
    document.addEventListener('visibilitychange', ejecutar);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', ejecutar);
    };
  }, [intervaloMs, activo, clave]);
}
