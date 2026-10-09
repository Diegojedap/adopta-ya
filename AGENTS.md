# ADOPTA YA 1.0 — Memoria del proyecto

> Esta es la memoria de contexto de opencode. Se carga automáticamente en cada sesión
> desde la raíz del repositorio (`instructions: ["AGENTS.md"]` en `opencode.json`).
> Si algo de este documento difiere de la realidad del repositorio, manda la realidad
> y corrige este archivo (ver «Regla 1»).

---

## 1. ¿Qué es el proyecto? (resumen general)

**¡ADOPTA YA!** es una plataforma web + app Android para **conectar refugios y fundaciones
independientes de animales con adoptantes responsables**, enfocada en el seguimiento
post-adopción y la reducción de abandonos.

- **Contexto académico:** proyecto de la **CUN (Corporación Unificada Nacional)** —
  cliente objetivo: fundaciones/refugios independientes de mascotas.
- **Actores:** Administrador (refugio), Adoptante, Veterinario (diseño previsto).
- **Repositorio en la nube:** https://github.com/Diegojedap/adopta-ya (público, rama `master`).
- **Máquina actual:** Windows, carpeta de trabajo `C:\Users\diego_ojeda\Downloads\ADOPTA-YA 1.0`.
- **Idioma de trabajo:** español (documentación, commits y respuestas).

**Alcance REAL hoy:** es la **capa de presentación** (prototipo de interfaz) con
arquitectura y backlog definidos para completarlo. **NO hay backend**: no existen cuentas,
API, base de datos activa, solicitudes persistidas ni contratos PDF. Cualquier afirmación
de "sistema integral de adopciones" sería falsa.

## 2. Estructura del repositorio

```
ADOPTA-YA 1.0/                     ← raíz (proyecto aplanado, sin carpetas anidadas)
├── AGENTS.md                      ← este archivo (memoria automática de opencode)
├── PROGRESO.md                    ← bitácora viva de avance (se actualiza en cada paso)
├── opencode.json                  ← config de opencode (autoupdate, instructions, share off)
├── README.md                      ← documento principal del entregable
├── package.json                   ← deps: @capacitor/*; dev: jsdom@23.0.1
├── capacitor.config.json          ← appId com.adoptaya.app · webDir www
├── test_estatico_adopta_ya.js     ← suite de pruebas P-01…P-14 (única copia)
├── resultados_pruebas.json        ← resultados de la última ejecución de npm test
├── adopta-ya.code-workspace       ← espacio VS Code (conexión SQLTools MySQL local)
├── docs/
│   ├── 01_INFORME_DE_AUDITORIA.md ← hallazgos F-01…F-08, severidad y estado
│   ├── 02_ARQUITECTURA.md         ← arquitectura actual vs. objetivo
│   ├── 03_MODULOS.md              ← módulos M-01…M-18, trazabilidad REQ, backlog
│   └── entregas/                  ← PDFs de Entrega 1 y Entrega 2
├── sql/
│   ├── schema.sql                 ← esquema MySQL (usuarios, mascotas, solicitudes, evidencias)
│   ├── seed.sql                   ← datos de ejemplo (Max, Luna, Rocky)
│   └── adopta_ya.session.sql      ← evidencia de intención MySQL (SELECT de prueba)
├── server/
│   ├── index.js                   ← API REST sin dependencias (GET /mascotas, POST /solicitudes)
│   └── .env.example               ← config de la API (copiar a .env y completar en local)
├── www/                           ← fuente web: index.html, css/, js/, img/
├── android/                       ← proyecto Capacitor/Android (incluye APK debug)
└── node_modules/                  ← no versionada
```

## 3. Estado verificado (08/10/2026)

- **Pruebas:** `npm test` → **PASA 13 / FALLA 1** de 14.
  - **P-09** sigue fallando: sin hashing/autenticación (M-09, Fase 1).
  - P-05 (catálogo vía API) y P-07 (solicitud persistida vía API) **ya pasan**.
  - **Nota:** el check P-11 del test fue corregido (allowlist de dependencias directas) para
    no contradecir a P-09, que exige una librería de auth en `dependencies`.
- **Módulos implementados:** M-01 portada · M-02 navegación · M-03 catálogo (◐ con API) ·
  M-04 adopción (◐ crea solicitud «en_revision») · M-05 responsabilidad · M-06 responsivo ·
  M-07 empaquetado Android (◐ APK viejo) · M-08 suite de pruebas ·
  M-16 API REST (◐ prototipo) · M-17 persistencia MySQL (◐ esquema versionado).
- **Módulos NO implementados (diseñados):** M-09 auth/roles · M-10 CRUD mascotas ·
  M-11 formulario postulación · M-12 motor de evaluación · M-13 contrato PDF ·
  M-14 seguimiento · M-15 alertas · M-18 cloud.
- **Requisitos:** REQ-04 ✅ (APK pendiente de regenerar) · REQ-01/REQ-02 ◐ (con API) ·
  REQ-03/REQ-05 ✗ · RNF-01 ◐ (prototipo) · RNF-02/RNF-03 ✅.
- **API local:** `npm start` levanta `server/index.js` en `http://localhost:3000` con store
  en memoria (se reserva estático si no responde); hook opcional a `mysql2` si hay MySQL.
- **Hallazgos corregidos en la auditoría:** F-01 rutas case-sensitive unificadas a
  minúsculas (`css/`, `js/`) · F-02 credenciales MySQL vaciadas · F-03 `package.json`
  higienizado · F-04 pruebas ejecutables · F-05 workspace fuera de `www/`.
  Pendiente: **F-08** — el APK debug es anterior a las correcciones y **esta máquina no
  puede regenerarlo** (sin Android SDK ni JDK 17; solo hay JDK 11).
- **Backlog (Entrega 3):** ver `docs/03_MODULOS.md` §4. Hechos #1-3 (esquema, API, consumir
  API). Siguiente: auth (M-09) → formularios (M-11/M-12) → APK → PDF → seguimiento → UAT.

## 4. Comandos clave

```powershell
npm test           # suite P-01…P-14; actualiza resultados_pruebas.json (esperado 13/14)
npm start          # API local en http://localhost:3000 (mascotas + solicitudes)
npm run sync       # cap sync android (coopia www/ → android/.../assets/public/)
npm run open:android  # abrir proyecto en Android Studio (no disponible en esta máquina)
npx serve www      # servir el front-end localmente
```

Verificación rápida de integridad: comparar hashes de `www/index.html`,
`www/css/style.css`, `www/js/script.js` con su par en
`android/app/src/main/assets/public/` (deben coincidir).

## 5. Convenciones y advertencias (no romper)

1. **Rutas siempre en minúsculas** (`css/`, `js/`): Android y Linux son sensibles a
   mayúsculas; `CSS/` o `JS/` dejan la app sin estilos ni JS.
2. **Nunca versionar credenciales**: ni en `.vscode/settings.json`, ni workspace, ni
   `.env`. La contraseña de MySQL (puerto 3307, usuario root) se configura localmente.
3. **npm offline**: registry.npmjs.org no es accesible desde esta máquina; `package.json`
   fija `psl@1.9.0`, `ws@8.201` (verificar: 8.20.1) y `tough-cookie@4.1.3` vía `overrides`
   porque son las versiones en caché local. No quitar esos overrides sin conexión.
4. **APK**: el único binario versionado es `android/app/build/outputs/apk/debug/app-debug.apk`
   (excepción deliberada en `.gitignore`, como evidencia). No borrar.
5. **Datos legales**: al capturar datos reales de adoptantes aplica la **Ley 1581 de 2012**
   (consentimiento expreso y minimización).
6. **Commits**: mensajes en español, descriptivos; nunca `git push --force`.

## 6. Documentación detallada (profundizar cuando haga falta)

| Tema | Archivo |
|---|---|
| Hallazgos de auditoría, severidad, evidencias | `docs/01_INFORME_DE_AUDITORIA.md` |
| Arquitectura actual vs. objetivo, cliente, alojamiento | `docs/02_ARQUITECTURA.md` |
| Módulos, trazabilidad de requisitos, backlog | `docs/03_MODULOS.md` |
| Entregas 1 y 2 (PDF oficiales) | `docs/entregas/` |
| Instrucciones de uso y estructura | `README.md` |

---

## Regla 1 — Verificación de memoria al iniciar sesión

Al **iniciar una sesión** en este proyecto, hacer antes de responder sobre el estado del proyecto:

1. `git fetch origin` → comparar `git status -sb` (local vs `origin/master`; si están
   desfasados, avisar y hacer pull/push según convenga).
2. `git log --oneline -5` y `git status` → confirmar si hay cambios sin commit.
3. Contrastar este AGENTS.md con la realidad: estructura de carpetas, contenido de
   `PROGRESO.md`, resultados en `resultados_pruebas.json`, `package.json`.
4. Si hay deriva (la memoria dice algo que ya no es cierto), **corregir AGENTS.md y/o
   PROGRESO.md en ese momento** y reflejarlo en el commit. Nunca dar por bueno un dato
   desactualizado sin avisar.
5. Si el usuario lo pide o hay duda de integridad, ejecutar `npm test` (11/14 esperado).

## Regla 2 — Actualización automática de progreso (anti-apagón)

El PC del usuario puede apagarse en cualquier momento. Por eso, **al terminar cada paso
o tarea significativa**:

1. Actualizar `PROGRESO.md`: fecha/hora, qué se terminó, qué quedó pendiente, resultados
   relevantes (p. ej. conteo de pruebas). Formato: entradas nuevas arriba, breves.
2. Hacer **commit inmediato** (`git add -A` + mensaje en español que resuma el paso) y
   **push a origin/master**. No dejar progreso solo en memoria de la sesión.
3. Si una tarea queda a medias por interrupción, dejarlo escrito en `PROGRESO.md`
   como «EN CURSO» con el detalle necesario para retomarla en una sesión nueva.
4. Opcional pero recomendado: mencionar al usuario que el avance ya quedó en GitHub.

La continuidad entre sesiones se garantiza con: **AGENTS.md** (contexto) +
**PROGRESO.md** (avance) + **`opencode --continue`** (historial local de la sesión).
