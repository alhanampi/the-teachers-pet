# Teacher's Pet

App (PWA, mobile-first) para que niños de 7 a 12 años practiquen inglés. El alumno escribe su
nombre, elige nivel (A1–C2) y dificultad, y resuelve ejercicios, ganando un punto por cada uno
completado.

## Fase actual

**Fase 1: flujo del alumno, sin login.** Login (Clerk) y backoffice docente son fase 2, todavía
no implementados. No adelantar esas piezas antes de que se pida explícitamente.

## Stack

- Vite + React + TypeScript
- styled-components para todo el estilado (sin librerías de componentes de terceros, sin CSS
  suelto ni estilos inline)
- **PWA, mobile-first.** La app se instala como PWA (manifest + service worker vía
  `vite-plugin-pwa`). Todo el diseño se piensa primero para celular/tablet: estilos base sin
  media query = mobile, y se agregan `min-width` media queries (breakpoints en
  `src/styles/theme.ts`) recién cuando hace falta adaptar a pantallas más grandes. Nunca al
  revés (desktop-first con overrides para mobile).
- **Sin router en esta fase.** El alumno hace todo en `/`: `App.tsx` renderiza según un `step`
  (`"welcome" | "level" | "difficulty" | "exercise" | "summary"`) guardado en `StudentContext`,
  sin cambiar de URL. `react-router-dom` se agrega recién en fase 2, para rutas del docente
  (`/teacher`, `/teacher/login`) — el alumno nunca navega por URL.
- Estado del alumno: React Context + `useReducer` (`src/state/StudentContext.tsx`). No usar
  Redux/Zustand/otras libs de estado global salvo que el alcance crezca mucho.
- Persistencia: Neon (Postgres) vía funciones serverless de Vercel en `/api/*.ts`. El browser
  **nunca** se conecta directo a la base — todo pasa por `/api` usando
  `@neondatabase/serverless`.
- `vercel dev` (devDependency) para levantar frontend + `/api` juntos en local.
- Clerk **no está instalado todavía** — se agrega junto con el backoffice en fase 2.

## Convenciones de código

- Componentes funcionales con hooks. Un componente por archivo.
- Archivos de componente: `PascalCase.tsx`. Utilidades/helpers: `camelCase.ts`.
- Props tipadas con `interface`. TypeScript estricto, nada de `any`.
- Sin comentarios salvo para explicar un porqué no obvio (constraint oculto, workaround). Nunca
  comentarios que describan qué hace el código.
- **Cada componente vive en su propia carpeta, con su archivo de estilos separado:**
  `ComponentName/ComponentName.tsx` + `ComponentName/ComponentName.styles.ts` (+
  `ComponentName/index.ts` re-exportando, para poder importar como
  `from ".../ComponentName"`). Los `styled(...)` van siempre en el `.styles.ts`; el `.tsx` los
  importa y solo tiene JSX + lógica. Nunca un `styled(...)` definido inline en el mismo archivo
  que el componente.
- Estilos siempre con styled-components, usando el theme centralizado en `src/styles/theme.ts`
  (colores, spacing, radios, tipografía, breakpoints) + `ThemeProvider`. No hardcodear
  colores/spacing fuera del theme.
- No agregar abstracciones, flags o manejo de errores para casos que no pueden pasar en este
  alcance. No diseñar para requisitos hipotéticos futuros.

## Estructura de carpetas

```
api/
  _db.ts              helper de conexión Neon (CREATE TABLE IF NOT EXISTS incluido)
  session.ts          POST — crea/recupera alumno
  attempts.ts         POST — registra intento, suma punto
  progress.ts         GET  — puntos actuales de un alumno
public/
  manifest.webmanifest (o generado por vite-plugin-pwa), íconos PWA
src/
  main.tsx
  App.tsx             renderiza el step actual (sin router)
  steps/
    Welcome/
      Welcome.tsx
      Welcome.styles.ts
      index.ts
    LevelSelect/...
    DifficultySelect/...
    Exercise/...
    Summary/...
  components/
    layout/
      Header/          dropdown de tema, visible en todas las pantallas
    exercises/          un componente por tipo de ejercicio, cada uno en su carpeta
    ui/                  Button, Card, PointsBadge, etc., cada uno en su carpeta
  state/
    StudentContext.tsx
    ThemeContext.tsx    tema de color activo + selector, persistido en localStorage
  lib/
    api.ts               wrappers fetch a /api/*
  data/
    exercises.json
  types/
    exercise.ts
  styles/
    theme.ts             forma del theme (colores, spacing, radios, breakpoints) + tipos
    themes/               las 5 paletas de color disponibles
    GlobalStyle.ts
```

## Modelo de datos (Neon)

```sql
students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points integer not null default 0,
  created_at timestamptz not null default now()
)

attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  exercise_id text not null,
  level text not null,
  difficulty text not null,
  points integer not null default 1,
  created_at timestamptz not null default now()
)
```

`students.points` está desnormalizado para lectura rápida. `attempts` guarda el historial
completo, pensado para el backoffice docente de fase 2.

## Contrato de `/api`

- `POST /api/session` — body `{ name: string, studentId?: string }`. Si `studentId` existe y es
  válido, reutiliza ese alumno (actualiza `name` si cambió); si no, crea uno nuevo. Devuelve
  `{ studentId, name, points }`.
- `POST /api/attempts` — body `{ studentId: string, exerciseId: string, level: Level,
difficulty: Difficulty }`. Inserta el intento, incrementa `students.points` en 1. Devuelve
  `{ points }`.
- `GET /api/progress?studentId=` — devuelve `{ name, points }`.

## Seguridad

Reglas fijas para todo lo que toque `/api` o inputs del alumno. No son solo para esta fase: se
mantienen cuando se agregue el backoffice docente en fase 2.

- **SQL solo parametrizado.** Con `@neondatabase/serverless`, las queries se escriben siempre
  como tagged template: `` sql`SELECT ... WHERE id = ${valor}` ``. Nunca construir SQL con
  concatenación/interpolación de strings, y nunca usar `sql.unsafe(...)` ni pasar identificadores
  de tabla/columna que vengan de un request. Si algún día hace falta un identificador dinámico,
  se valida antes contra una whitelist fija en código, nunca se arma con el valor crudo del
  cliente.
- **Todo `req.body`/`req.query` es hostil, no importa lo que exista en el frontend.** Los tipos
  de TypeScript del cliente (`Level`, `Difficulty`, etc.) no protegen el endpoint: cualquiera
  puede pegarle a `/api/*` directo con curl. Cada handler valida explícitamente lo que recibe
  antes de tocar la base — eso vive en `api/_validate.ts` (`isValidUuid`, `isValidLevel`,
  `isValidDifficulty`, límites de longitud) y cada handler (`session.ts`, `attempts.ts`,
  `progress.ts`) lo usa antes de cualquier query. Si se agrega un campo nuevo con dominio
  cerrado, se valida ahí, no solo con el tipo de TS.
- **Longitudes acotadas también en el servidor.** El `maxLength` de un `<input>` es UX, no
  seguridad — se puede saltear pegándole directo a la API. Cualquier string que se guarda en
  Neon (`name`, `exerciseId`) tiene un límite explícito del lado del servidor
  (`MAX_NAME_LENGTH`, `MAX_EXERCISE_ID_LENGTH` en `api/_validate.ts`).
- **`studentId` se trata como credencial, no como dato público.** Se genera con
  `crypto.randomUUID()` (no incremental, no adivinable) y todo endpoint que lo recibe valida que
  tenga forma de UUID antes de usarlo en una query. No loguear `studentId` en texto plano fuera
  de lo estrictamente necesario para debug.
- **Los handlers de `/api` nunca devuelven el error crudo de Postgres al cliente.** Cada handler
  envuelve su lógica en `try/catch`: loguea el error completo con `console.error` server-side y
  responde con un mensaje genérico (`res.status(500).json({ error: "..." })`). Un mensaje de
  Postgres (`invalid input syntax for type uuid: "..."`, nombres de columnas, etc.) es
  información interna que no debe llegar al browser.
- **XSS: confiar en el escapeo de React, no reinventar sanitización.** JSX escapa automáticamente
  todo lo que se renderiza como texto (nombre del alumno, contenido de `exercises.json`, etc.).
  Por eso: nunca usar `dangerouslySetInnerHTML` con datos que vengan del alumno o de la base, y
  nunca construir HTML a mano con template strings para insertarlo en el DOM.
- **Secrets fuera del repo.** `DATABASE_URL` vive únicamente en `.env.local` (local) o en las
  variables de entorno del proyecto en Vercel (deploy) — nunca hardcodeada en código ni
  commiteada. `.gitignore` ignora explícitamente `.env` y `.env.*` (no solo `*.local`), así un
  `.env` con la connection string real nunca puede terminar commiteado por error.
- **Sin autenticación en fase 1** (ver "Fase actual"): cualquiera que tenga un `studentId` puede
  leer/escribir el progreso de ese alumno vía `/api`. Es un riesgo aceptado mientras no haya
  login — no agregar autenticación real antes de fase 2, pero tampoco bajar las validaciones de
  arriba pensando que "total no hay login todavía": son la única barrera actual contra abuso e
  inyección de datos basura en Neon.

## Ejercicios

`src/data/exercises.json`, tipado en `src/types/exercise.ts` como unión discriminada por `type`:
`"multiple-choice" | "fill-blank" | "matching" | "word-order"`. Cada tipo tiene su propio
componente en `src/components/exercises/`, todos con la interfaz
`{ exercise, onComplete(correct: boolean) }`.

Si la respuesta es incorrecta, `Exercise.tsx` ofrece "Try again" además de "Next": reintentar
remonta el componente del ejercicio (cambiando su `key` a `${exercise.id}-${attempt}`) para que
recupere su estado inicial, en vez de agregarle a cada componente una función de reset propia. El
punto se otorga una sola vez por ejercicio, en el primer intento (correcto o no) — reintentar no
suma puntos de nuevo.

## UI/UX

Pensado para chicos de 7 a 12 años, **mobile-first** (celular y tablet como pantallas
principales, desktop es secundario): tipografía redondeada (Google Font tipo "Baloo 2" o
"Fredoka"), tamaños grandes, paleta brillante y de alto contraste, botones grandes con bordes
redondeados y buen tamaño para el dedo (mínimo ~44px de alto). Feedback siempre
positivo/alentador, nunca punitivo. Texto corto, apoyado en íconos/emojis. Layouts en columna
única por default; grillas de más de una columna solo a partir de los breakpoints de tablet.

**Ninguna pantalla debe requerir scroll**, ni siquiera con el teclado del celular desplegado
(pantallas con input: `Welcome`, `FillBlank`). Para eso:

- `useViewportHeightSync` (`src/lib/useViewportHeightSync.ts`), montado una vez en `App.tsx`,
  escucha `window.visualViewport` y guarda la altura real visible en la variable CSS
  `--app-height`, que `GlobalStyle` usa para el `<html>` (con `100dvh` como fallback). Así el
  layout se achica de verdad cuando aparece el teclado, en vez de quedar con la altura de antes.
- El meta viewport en `index.html` incluye `interactive-widget=resizes-content` (ayuda a Chrome/
  Android a achicar el viewport en vez de tapar contenido con el teclado).
- `body`/`#root` tienen `overflow: hidden` — la página nunca scrollea como un todo.
- `Screen` (`src/components/ui/Screen/Screen.styles.ts`) tiene su propio `overflow-y: auto` como
  red de seguridad local (por ejemplo, con fuentes de accesibilidad muy grandes), pero el
  objetivo es que nunca haga falta: por eso el gap/padding de `Screen` es compacto en mobile.
- Antes de agregar contenido a una pantalla, pensar en el peor caso: celular chico (iPhone SE)
  con teclado abierto (~250px de alto visible menos el header). Si no entra, achicar
  espaciados/tamaños antes que agregar scroll.

## Idioma

**Todo el texto que ve el alumno está en inglés**: títulos, subtítulos, botones, placeholders,
aria-labels, nombres de los temas de color, `<title>` e `index.html` (`lang="en"`), y el
manifest de la PWA. La única excepción son los datos de los propios ejercicios cuando el
ejercicio requiere mezclar idiomas a propósito (por ejemplo, en `matching` de vocabulario donde
el par derecho es la traducción al español de la palabra en inglés) — ahí no se traduce, porque
traducirlo rompería el ejercicio. Este archivo (`CLAUDE.md`) y los comentarios de código quedan
en español, porque son para quien desarrolla, no para el alumno.

## Header y temas de color

Hay un `Header` fijo arriba de toda la app (todas las pantallas, incluida `Welcome`) con un
dropdown para que el alumno elija entre **5 paletas de color** distintas (mismo layout y
componentes, solo cambia el set de colores). Las 5 paletas viven como objetos `AppTheme` en
`src/styles/themes/`, compartiendo la misma forma que `src/styles/theme.ts` define. La paleta
elegida se guarda en `localStorage` y se aplica envolviendo la app en el `ThemeProvider` de
styled-components con el theme activo (manejado desde `src/state/ThemeContext.tsx`, separado de
`StudentContext` porque no tiene que ver con la sesión del alumno).

## PWA

`vite-plugin-pwa` genera el manifest y el service worker. Nombre visible: **Teacher's Pet**.
Ícono placeholder: una manzanita (todavía no hay logo definitivo) — vive como SVG en
`public/icons/` y se referencia en el manifest y el favicon. Cuando haya un logo real, solo hay
que reemplazar esos archivos, no la configuración. Mobile-first aplica tanto al CSS como a la
disposición de los elementos táctiles (Header, botones de ejercicios, etc).

## Formateo

El formateo lo maneja **Prettier** (`.prettierrc.json`), no criterio manual ni el `--fix` de
ESLint. `eslint-config-prettier` apaga las reglas de ESLint que puedan pisarse con Prettier.
Antes de dar un cambio por terminado: `npm run format` (o `npm run format:check` para solo
chequear, útil en CI).

## Cómo correr y verificar

- `npm run dev` para frontend solo; `vercel dev` para probar también `/api` contra Neon.
- `npm run format:check`, `npx tsc --noEmit` y `npm run lint` antes de dar por terminado un
  cambio.
- Verificación manual: recorrer nombre → nivel → dificultad → ejercicios (los 4 tipos) →
  resumen, y confirmar en la consola de Neon que aparecen filas en `students`/`attempts` y que
  `points` se actualiza.
- Requiere `DATABASE_URL` en `.env.local` (connection string de Neon, no se commitea).

## Fuera de alcance ahora

Login con Clerk, backoffice docente, mover ejercicios de JSON a la base de datos. Son fase 2.
