# Prototipo de referencia (Google Stitch)

Exportado de Google Stitch y renombrado con el formato
`<pantalla>-<escritorio|celular>-<claro|oscuro>[-<estado o variante>]`.
Cada carpeta tiene `code.html` (maqueta) y `screen.png` (captura).
Las carpetas `sistema-de-diseno-*` solo tienen `DESIGN.md`.

## Cobertura del Sprint 1 (TS-01)

Leyenda: ✅ existe · ⚠️ parcial (solo en el prototipo interactivo, como toast, o sin pantalla propia) · ❌ falta

| Flujo | Dispositivo | Pantalla base | Cargando | Error | Éxito |
|---|---|---|---|---|---|
| Registro manual | Escritorio | ✅ claro y oscuro (`registro-escritorio-*-con-google`) | ❌ | ✅ claro: correo ya registrado · ✅ oscuro: usuario ya existe · ⚠️ validación de campos en el interactivo | ⚠️ toast «Cuenta creada con éxito» en el interactivo |
| Registro manual | Celular | ✅ claro y oscuro (`registro-celular-*-con-google`) | ❌ | ✅ oscuro: datos inválidos · ❌ claro | ❌ |
| Registro con Google | Escritorio | ✅ botón «Registrarse con Google» | ⚠️ toast «Autenticando con Google…» en el interactivo | ❌ | ⚠️ toast + paso a Mis salas en el interactivo |
| Registro con Google | Celular | ✅ botón en `registro-celular-*-con-google` | ❌ | ❌ | ❌ |
| Elegir username | Escritorio | ❌ (solo el campo dentro del registro manual) | ❌ | ⚠️ «Ese nombre de usuario ya existe» dentro del registro | ❌ |
| Elegir username | Celular | ❌ | ❌ | ❌ | ❌ |
| Ingreso | Escritorio | ✅ claro y oscuro | ❌ | ❌ | ⚠️ paso a Mis salas en el interactivo |
| Ingreso | Celular | ✅ claro y oscuro | ❌ | ✅ claro y oscuro: «Correo o contraseña incorrectos» | ❌ |
| Cierre de sesión | Escritorio | ⚠️ botón «Salir» en Mis salas, solo en el interactivo | ❌ | ❌ | ❌ |
| Cierre de sesión | Celular | ❌ | ❌ | ❌ | ❌ |
| Mis salas vacío | Escritorio | ❌ (solo existe con 3 salas de ejemplo) | ❌ | ❌ | — |
| Mis salas vacío | Celular | ❌ (solo existe con 3 salas de ejemplo) | ❌ | ❌ | — |

### Notas

- Las variantes `*-demo-sprint0` son el registro del Sprint 0 (sin botón de Google y con el aviso «Demostración del Sprint 0»). Ese aviso no debe pasar al Sprint 1.
- Los dos prototipos interactivos tienen flujos distintos después de registrarse: `flujo-corregido` manda a Ingreso y `demo-sprint0` manda directo a Mis salas. Hay que decidir cuál vale para el Sprint 1.
- El único patrón de «cargando» que existe es el de la base técnica (spinner + «Cargando datos…»); sirve de referencia para los estados de carga que faltan.

## Fuera del Sprint 1

`inicio-publico-*`, `sala-*`, `nueva-sala-*`, `base-tecnica-*` (Sprint 0) y `404-*`.
