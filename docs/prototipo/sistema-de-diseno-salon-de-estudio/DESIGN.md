---
name: Salón de Estudio Design System
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded7e6'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f1ff'
  surface-container: '#f2ebfa'
  surface-container-high: '#ece5f5'
  surface-container-highest: '#e7e0ef'
  on-surface: '#1d1a24'
  on-surface-variant: '#494455'
  inverse-surface: '#322f3a'
  inverse-on-surface: '#f5eefd'
  outline: '#7a7486'
  outline-variant: '#cbc3d7'
  surface-tint: '#693adc'
  primary: '#541cc7'
  on-primary: '#ffffff'
  primary-container: '#6d3fe0'
  on-primary-container: '#e4d9ff'
  inverse-primary: '#cebdff'
  secondary: '#643fcd'
  on-secondary: '#ffffff'
  secondary-container: '#7d5be7'
  on-secondary-container: '#fffbff'
  tertiary: '#005727'
  on-tertiary: '#ffffff'
  tertiary-container: '#117137'
  on-tertiary-container: '#99f2aa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#21005e'
  on-primary-fixed-variant: '#5114c4'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#cdbdff'
  on-secondary-fixed: '#1f005f'
  on-secondary-fixed-variant: '#4e23b7'
  tertiary-fixed: '#9df6ae'
  tertiary-fixed-dim: '#82d994'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005224'
  background: '#fdf7ff'
  on-background: '#1d1a24'
  surface-variant: '#e7e0ef'
typography:
  display:
    fontFamily: Noto Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

Este sistema de diseño está concebido para una plataforma de aprendizaje reflexivo, gestión académica y concentración estructurada. La identidad visual proyecta calma intelectual, rigor institucional y modernidad equilibrada mediante una estética minimalista estructurada con toques contemporáneos de diseño plano e industrial.

Se prioriza el orden visual estricto para mitigar la sobrecarga cognitiva durante sesiones prolongadas de estudio. Las jerarquías se definen mediante contraste tonal y delineados continuos firmes, evitando artificios visuales recargados como difuminados o texturas complejas. La experiencia general transmite estabilidad, disciplina y claridad de propósito.

## Colors

El sistema define paletas simétricas y coherentes para modos claro y oscuro, asegurando legibilidad WCAG AAA en bloques textuales y AA en controles de acción.

### Modo Claro (Predeterminado)
- **Fondo:** `#FFFFFF`
- **Superficie / Contenedor:** `#F4F2F9`
- **Texto Principal:** `#2B2833`
- **Texto Secundario / Metadatos:** `#5A5469`
- **Bordes e Interiores:** `#E3DEED`
- **Principal:** `#6D3FE0` (texto contrastante `#FFFFFF`)
- **Enlaces / Interacción:** `#5B35C4`
- **Error:** `#B3261E`
- **Éxito:** `#1F7A3F`

### Modo Oscuro
- **Fondo:** `#2B2833`
- **Superficie / Contenedor:** `#25222D`
- **Texto Principal:** `#F3F1F8`
- **Texto Secundario / Metadatos:** `#BDB8CC`
- **Bordes e Interiores:** `#3A3546`
- **Principal:** `#6D3FE0` (texto contrastante `#FFFFFF`)
- **Enlaces / Interacción:** `#C4B1FF`
- **Error:** `#FF8AA0`
- **Éxito:** `#57D58A`

Reglas de aplicación:
- Los bordes y delimitadores siempre utilizan trazos continuos correspondientes al tono de borde de cada modo.
- El color principal `#6D3FE0` mantiene una presencia focal y nunca compite con fondos cromáticos intensos.

## Typography

El sistema utiliza exclusivamente **Noto Sans** para todos los niveles y componentes. Su estructura neutral y soporte multilingüe proporcionan una lectura continua cómoda en documentos extensos, guías y ejercicios.

- **Jerarquía:** Los encabezados (`headline-*`) se mantienen compactos para preservar el espacio vertical en interfaces de alta densidad analítica.
- **Cuerpo de texto:** Se garantiza un interlineado generoso (mínimo 1.5x) en `body-lg` y `body-md` para facilitar la absorción de conceptos complejos.
- **Etiquetas e interfaces:** Los elementos interactivos y de estado emplean pesos medios y seminegrita (`500` y `600`) para ofrecer un anclaje visual inmediato sin aumentar el tamaño de fuente.

## Layout & Spacing

El diseño se basa en un sistema de retícula fluido con restricciones de ancho máximo para optimizar la longitud de línea de lectura (máximo 75 caracteres por línea de texto corrido).

- **Desktop (≥ 1024px):** Rejilla de 12 columnas, márgenes externos de 32px (`2rem`), medianiles (gutters) de 24px (`1.5rem`).
- **Tablet (768px – 1023px):** Rejilla de 8 columnas, márgenes de 24px (`1.5rem`), medianiles de 16px (`1rem`).
- **Mobile (< 768px):** Rejilla de 4 columnas, márgenes de 16px (`1rem`), medianiles de 16px (`1rem`).

El ritmo vertical y horizontal sigue una escala modular base de 4px / 8px. Los paddings internos de contenedores deben conservar coherencia proporcional con los radios de borde contiguos.

## Elevation & Depth

Este sistema prescinde de sombras difusas pronunciadas y efectos de desenfoque de fondo. La profundidad se resuelve a través de dos mecanismos:

1. **Estratificación tonal de superficies:** La superficie `#F4F2F9` (en modo claro) o `#25222D` (en modo oscuro) se sitúa directamente sobre el plano de fondo para diferenciar áreas agrupadas de trabajo o paneles laterales.
2. **Contornos sólidos estructurales:** Todo contenedor, panel flotante, tarjeta o menú desplegable se delimita con un borde sólido de `1.5px`. No se permiten líneas discontinuas o punteadas. En estados de elevación superior (como modales o menús contextuales), se utiliza una sombra de contacto rígida u opacidad mínima (`rgba(43, 40, 51, 0.08)` en claro, `rgba(0, 0, 0, 0.35)` en oscuro) combinada siempre con el borde perimetral obligatorio de `1.5px`.

## Shapes

La geometría del sistema equilibra funcionalidad técnica y calidez pedagógica aplicando especificaciones estrictas según la tipología del componente:

- **Botones y campos de entrada:** Radio exacto de `8px`.
- **Tarjetas y paneles modulares:** Radio exacto de `10px`.
- **Píldoras de estado y etiquetas de metadatos:** Formato completamente redondeado (`rounded-full` o radio ≥ `9999px`).
- **Bordes y delineados:** Todos los contornos llevan un grosor uniforme de `1.5px` continuo y sólido. Las líneas divisorias entre bloques también conservan `1.5px` de trazo.
- **Iconografía:** Los íconos consisten exclusivamente en líneas de trazo uniforme de `2px`, esquinas terminales redondeadas y estética de contorno abierto, alineados a una cuadrícula de 24×24px.

## Components

### Botones
- **Estructura:** Altura estándar de 40px o 48px, padding horizontal de 16px (`space-md`), esquinas con radio de `8px`. Borde de `1.5px` sólido según la variante.
- **Primario:** Fondo `#6D3FE0`, texto `#FFFFFF`, borde `#6D3FE0`. En hover: opacidad 92% o fondo oscurecido `#5B35C4`.
- **Secundario:** Fondo transparente o superficie, texto `#2B2833` (modo claro) / `#F3F1F8` (modo oscuro), borde sólido de `1.5px` con el color de borde correspondiente.
- **Crítico:** Fondo `#B3261E` (claro) / `#FF8AA0` (oscuro con texto oscuro), borde sólido de `1.5px`.

### Campos de Entrada (Input Fields)
- **Estructura:** Altura de 44px, radio de `8px`, relleno horizontal de 12px, borde sólido de `1.5px`.
- **Estados:** 
  - Reposo: Fondo de superficie, borde neutro de `1.5px`.
  - Foco: Borde de `1.5px` en `#6D3FE0`, sin anillos difusos exteriores.
  - Error: Borde de `1.5px` en `#B3261E` (modo claro) o `#FF8AA0` (modo oscuro), con texto de apoyo del mismo color.

### Tarjetas (Cards)
- **Estructura:** Radio perimetral de `10px`, borde sólido de `1.5px`, fondo de superficie (`#F4F2F9` en claro / `#25222D` en oscuro).
- **Relleno:** 24px (`space-lg`) para módulos de lectura o resumen; 16px (`space-md`) para ítems compactos.
- **Sin sombras:** La jerarquía se mantiene a través del contraste superficie/fondo y el borde de `1.5px`.

### Píldoras de Estado (Status Badges / Chips)
- **Estructura:** Radio de `9999px` (completamente redondeadas), padding de 4px vertical por 12px horizontal.
- **Borde:** Trazo perimetral de `1.5px` sólido.
- **Semántica:**
  - Éxito: En claro, texto y borde `#1F7A3F` con relleno levemente tintado; en oscuro, texto y borde `#57D58A`.
  - Error: En claro, texto y borde `#B3261E`; en oscuro, texto y borde `#FF8AA0`.
  - Neutro / Actividad: Texto secundario con borde neutro de `1.5px`.

### Casillas de Verificación y Opciones Radiales (Checkboxes & Radios)
- **Checkboxes:** Caja cuadrada de 18×18px con esquinas redondeadas a 4px y borde de `1.5px` sólido. Al marcarse, fondo `#6D3FE0` con check blanco de trazo `2px`.
- **Radios:** Círculo de 18×18px con borde de `1.5px` sólido. Al seleccionarse, punto central concéntrico relleno de `#6D3FE0`.

### Listas y Tablas de Contenido
- Ítems organizados mediante separadores horizontales sólidos de `1.5px`.
- Espaciado vertical holgado (padding vertical mínimo de 12px) para preservar la legibilidad de apuntes y listados académicos.

### Iconografía Integrada
- Íconos lineales con trazo invariable de `2px`, siempre coherentes en grosor tanto al combinarse con tipografía regular como con botones destacados.