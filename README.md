# YourBus_Front

Frontend del sistema de transporte público **YourBus**, construido con **React + Vite**. Consume la API de [`YourBus_Back`](../YourBus_Back) para mostrar rutas, paraderos, horarios, ubicación en vivo, ETA y alertas.

## Estructura

```
src/
├── components/       # Navbar, RutaProtegida, Calendario, MapaVivo (Leaflet), RecorridoEnCurso
├── context/          # AuthProvider: sesión y rol del usuario
├── hooks/            # usePolling, useGeolocalizacion, useEnvioUbicacion (GPS del conductor)
├── pages/            # Home, Rutas, Paraderos, Horarios, Mapa, Login, Registro,
│                     # ConductorTurnos, AdminTurnos, AdminUsuarios, AdminBuses
├── services/api.js   # Cliente único hacia el backend (usa VITE_API_URL) + sesión
├── utils/            # fechas, geo
└── __tests__/        # Pruebas (Vitest + Testing Library)
.husky/               # Hooks de git: lint al commit, pruebas al push
```

## Requisitos

- Node.js 20.x o superior
- El backend `YourBus_Back` corriendo (local o desplegado)

## Instalación local

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si tu backend no está en localhost:4000
npm run dev
```

Abre `http://localhost:5173`.

## Roles y pantallas

| Rol | Pantallas |
|---|---|
| Pasajero (se registra en `/registro`) | `/mapa`: ve su GPS, el paradero más cercano, los buses en vivo y el tiempo de llegada calculado por calles |
| Conductor (lo crea el admin) | `/conductor`: calendario/lista de sus turnos; botón **Iniciar recorrido** que transmite el GPS del celular cada 5 s hasta **Finalizar** |
| Administrador de terminal | `/admin/turnos` (asigna ruta, bus y horario a cada conductor), `/admin/usuarios`, `/admin/buses` |

Las rutas protegidas redirigen a `/login` si no hay sesión. La sesión se guarda en `localStorage` y se cierra sola si el servidor responde 401.

**GPS:** el navegador pide permiso de ubicación y requiere **HTTPS** (los App Service lo dan). En el celular del conductor, mantén la pestaña abierta: la app pide mantener la pantalla encendida (Wake Lock) cuando el navegador lo permite.

## Variables de entorno

| Variable       | Descripción                          | Ejemplo                             |
|----------------|----------------------------------------|--------------------------------------|
| `VITE_API_URL` | URL base de la API de `YourBus_Back`   | `http://localhost:4000/api`          |

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción (dist/)
npm run preview   # sirve el build de producción localmente
npm run lint       # análisis estático (oxlint)
npm test          # pruebas (vitest)
npm run test:coverage  # pruebas + cobertura (lcov/cobertura para SonarCloud)
```

Estos mismos comandos (`lint` y `test`) son el **Quality Gate** que ejecuta el pipeline de Azure antes de permitir el despliegue — ver `.pipeline/azure-pipelines.yml`.

## Husky y SonarCloud

`npm install` activa Husky: `npm run lint` antes de cada commit y `npm test` antes de cada push (en CI se desactiva con `HUSKY=0`).

El pipeline trae las tareas de SonarCloud apagadas (`runSonar: 'false'`). Para activarlas sigue la sección *SonarCloud* del README de `YourBus_Back` (extensión SonarQube Cloud, organización, token, service connection `SonarCloud`) creando aquí un segundo proyecto, y edita `sonarOrganization`, `sonarProjectKey` y `runSonar: 'true'` en `.pipeline/azure-pipelines.yml`.

## Despliegue

El pipeline en `.pipeline/azure-pipelines.yml` compila, empaqueta y despliega el sitio de forma automática, promoviendo el mismo artefacto por los entornos **DEV → QA → PROD** en Azure App Service. QA y PROD requieren aprobación manual configurada en Azure DevOps ("Environments" con *Approval checks*).
