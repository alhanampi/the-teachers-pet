# Roadmap

Mejoras futuras propuestas para Teacher's Pet, agrupadas en tres frentes: motivación del alumno,
herramientas del docente, y solidez técnica. Ninguna está empezada todavía — este documento es
un punto de partida para decidir qué encarar a continuación, no un backlog en curso.

Consultarlo antes de proponer una mejora grande: puede que ya esté pensada acá, con su alcance ya
acotado.

## Convención de versionado

El estado actual en producción (Phase 3: cuentas de alumno con Clerk, los 3 tabs, Vocabulary, My
Stats) se toma como **v1.0**. A partir de ahí, cada mejora tiene su propio número — no es semver
estricto ni implica un orden de implementación obligatorio, es solo una forma de nombrar cada
mejora sin ambigüedad ("hagamos v1.3").

- **v1.x** — mejoras que suman sobre lo que ya existe, sin romper nada ni cambiar la arquitectura
  de fondo.
- **v2.x** — apuestas más grandes, con un cambio estructural de por medio (nuevo modelo de datos
  importante, un rol nuevo, una herramienta nueva en el flujo de trabajo).

## Motivación del alumno

- **v1.6 — Racha de práctica diaria.** Columna liviana en `students` (`last_practiced_at`,
  `current_streak`), actualizada en cada intento. Mostrada con tono alentador ("🔥 3 días
  seguidos") en el Header o en My Stats, nunca punitiva si se corta.
- **v1.7 — Sistema de logros/badges.** Calculado desde `attempts` tal cual existe hoy (sin nueva
  infraestructura de tracking): primer ejercicio completado, ronda perfecta, nivel más alto
  alcanzado, total de puntos. `attempts` no guarda el `type` del ejercicio ni tiene FK real a
  `exercises` (`exercise_id` es `text`), así que los logros se basan en lo que ya está
  denormalizado ahí (nivel, dificultad, cantidad, aciertos) — no en "qué tipos de ejercicio
  probó". Mostrados en una galería chica en "My Stats" (`src/tabs/Stats`).
- **v1.8 — Mecánica de "hotspot" en Vocabulary.** Ya anotada como pendiente en `CLAUDE.md`: tocar
  un punto de una escena revela una palabra. Sin editor visual de coordenadas todavía — cada
  escena es un dato hand-authored más en `src/data/vocabulary.ts`
  (`{ id, image, hotspots: [{ x, y, wordId }] }`), mismo patrón que ya se usó para categorías y
  los pares de antónimos/ejemplos de color.
- **v2.1 — Recordatorio de práctica diaria.** Notificación PWA o aviso in-app para un alumno con
  cuenta real que no practicó hoy. Se omite por completo en modo invitado, coherente con que ese
  modo no persiste nada.
- **v2.2 — Sistema de recompensas cosmético.** Temas de color o variantes desbloqueables por
  puntos/logros, sobre la infraestructura de temas que ya existe (`ThemeContext`,
  `.claude/rules/header-themes.md`).

## Herramientas del docente

- **v1.9 — Asignar ejercicios puntuales a un alumno.** Tabla nueva `assignments` (`student_id,
exercise_id, created_at`), con una sección "Recomendado para vos" antes del selector de
  nivel/dificultad en Quizzes.
- **v1.10 — Vista agregada por clase.** En `AdminDashboard`, reusar `summarizeByGroup`
  (`src/lib/attemptSummary.ts`) sumando los `attempts` de todos los alumnos de un docente, no
  solo de a uno.
- **v1.11 — Editor de Vocabulary para el docente.** Migrar `src/data/vocabulary.ts` a Neon (mismo
  camino que ya recorrieron los ejercicios, ver `.claude/rules/exercises.md`) más una pantalla
  CRUD simple. Cierra otro ítem ya anotado en "Out of scope for now".
- **v2.0 — Roles de docente.** Un admin de instituto que vea los alumnos de todos los profesores,
  no solo los propios. El cambio estructural más grande de todo el roadmap — postergarlo hasta
  que haya presión real de uso multi-docente por instituto. Explícitamente separado de "crecer a
  más escuelas", que queda fuera de este roadmap.
- **v2.3 — Resumen semanal por email al docente.** Con la actividad de sus alumnos, usando Resend
  (ya integrado para las notificaciones de alta de cuenta, ver `.claude/rules/teacher-auth.md`).

## Solidez técnica

- **v1.4 — CI básica.** GitHub Actions corriendo `format:check` + `tsc --noEmit` + `lint` + `test`
  en cada push/PR (los cuatro ya existen como comandos, ver `/verify`). Hoy no existe
  `.github/workflows/` — la única red de seguridad es correr `/verify` a mano antes de cada
  `/ship`.
- **v1.5 — Cerrar el riesgo de seguridad aceptado.** Agregar `requireStudent` a
  `POST /api/attempts` y `GET /api/progress` (ver "Security" en `CLAUDE.md`) — ahora que las
  cuentas de alumno están difundidas, el último tramo sin autenticar que sigue confiando en un
  `studentId` provisto por el cliente.
- **v1.12 — E2E smoke tests con Playwright.** Formalizar en un `e2e/` real lo que hoy son scripts
  sueltos de debug (se escriben y se borran sesión a sesión): alta de alumno → onboarding → un
  ejercicio → resumen; login de docente → dashboard → crear ejercicio.
- **v1.13 — Activar instancias de Production reales en Clerk.** La separación de entornos en
  Neon ya está hecha (branch `development` propio para Development/Preview, `main` intacto para
  Production — ver "Stack" en `CLAUDE.md`), pero **ambas** apps de Clerk (docente y alumno) siguen
  corriendo en su instancia de Development incluso en el sitio ya desplegado
  (`*.clerk.accounts.dev`, banner "Development mode" visible a docentes reales hoy). Activar
  Production en el dashboard de Clerk para las dos apps, recrear el claim de sesión custom en
  cada una (`email`/`username` respectivamente — no se copia solo), reregistrar el webhook
  `user.created` con el nuevo secret, y recablear las env vars de **Production únicamente** en
  Vercel. Requiere que las cuentas reales existentes (ej. Miss Nati) se registren de nuevo, ya
  que no hay migración de usuarios entre instancias de Clerk.
- **v2.4 — Monitoreo de errores** (ej. Sentry) en `/api` y frontend. Hoy un error de
  configuración externo (como el claim de Clerk que faltaba, resuelto en una sesión reciente)
  solo se nota cuando un usuario real lo pisa.
- **v2.5 — Migrar `ensureSchema()` a una herramienta de migraciones formal** (ej. Drizzle). Hoy
  el esquema de Neon se gestiona con `CREATE TABLE IF NOT EXISTS`/`ALTER TABLE ADD COLUMN IF NOT
EXISTS` corridos en cada request (`api/_db.ts`) — funciona bien a esta escala, revisar solo si
  el ritmo de cambios de esquema aumenta.
