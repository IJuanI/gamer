# Plataforma — Polo Tecnológico del Paraná

Plataforma donde **personas** descubren **empresas** tecnológicas de la región y
publican **ideas/necesidades** para que las empresas las tomen.

> ⚠️ Los colores (azules) son **estimados**, no oficiales. Polo Tecnológico del
> Paraná no tiene una paleta de marca confirmada públicamente (ver
> `../README.md`). Cambialos en `tailwind.config.ts` cuando haya specs reales.

## Stack

- **Next.js 15** (App Router, React Server Components, Server Actions)
- **TypeScript**
- **Prisma** ORM sobre **SQLite** (cambiá `provider` a `postgresql` para producción)
- **Tailwind CSS**
- Auth propia con cookie de sesión firmada (JWT vía `jose`) + `bcryptjs`

## Modelo de usuarios

Un único modelo `User` que puede ser, **simultáneamente**:

- **Persona** — todo usuario lo es; puede descubrir empresas y publicar ideas.
- **Empresa** — pertenece a una o varias empresas vía `Membership` (N:N).
- **Admin** — flag `isAdmin`; accede al panel `/admin`.

Una empresa tiene muchos usuarios; un usuario puede estar en muchas empresas.

## Capacidades

| Acción | ¿Login? |
|---|---|
| Ver directorio de empresas y su detalle | ❌ No |
| Ver ideas publicadas | ❌ No |
| Publicar una idea | ✅ Sí |
| Tomar una idea (como empresa) | ✅ Sí + ser miembro de una empresa |
| Panel de administración | ✅ Sí + `isAdmin` |

## Puesta en marcha

```bash
cd plataforma
npm install
npm run setup    # prisma db push + seed de datos de ejemplo
npm run dev      # http://localhost:3000
```

### Usuarios de prueba (seed)

| Email | Contraseña | Roles |
|---|---|---|
| `admin@polo.test`  | `password123` | persona + empresa (2) + **admin** |
| `company@polo.test` | `password123` | persona + empresa (1) |
| `contributor@polo.test` | `password123` | persona |

**Admin**: Acceder a `/admin` para togglear **Modo Simulación**. Cuando está activado, la plataforma muestra datos de simulación junto con datos reales. Útil para demos y presentaciones.

## Estructura

```
plataforma/
├── app/
│   ├── empresas/            # directorio público + detalle [slug]
│   ├── ideas/               # listado, detalle [id], nueva
│   ├── login/ register/     # auth
│   ├── panel/               # panel del usuario
│   ├── admin/               # panel admin
│   ├── layout.tsx page.tsx globals.css
├── components/              # Nav, AuthForm, IdeaForm
├── lib/                     # db, auth, password, validation, actions
├── prisma/                  # schema.prisma + seed.ts
├── tests/
│   ├── unit/                # Vitest (validation, password)
│   └── e2e/                 # Playwright e2e + visual (__screenshots__)
├── Dockerfile docker-compose.yml
├── vitest.config.ts playwright.config.ts
└── logs/                    # dev.log / e2e-server.log (gitignored)
```

## Testing

Tres niveles del testing pyramid:

| Nivel | Herramienta | Comando | Qué cubre |
|---|---|---|---|
| **Unit** | Vitest | `npm run test:unit` | schemas zod, `slugify`, hashing de contraseñas |
| **E2E** | Playwright | `npm run test:e2e` | flujos reales: descubrir, registrarse, publicar y tomar ideas |
| **Visual** | Playwright | `npm run test:e2e` | snapshots full-page de las páginas públicas |

```bash
npx playwright install chromium   # una sola vez
npm run setup                     # seed de datos para los e2e
npm run test:all                  # unit + e2e + visual
```

- **Visual regression**: la primera corrida genera baselines en
  `tests/e2e/__screenshots__/`. Para actualizarlas a propósito:
  `npm run test:e2e:update`. Reporte HTML: `npm run test:e2e:report`.
- Playwright levanta su propio server en el puerto **3100** (DB seedeada), aparte
  del `npm run dev` en 3000.

## DX para agentes

- **Hot reload**: `npm run dev` (Fast Refresh de Next.js).
- **Logs a archivo**: `npm run dev:log` espeja la salida a `logs/dev.log`, y los
  e2e a `logs/e2e-server.log`. Un agente puede leer esos archivos para ver el
  resultado de la corrida sin acceso a la terminal.
- **Typecheck**: `npm run typecheck`.

### Docker Compose

```bash
docker compose up      # app en http://localhost:3000 con hot reload
```

Monta el código fuente (hot reload), corre `prisma db push` + seed al iniciar, y
expone `logs/` al host. Incluye un servicio Postgres comentado para correr
production-like (cambiando el `provider` de `schema.prisma` a `postgresql`).
