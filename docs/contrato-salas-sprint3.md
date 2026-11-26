# Contrato del frontend con la API y el tiempo real (Sprint 3: salas y chat)

Lo que el frontend espera de `backend-api` (REST) y de `backend-realtime` (Socket.IO). La columna **Estado** dice si ya existe o si falta en el backend. Con `VITE_USE_MOCKS=true` el frontend simula todo esto en el navegador (ver `.env.example`).

## REST (`backend-api`, prefijo `/api/v1`)

Todas piden sesión (`Authorization: Bearer <idToken>`) y perfil completo. Los errores tienen la forma `{ error: { code, message, fields? } }`.

| Ruta | Para qué | Respuesta | Errores | Estado |
|---|---|---|---|---|
| `GET /rooms` | Salas que creó la persona | `[{ id, nombre, creadaEn, esAdministrador }]` | | Existe |
| `POST /rooms` | Crear sala (US-06) | `201` con la sala | `400 VALIDATION` | Existe |
| `GET /rooms/:id` | Una sala por su ID (US-08). Acepta el ID en minúsculas y con espacios | `200` con la sala | `404 ROOM_NOT_FOUND` | Existe |
| `PATCH /rooms/:id` | Editar el nombre (US-07). Cuerpo `{ nombre }` (1 a 50 caracteres) | `200` con la sala | `400 VALIDATION`, `403 FORBIDDEN` si no es el anfitrión, `404 ROOM_NOT_FOUND` | **Falta** |
| `DELETE /rooms/:id` | Eliminar la sala y su chat (US-07) | `204` | `403 FORBIDDEN`, `404 ROOM_NOT_FOUND` | **Falta** |
| `GET /rooms/:id/messages?limite=50&antes=<ISO>` | Historial (US-11), ordenado del más viejo al más nuevo. Sin `antes` devuelve los últimos; con `antes` los anteriores a esa fecha | `{ mensajes: Mensaje[], hayMas: boolean }` | `404 ROOM_NOT_FOUND` | **Falta** |

La sala (`GET`, `POST` y `PATCH /rooms`) debe incluir `anfitrionUid`, el `uid` de quien la creó, para que el frontend marque al anfitrión en la lista de participantes. Hoy solo llega `esAdministrador`, que dice si quien pregunta es el anfitrión; sin `anfitrionUid`, un invitado no puede saber quién lo es. Estado: **Falta**.

`Mensaje` = `{ id, uid, username, texto, creadoEn }` (`creadoEn` en formato ISO).

## Tiempo real (`backend-realtime`, Socket.IO)

La conexión envía `auth: { token: <idToken> }`. Cada evento del navegador recibe un acuse `{ ok, error? }`.

| Evento | Dirección | Datos | Estado |
|---|---|---|---|
| `unirse` | navegador → servidor | `{ roomId }` | Existe |
| `mensaje` | navegador → servidor | `{ roomId, texto }` (1 a 1000 caracteres) | Existe |
| `salir` | navegador → servidor | `{ roomId }` | Existe |
| `presencia` | servidor → sala | `{ roomId, personas: [{ uid, username, avatar }] }` | Existe |
| `mensaje` | servidor → sala | `Mensaje` | Existe |
| `sala-eliminada` | servidor → sala | `{ roomId }`. Se emite cuando el anfitrión elimina la sala, para que los participantes vean el aviso y vuelvan a Mis salas (US-07) | **Falta** |
| `sala-actualizada` | servidor → sala | `{ roomId, nombre }`. Se emite cuando el anfitrión cambia el nombre | **Falta** |

Al reconectarse, el frontend vuelve a emitir `unirse` por cada sala en la que estaba.
