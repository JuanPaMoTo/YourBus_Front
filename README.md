# YourBus_Front

Frontend del sistema de transporte público **YourBus**, construido con **React + Vite**. Consume la API de [`YourBus_Back`](../YourBus_Back) para mostrar rutas, paraderos, horarios, ubicación en vivo, ETA y alertas.

## Estructura

```
src/
├── components/       # Navbar, Footer
├── pages/            # Home, Rutas, Paraderos, Horarios, Mapa, Notificaciones, AdminBuses
├── services/api.js   # Cliente único hacia el backend (usa VITE_API_URL)
└── __tests__/        # Pruebas de componentes (Vitest + Testing Library)
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
npm test          # pruebas de componentes (vitest)
```

Estos mismos comandos (`lint` y `test`) son el **Quality Gate** que ejecuta el pipeline de Azure antes de permitir el despliegue — ver `.pipeline/azure-pipelines.yml`.

## Despliegue

El pipeline en `.pipeline/azure-pipelines.yml` compila, empaqueta y despliega el sitio de forma automática, promoviendo el mismo artefacto por los entornos **DEV → QA → PROD** en Azure App Service. QA y PROD requieren aprobación manual configurada en Azure DevOps ("Environments" con *Approval checks*).
