# YourBus_Front

Frontend de YourBus (rastreo de buses): React 19 + Vite + React Router 7 + Leaflet. Consume la API de `YourBus_Back`. Proyecto académico con pipeline en Azure DevOps (ambientes DEV, QA y PROD).

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run lint` — oxlint sobre `src`
- `npm test` — Vitest (`npm run test:coverage` para cobertura)
- `npm run build` — build de producción en `dist/`

## Estructura
- `src/pages`, `src/components`, `src/hooks`, `src/context`, `src/utils`
- `src/services/api.js` — único cliente hacia el backend; elige la URL según el dominio del front (`VITE_API_URL` en local)
- `src/__tests__` — pruebas (Vitest + Testing Library)
- `deploy/server.cjs` — servidor estático que se despliega en Azure; define las cabeceras de seguridad (CSP, HSTS, etc.)
- `.pipeline/azure-pipelines.yml` — pipeline de Azure DevOps

## Reglas (obligatorias)
1. **Nunca saltarse Husky**: no usar `--no-verify`, `HUSKY=0` ni desactivar hooks. `pre-commit` corre el lint y `pre-push` corre los tests. Si un hook falla, se arregla la causa.
2. **Git**: agregar solo los archivos del cambio (`git add <archivo>`), nunca `git add .` ni `-A`. No hacer commit ni push sin que el usuario lo pida.
3. **Push**: `git push origin main`. `origin` sube a Azure DevOps (dispara el pipeline) y a GitHub. Un `git push` sin argumentos va solo a GitHub, porque `main` sigue a `github/main`.
4. **Secretos**: no leer, mostrar ni copiar archivos `.env`. `.env.example` sí se puede leer. Nunca escribir credenciales en código, commits ni chat.
5. **Pruebas**: toda funcionalidad nueva lleva pruebas en `src/__tests__`. SonarCloud lee la cobertura.
6. **CSP**: si se agrega un dominio externo (backend, mapas, fuentes, imágenes), hay que sumarlo a la CSP en `deploy/server.cjs`; si no, el navegador lo bloquea en DEV, QA y PROD.
7. **Windows**: el proyecto vive en Windows (OneDrive) y muchos archivos usan CRLF. No reformatear ni cambiar finales de línea de archivos que no se están editando.

## Pipeline (cada etapa tiene un solo propósito)
1 Compile/Build → 2 Quality Gates (lint, pruebas, SonarCloud) → 3 Package → 4 Deploy DEV → 5 Deploy QA → 6 Seguridad (solo ZAP) y 7 Rendimiento (Lighthouse) en paralelo → 8 Deploy PROD. No mezclar análisis de rendimiento dentro de Seguridad.

## Pendiente (al 2 de noviembre de 2026, según el tablero y el código)
Faltan las historias de incidentes y alertas: HU14, HU15, HU16 (incidentes), HU08 y HU07 (alertas y notificaciones; `Notificaciones.jsx` es un placeholder), además de HU12 (administrar paraderos) y HU13 (administrar horarios). Las historias están en Azure DevOps Boards.
