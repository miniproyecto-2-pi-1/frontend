---
name: Nocturne Focus & Study
colors:
  surface: '#25222D'
  surface-dim: '#14121c'
  surface-bright: '#3b3743'
  surface-container-lowest: '#0f0d17'
  surface-container-low: '#1d1a24'
  surface-container: '#211e29'
  surface-container-high: '#2b2833'
  surface-container-highest: '#36333e'
  on-surface: '#e7e0ef'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e7e0ef'
  inverse-on-surface: '#322f3a'
  outline: '#948ea0'
  outline-variant: '#494455'
  surface-tint: '#cebdff'
  primary: '#cebdff'
  on-primary: '#380094'
  primary-container: '#6d3fe0'
  on-primary-container: '#e4d9ff'
  inverse-primary: '#693adc'
  secondary: '#c9c4d8'
  on-secondary: '#312e3e'
  secondary-container: '#4a4758'
  on-secondary-container: '#bbb6ca'
  tertiary: '#cebdff'
  on-tertiary: '#352468'
  tertiary-container: '#68579e'
  on-tertiary-container: '#e4d9ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#21005e'
  on-primary-fixed-variant: '#5114c4'
  secondary-fixed: '#e5e0f4'
  secondary-fixed-dim: '#c9c4d8'
  on-secondary-fixed: '#1c1a28'
  on-secondary-fixed-variant: '#484555'
  tertiary-fixed: '#e8ddff'
  tertiary-fixed-dim: '#cebdff'
  on-tertiary-fixed: '#200a52'
  on-tertiary-fixed-variant: '#4c3b80'
  background: '#14121c'
  on-background: '#e7e0ef'
  surface-variant: '#36333e'
  text-primary: '#F3F1F8'
  text-secondary: '#BDB8CC'
  border-structural: '#3A3546'
  status-error: '#FF8AA0'
  status-success: '#57D58A'
  interactive-link: '#C4B1FF'
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

This design system is tailored for an immersive, distraction-free digital study hall and academic workspace. The visual language balances intellectual rigor, quiet contemplation, and contemporary utilitarian elegance. Rooted in a high-focus dark aesthetic with structural minimalism, the interface minimizes eye strain during extended night sessions and complex cognitive tasks.

The product evokes composure, discipline, and scholarly structure. Rather than relying on decorative blurs or complex skeuomorphic metaphors, the system establishes order through exact border weights, tonal containment, and deliberate typographical hierarchy.

## Colors

The design system operates with a native dark mode foundation engineered for WCAG AA compliance and reduced retinal fatigue.

- **Primary (`#6D3FE0`):** Anchors primary actions, focus states, user avatars, and high-priority progress indicators. Contrasts sharply against dark structural surfaces.
- **Secondary (`#BDB8CC`):** Drives secondary labels, inactive indicators, subheadings, and contextual hints.
- **Tertiary (`#C4B1FF`):** Reserved for interactive links, inline citations, and active text-level highlights.
- **Neutral Canvas (`#2B2833`) & Surface (`#25222D`):** The canvas background (`#2B2833`) establishes atmospheric depth, while panels, cards, and modal sheets use the deeper container value (`#25222D`) framed by crisp borders.
- **Status Identifiers:** System feedback relies on calibrated high-visibility tones: `#57D58A` for verification, completion, and success states; `#FF8AA0` for error warnings, blockers, and destructive actions.

## Typography

The typography relies entirely on **Noto Sans** across all roles, ensuring international language parity and high legibility across dense academic material. 

- **Scale Rhythm:** Headings remain balanced to prevent excessive vertical displacement on content-heavy study sheets.
- **Reading Comfort:** Body levels are tuned with relaxed line-height ratios (between 1.55x and 1.62x) to ensure smooth reading across dense notes, essays, and syllabi.
- **Interactive Microcopy:** Labels (`label-lg`, `label-md`, `label-sm`) use medium to semibold weights (`500` to `600`) to guarantee contrast against dark surfaces at small scales.

## Layout & Spacing

The layout model leverages a responsive grid anchored to an 8px base rhythm (with a 4px half-step for micro-spacings).

- **Desktop (≥ 1024px):** 12-column layout with 32px (`2rem`) page margins and 24px (`1.5rem`) gutters. Maximum text container width is capped at 75ch to preserve optimal reading speed.
- **Tablet (768px – 1023px):** 8-column structure with 24px (`1.5rem`) margins and 16px (`1rem`) gutters.
- **Mobile (< 768px):** 4-column structure with 16px (`1rem`) margins and 16px (`1rem`) gutters.
- **Component Padding:** Standard cards and content modules maintain 24px (`space-lg`) of internal padding, stepping down to 16px (`space-md`) on mobile viewports.

## Elevation & Depth

This design system avoids blurry drop shadows, heavy glows, and diffuse ambient light. Visual depth is established through two structured techniques:

1. **Tonal Planar Stacking:** Background canvas (`#2B2833`) establishes the base level, while active workspace surfaces, panels, and tool drawers sit on `#25222D`.
2. **Crisp Structural Borders:** Every card, input field, dialog, and panel uses a uniform `1.5px` solid border (`#3A3546`).
3. **Elevated Floating Overlays:** For modal viewports and popovers requiring direct focus, layers use an opaque `#25222D` fill, a `1.5px` border in `#3A3546` (or `#6D3FE0` when active), and a sharp contact occlusion shadow: `0 4px 16px rgba(0, 0, 0, 0.45)`.

## Shapes

The geometric framework applies precise, tailored radii depending on the functional tier of the component:

- **Buttons & Input Elements:** Set strictly to `8px` corner radius.
- **Cards & Content Panels:** Set strictly to `10px` corner radius.
- **Badges, Tags, & Status Pills:** Fully rounded pill shapes using `9999px` corner radius.
- **Checkboxes:** Standard square profile with `4px` corner radius.
- **Border Stroke:** All borders across containers, inputs, and controls maintain a persistent stroke thickness of `1.5px`.

## Components

### Buttons
- **Primary:** Background `#6D3FE0`, text `#FFFFFF`, border `1.5px` solid `#6D3FE0`, radius `8px`. Height is 44px (or 40px compact) with 16px horizontal padding. Hover shifts to `#5B35C4`.
- **Secondary / Outline:** Background transparent or `#25222D`, text `#F3F1F8`, border `1.5px` solid `#3A3546`, radius `8px`. Hover shifts border to `#6D3FE0` and text to `#C4B1FF`.
- **Destructive:** Background transparent, text `#FF8AA0`, border `1.5px` solid `#FF8AA0`, radius `8px`.

### Input Fields
- **Container:** Height 44px, radius `8px`, background `#25222D`, border `1.5px` solid `#3A3546`, text `#F3F1F8`, placeholder `#BDB8CC`.
- **Focus State:** Border changes to `1.5px` solid `#6D3FE0` with no outer glow.
- **Invalid State:** Border changes to `1.5px` solid `#FF8AA0`, paired with support caption in `#FF8AA0`.

### Cards & Panels
- **Structure:** Background `#25222D`, border `1.5px` solid `#3A3546`, radius `10px`. Internal padding is 24px (`space-lg`) on desktop and 16px (`space-md`) on mobile.
- **Headers & Dividers:** Internal dividers between card title and card body use a `1.5px` solid line in `#3A3546`.

### Chips & Status Pills
- **Geometry:** Height 26px, radius `9999px`, horizontal padding 10px, border `1.5px` solid.
- **Status Success:** Border `#57D58A`, text `#57D58A`, background `rgba(87, 213, 138, 0.12)`.
- **Status Error:** Border `#FF8AA0`, text `#FF8AA0`, background `rgba(255, 138, 160, 0.12)`.
- **Neutral Tag:** Border `#3A3546`, text `#BDB8CC`, background transparent.

### Checkboxes & Radio Controls
- **Checkboxes:** 18×18px box, radius `4px`, border `1.5px` solid `#3A3546`. When checked: fill `#6D3FE0`, border `#6D3FE0`, checkmark glyph in `#FFFFFF` with 2px stroke.
- **Radio Buttons:** 18×18px circle, border `1.5px` solid `#3A3546`. When selected: border `#6D3FE0`, containing a centered solid dot in `#6D3FE0` (8px diameter).

### Lists & Navigation Trees
- Grouped items use 12px vertical padding, separated by `1.5px` solid lines in `#3A3546`.
- Active list items highlight with a left accent border in `3px` solid `#6D3FE0` and a subtle surface tint of `rgba(109, 63, 224, 0.1)`.