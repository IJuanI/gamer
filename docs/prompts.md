# GamER Banner Generation — Prompt System

**Purpose**: Prompt templates and execution rules for generating GamER event banners.

## Read first

Before generating or editing banners, read:
1. `GAMER_BRANDING_GUIDELINES.md`
2. `GAMER_COLOR_PALETTE.md`
3. `banners/CLAUDE.md`

## Generation workflow

1. Receive event details
2. Map them to `EventData` in `lib/event-data.ts`
3. Choose or adapt the correct banner component
4. Verify format dimensions and safe zones
5. Preview locally when needed
6. Export PNG when needed

## Core rules

- Default language: Spanish (Argentine)
- Use only approved GamER colors, typography, and visual style
- No photography
- No CTA buttons
- Keep exact format dimensions and safe zones
- Use AZONIX for headlines and Inter for secondary/body text
- Keep the title as the dominant visual element
- Prioritize legibility over decoration
- Do not invent missing event data; omit it cleanly

## Supported format IDs

- `instagram-story`
- `instagram-feed-tall`
- `instagram-feed-post`
- `whatsapp-status`

Always use the repo format IDs above when prompting or wiring banner generation.

## Generic prompt template

```text
Tarea:
Generar o adaptar un banner de formato `[FORMATO_ID]` para GamER.

Datos del evento:
- tipo: [TIPO_EVENTO]
- titulo: [TITULO]
- subtitulo: [SUBTITULO]
- juegos: [LISTA]
- fecha: [FECHA]
- hora_o_horario: [HORA O RANGO]
- lugar: [VENUE]
- ciudad: [CIUDAD]
- precio: [PRECIO O "Gratis"]
- premios: [OPCIONAL]
- plataformas: [OPCIONAL]
- incluye: [OPCIONAL]
- info_extra: [OPCIONAL]

Restricciones:
- idioma: español argentino
- sin fotografías
- sin CTA
- sin inventar datos faltantes
- respetar branding GamER
- respetar dimensiones y safe zone del formato
- usar jerarquía visual clara
- priorizar legibilidad
```

## Tournament template

Use for:
- `torneo-hibrido`
- `torneo-online`
- `torneo-presencial`

```text
Tarea:
Generar o adaptar un banner de formato `[FORMATO_ID]` para GamER.

Datos del evento:
- tipo: torneo-hibrido | torneo-online | torneo-presencial
- titulo: [NOMBRE DEL TORNEO]
- subtitulo: [DESCRIPCIÓN CORTA]
- juegos: [LISTA DE JUEGOS]
- fecha: [FECHA EN ESPAÑOL]
- hora_o_horario: [HORA]
- lugar: [VENUE]
- ciudad: [CIUDAD]
- precio: [PRECIO O "Gratis"]
- premios: [LISTA DE PREMIOS]
- plataformas: [PC, PS5, Xbox, etc.]
- info_extra: [OPCIONAL]

Restricciones:
- idioma: español argentino
- sin fotografías
- sin botones CTA
- respetar branding y paleta oficial de GamER
- mantener dimensiones exactas y safe zone del formato
- usar AZONIX para titulares e Inter para texto secundario
- priorizar jerarquía clara: título > fecha > lugar/detalles
- no inventar datos faltantes; si un campo no existe, omitirlo con limpieza
```

### Tournament example

```text
Tarea:
Generar o adaptar un banner de formato `instagram-story` para GamER.

Datos del evento:
- tipo: torneo-hibrido
- titulo: TORNEO VALORANT
- subtitulo: Clasificatorio Regional Entre Ríos
- juegos: Valorant
- fecha: Sábado 26 de Abril
- hora_o_horario: 15:00 HS
- lugar: Nexus Cyber Café
- ciudad: Paraná, Entre Ríos
- precio: Gratis
- premios: 1° $50.000, 2° $25.000, 3° $10.000
- plataformas: PC
- info_extra: Formato 5v5 eliminación directa. Máximo 40 jugadores.

Restricciones:
- idioma: español argentino
- sin fotografías
- sin botones CTA
- respetar branding y paleta oficial de GamER
- mantener dimensiones exactas y safe zone del formato
- usar AZONIX para titulares e Inter para texto secundario
- priorizar jerarquía clara: título > fecha > lugar/detalles
- no inventar datos faltantes
```

## Cyber café template

Use for:
- `cyber-cafe`

```text
Tarea:
Generar o adaptar un banner de formato `[FORMATO_ID]` para GamER.

Datos del evento:
- tipo: cyber-cafe
- titulo: [NOMBRE]
- subtitulo: [DESCRIPCIÓN CORTA]
- juegos: [LISTA DE JUEGOS DISPONIBLES]
- fecha: [FECHA]
- hora_o_horario: [RANGO HORARIO]
- lugar: [VENUE]
- ciudad: [CIUDAD]
- precio: [PRECIO]
- incluye: [DETALLES]
- info_extra: [OPCIONAL]

Restricciones:
- idioma: español argentino
- sin fotografías
- sin botones CTA
- respetar branding y paleta oficial de GamER
- mantener dimensiones exactas y safe zone del formato
- usar AZONIX para titulares e Inter para texto secundario
- priorizar legibilidad sobre decoración
- no inventar datos faltantes; si un campo no existe, omitirlo con limpieza
```

## Format guidance

### `instagram-story`
- 1080×1920
- Keep critical text well inside the top/bottom safe areas
- Best for the most expressive decorative treatment
- Suggested hierarchy: logo/top label → title → date/venue/details

### `instagram-feed-tall`
- 1080×1440
- More compact and content-dense
- Cleaner than story layouts
- Suggested hierarchy: logo/type → title → date/venue/details

### `instagram-feed-post`
- 1080×1350
- Tightest vertical composition
- Use stronger grouping and less ornament
- Suggested hierarchy: logo/date → title/games → venue/prizes/details

### `whatsapp-status`
- 1080×1920
- Same canvas family as story, but readability should be even faster
- Prefer bolder, simpler composition
- Suggested hierarchy: logo/type → title/date → venue/details

Always respect exact dimensions and safe zones from `lib/formats.ts`.

## Visual defaults

- Dark background
- Purple-led identity with green accents
- Use grid, pixel, geometric, and HUD-style utilities from `globals.css`
- Use glow effects sparingly
- Keep compositions clean, readable, and high-contrast

## Editing existing banners

When modifying a banner:
1. read the current component first
2. preserve exact dimensions, safe zones, and `banner-frame`
3. keep content driven by `EventData`; do not hardcode event copy
4. stay within the approved palette and brand system
5. preview locally before finalizing when the change affects layout

## Adding new event types

1. Add the new type to `EventData["type"]` in `lib/event-data.ts`
2. Add a sample event
3. Update type-badge rendering in banner components
4. Update this document only if the new type needs distinct prompting guidance

## Animation note

Preview animations may be visible in-browser, but PNG export is static. Keep motion subtle and optional.

## Delivery checklist

- Correct format ID and dimensions
- All important content inside safe zone
- Brand typography and colors respected
- Title, date, and venue clearly readable
- No photography
- No CTA buttons
- Spanish-first copy
- Preview/export checked when required