# frontend — Salón de Estudio Colaborativo

Aplicación web del Mini-proyecto 2 (750018C Proyecto Integrador I, Univalle).
React + TypeScript + Vite + Tailwind CSS, pensada para cumplir WCAG 2.2 AA.

El frontend **nunca** consulta Firestore: todo dato pasa por la API
([backend-api](https://github.com/miniproyecto-2-pi-1/backend-api)).

## Pantallas (Sprint 0)

Hay una ruta por cada pantalla del mapa del sitio:

| Ruta | Pantalla | Estado |
| --- | --- | --- |
| `/` | Inicio | Diseñada |
| `/ingreso` | Ingreso | Diseño; el inicio de sesión llega en el Sprint 1 |
| `/registro` | Registro | Diseño; el registro llega en el Sprint 1 |
| `/salas` | Mis salas | Estado vacío; llega en el Sprint 2 |
| `/salas/:id` | Sala | Marcador; llega en los sprints 3 y 4 |
| `/perfil` | Perfil | Marcador; llega en el Sprint 2 |
| `/ayuda` | Ayuda | Preguntas frecuentes |
| `/base-tecnica` | **Base técnica (TS-00)** | Pide el dato a la API: cargando, error con "Reintentar" y éxito |
| `*` | Página no encontrada (404) | Diseñada |

## Estructura

```
src/
├── main.tsx            # Arranque, fuentes y estilos
├── App.tsx             # Rutas
├── config.ts           # URL de la API (VITE_API_URL)
├── index.css           # Guía visual: colores claro y oscuro, foco y componentes
├── components/         # Layout (encabezado, navegación, pie), botón de tema
├── hooks/              # useTitulo: título distinto en cada página
└── pages/              # Una página por pantalla
```

## Guía visual aplicada

- Una sola tipografía: **Noto Sans** (instalada con `@fontsource`, sin pedirla a Google).
- Colores como variables en `src/index.css`, en modo claro y oscuro; botón "Modo oscuro" con `aria-pressed`.
- Esquinas de 8 px en botones y campos, 10 px en tarjetas; bordes sólidos de 1,5 px.
- Foco visible de 2 px en todo elemento interactivo.

## Accesibilidad (TS-04)

`<html lang="es">`, título distinto en cada página, enlace «Saltar al contenido», regiones marcadas
(encabezado, navegación, contenido y pie), foco que pasa al contenido al cambiar de pantalla,
estados anunciados con `role="status"` y `role="alert"`, y navegación completa con teclado.

## Variables de entorno

Ver `.env.example`. No hay ninguna clave: solo la dirección de la API.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | No (local) / Sí (producción) | URL de la API, sin barra al final. Por defecto `http://localhost:3000` |

## Cómo ejecutarlo

### Sin Docker (desarrollo)

```bash
cp .env.example .env.local   # y ajustar VITE_API_URL
npm ci
npm run dev                  # http://localhost:5173
```

El puerto 5173 es el que la API permite por CORS (`CORS_ORIGINS`).

### Con Docker

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t frontend .
docker run -p 5173:80 frontend
```

### Todo el sistema (frontend + API) con docker-compose

El `docker-compose.yml` vive en el repositorio `backend-api` y busca este proyecto en `../frontend`.
Ver el README de `backend-api` ("Todo el sistema").

## Despliegue en Vercel

1. Importar este repositorio en Vercel (framework: Vite).
2. En *Environment Variables* agregar `VITE_API_URL` con la URL pública de la API.
3. Agregar la URL de Vercel a `CORS_ORIGINS` en el servicio de Render del `backend-api`.
4. Con la integración con GitHub, cada integración a `main` despliega sola. `vercel.json` hace que
   cualquier ruta devuelva `index.html` (aplicación de una sola página).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisa los tipos y compila para producción en `dist/` |
| `npm run preview` | Sirve `dist/` para probarlo |
| `npm run typecheck` | Solo revisa los tipos |

## Flujo de trabajo en GitHub

Una rama por historia (por ejemplo `feature/TS-00-base-tecnica-frontend`), commits que explican el cambio
y nombran la historia, y un pull request por historia con descripción y capturas. Nada se programa
directo en `main`.
