# frontend — Salón de Estudio Colaborativo

Aplicación web del Mini-proyecto 2 (750018C Proyecto Integrador I, Univalle).
React + TypeScript + Vite + Tailwind CSS, pensada para cumplir WCAG 2.2 AA.

El frontend **nunca** consulta Firestore: todo dato pasa por la API
([backend-api](https://github.com/miniproyecto-2-pi-1/backend-api)).

## Pantallas (Sprint 0)

La aplicación se recorre como la real: primero las pantallas **públicas**, y al ingresar pasa a las **privadas**.
El ingreso y el registro son de **demostración** (la sesión se guarda en el navegador): la autenticación verdadera
llega en el Sprint 1. Las pantallas que todavía no corresponden muestran solo su título y en qué sprint se harán.

| Ruta | Pantalla | Acceso | Qué hace hoy |
| --- | --- | --- | --- |
| `/` | Inicio | Pública | Bienvenida con "Crear cuenta", "Ingresar" y "Ver la base técnica" |
| `/ingreso` | Ingreso | Pública | Validaciones y errores; sirve cualquier correo y contraseña (la contraseña «error» muestra el mensaje de credenciales incorrectas) |
| `/registro` | Registro | Pública | Nombres, apellidos, usuario, correo, contraseña y avatar, con validaciones (el usuario «admin» muestra el error de usuario ocupado) |
| `/ayuda` | Ayuda | Pública | Preguntas frecuentes |
| `/base-tecnica` | **Base técnica (TS-00)** | Pública | Pide el dato a la API. Botones para ver los tres casos: cargando, error con "Reintentar" y éxito (dato real) |
| `*` | Página no encontrada (404) | Pública | Mensaje claro y enlace a Mis salas |
| `/salas` | Mis salas | Privada | Título y mensaje: se hará en los sprints 2 y 3 (US-06, US-07, US-08) |
| `/salas/:id` | Sala | Privada | Título y mensaje: se hará en los sprints 3, 4 y 5 (US-09 a US-14) |
| `/perfil` | Perfil | Privada | Título y mensaje: se hará en el Sprint 2 (US-04, US-05) |

Una ruta privada sin sesión lleva al ingreso y, al ingresar, vuelve a la ruta pedida. "Cerrar sesión" vuelve al inicio.

## Estructura

```
src/
├── main.tsx            # Arranque, fuentes y estilos
├── App.tsx             # Rutas
├── config.ts           # URL de la API (VITE_API_URL)
├── index.css           # Guía visual: colores claro y oscuro, foco y componentes
├── components/         # LayoutPublico y LayoutApp (encabezado, navegación, pie), campos, avatar, pantalla pendiente
├── sesion/             # Sesión de demostración y ruta privada
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
