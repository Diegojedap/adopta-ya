# ¡ADOPTA YA! — Sistema integral web de gestión de adopciones y seguimiento post-adopción

Prototipo académico (CUN — Ingeniería de Sistemas, Proyecto de Ingeniería I) que busca
centralizar el proceso de adopción de mascotas en fundaciones y refugios independientes:
catálogo → solicitud → evaluación → formalización → seguimiento post-adopción.

> **Estado actual (12/10/2026):** prototipo verificable de **interfaz web responsive + empaquetado Android**.
> La capa de datos (API, base de datos, autenticación, contratos y seguimiento) está **diseñada** y
> **parcialmente implementada** (api en memoria, auth JWT, contrato PDF y seguimiento con evidencias/alertas).
> Pruebas automatizadas: **17/17 PASS** (`npm test`). Kit de UAT con línea base de tiempos listo (`docs/04_UAT.md`).

---

## 1. Contenido de este repositorio

```
ADOPTA-YA 1.0/                     ← raíz del repositorio
├── README.md                      ← este documento
├── .gitignore
├── package.json                   ← sólo dependencias directas (@capacitor/*) + jsdom (dev)
├── capacitor.config.json          ← appId com.adoptaya.app · webDir www
├── adopta-ya.code-workspace       ← espacio de trabajo de VS Code (conexión MySQL local)
├── test_estatico_adopta_ya.js     ← script de pruebas P-01…P-17 (usa npm test)
├── resultados_pruebas.json        ← resultados de la última ejecución de npm test
├── uat/
│   └── medir_linea_base.js        ← calcula la línea base de tiempos de la UAT (npm run uat:medir)
├── docs/
│   ├── 01_INFORME_DE_AUDITORIA.md ← auditoría técnica: hallazgos, severidad y estado
│   ├── 02_ARQUITECTURA.md         ← arquitectura actual vs. objetivo, herramientas, cliente, alojamiento
│   ├── 03_MODULOS.md              ← módulos implementados/pendientes y trazabilidad de requisitos
│   ├── 04_UAT.md                  ← plan de pruebas de aceptación (UAT) con línea base de tiempos
│   ├── uat/                       ← guion de escenarios, plantilla de registro y resultados
│   └── entregas/                  ← evidencias documentales
│       ├── ACA 1 ¡ADOPTA YA!.pdf  ← Entrega 1 (idea de proyecto)
│       └── ENTREGA_2_AJUSTE_AVANZADO_ADOPTA_YA.pdf  ← Entrega 2 (ajuste avanzado y sustentación)
├── sql/
│   ├── schema.sql                 ← esquema MySQL (usuarios, mascotas, solicitudes, evidencias)
│   ├── seed.sql                   ← datos de ejemplo (Max, Luna, Rocky)
│   └── adopta_ya.session.sql      ← evidencia de la intención de uso de MySQL
├── server/
│   ├── index.js                   ← API REST local sin dependencias (mascotas y solicitudes)
│   └── .env.example               ← configuración de la API (copiar a .env en local)
├── www/                           ← código fuente web (index.html, css/, js/, img/)
├── android/                       ← proyecto Android/Capacitor (incluye APK debug)
└── node_modules/                  ← dependencias instaladas (no versionadas)
```

## 2. Cómo ejecutar la aplicación

### 2.1 Navegador (recomendado para revisión)

No hay paso de compilación: `www/` es una web estática.

```powershell
# desde la raíz del repositorio
npx serve www          # o cualquier servidor estático; también abre www/index.html directamente
```

Funcionalidades visibles: catálogo que se carga desde la API (`GET /mascotas`) y recurre a
las 3 tarjetas estáticas de ejemplo (Max, Luna, Rocky) si el servidor no responde; botón
«Ver mascotas» (desplazamiento suave), botones «Quiero adoptar…» (crean una solicitud
«en revisión» vía `POST /solicitudes`); acceso con registro/login; formulario de postulación
del adoptante (datos + consentimiento Ley 1581), panel de evaluación del refugio para
aprobar o rechazar solicitudes y descarga del contrato de adopción en PDF para las aprobadas;
seguimiento post-adopción con registro de evidencias (notas y fotos) y alertas del refugio a
los 30/60/90 días. Responsivo a 700 px.

### 2.2 API local (opcional)

Servidor con el módulo `http` de Node (sin framework) y auth con `bcryptjs` + `jsonwebtoken`.
Levanta en `http://localhost:3000`:

```powershell
npm start   # GET /health · GET /mascotas[:id] · POST /solicitudes
            # GET /solicitudes · POST /solicitudes/:id/estado  (solo administrador, JWT)
            # GET /solicitudes/:id/contrato (PDF; aprobada y admin o adoptante dueño, JWT)
            # POST/GET /solicitudes/:id/evidencias (aprobada; admin o adoptante dueño, JWT)
            # GET /seguimiento/alertas (solo administrador, JWT)
            # POST /auth/registro · POST /auth/login · GET /auth/perfil (JWT Bearer)
```

Por defecto usa un store **en memoria** (mascotas y usuarios) con el admin de demo
`admin@adoptaya.local` / `admin123`. Si hay MySQL (puerto 3307) y `mysql2` instalado, conecta
y persiste mascotas/solicitudes (`sql/schema.sql` + `sql/seed.sql`); las credenciales se
definen en `server/.env` (no versionado).

### 2.3 Android

```powershell
npm install            # dependencias (@capacitor/cli, core, android; jsdom como dev)
npm run sync           # cap sync android: copia www/ → android/app/src/main/assets/public
npm run open:android   # abre el proyecto en Android Studio para build/run
```

Requisitos de build (NO incluidos en esta máquina): Android SDK (compileSdk 36, minSdk 24),
JDK 17+ (la máquina actual sólo tiene JDK 11) y red para descargar Gradle 8.14.3.

Un APK debug prerrobotado se conserva como evidencia en
`android/app/build/outputs/apk/debug/app-debug.apk` (~3,9 MB).
**Atención:** ese APK fue compilado antes de la corrección de rutas (ver §4);
debe regenerarse con `npm run sync` + build antes de instalarlo de nuevo.

### 2.4 Pruebas automatizadas

```powershell
npm test               # ejecuta test_estatico_adopta_ya.js (P-01…P-17) y genera resultados_pruebas.json
```

Resultado vigente: **PASA 17 / FALLA 0**. Todas las comprobaciones P-01…P-17 pasan,
incluidas P-05 (catálogo desde API), P-07 (solicitud persistida), P-09 (hashing/autenticación),
P-15 (evidencias post-adopción), P-16 (alertas 30/60/90) y P-17 (kit de UAT).

### 2.5 UAT con el refugio y línea base de tiempos

El kit de pruebas de aceptación está en `docs/04_UAT.md` y `docs/uat/` (guion con 12
escenarios UAT-01…UAT-12 y plantilla de registro). Tras llenar el CSV de resultados, la
línea base de tiempos se calcula y queda como evidencia:

```powershell
npm run uat:medir      # lee docs/uat/resultados_simulacion_2026-10-12.csv
                       # y genera docs/uat/linea_base_tiempos.json
```

La sesión con el refugio es un paso humano pendiente; ya existe una **simulación** de opencode
(`docs/uat/resultados_simulacion_2026-10-12.csv`) que valida el flujo y la medición, sin
sustituir la prueba con usuarios reales.

## 3. Herramientas y versiones

| Capa | Herramienta | Versión |
|---|---|---|
| Frontend | HTML5 / CSS3 / JavaScript (ES6) | vanilla, sin framework |
| Empaquetado móvil | Capacitor (core/cli/android) | 8.5.2 |
| Android | Gradle wrapper / compileSdk / minSdk | 8.14.3 / 36 / 24 |
| Pruebas | Node.js + jsdom | 24.16 / 23.0.1 |
| Base de datos (prevista) | MySQL local (SQLTools en VS Code) | puerto 3307 |
| IDE | Visual Studio Code | — |

## 4. Correcciones aplicadas en esta revisión (08/10/2026)

1. **Rutas case-sensitive (crítico):** `www/index.html` enlazaba `CSS/style.css` y `JS/script.js`
   mientras las carpetas reales eran `css/` y `js/`. En Android/Linux eso deja la app **sin estilos ni JS**.
   Unificado a minúsculas en `www/` y en la copia empaquetada (`android/.../assets/public/`), validado con `npm run sync`.
2. **Credenciales en texto plano:** se vació la contraseña de MySQL que estaba en claro en
   `.vscode/settings.json` y se movió el archivo `*.code-workspace` fuera de `www/`
   (estaba dentro del `webDir`, por lo que podía empaquetarse en el APK). Configurar la
   contraseña localmente sin versionarla.
3. **Higiene de `package.json`:** de ~80 dependencias declaradas se pasó a 3 directas
   (`@capacitor/core|cli|android`) + `jsdom` como devDependency, con `scripts` reales
   (`test`, `sync`, `open:android`).
4. **Pruebas ejecutables:** `jsdom` instalada desde la caché local de npm (el registro
   npmjs.org no es accesible desde esta máquina); por eso `package.json` fija
   `psl@1.9.0`, `ws@8.20.1` y `tough-cookie@4.1.3` vía `overrides` (versiones disponibles
   en caché y compatibles con el rango de jsdom 23). Con conexión a internet se puede
   eliminar ese bloque y actualizar jsdom.
5. **Script de pruebas único:** `test_estatico_adopta_ya.js` vive en la raíz del
   repositorio y se ejecuta con `npm test`; se eliminó la copia duplicada.
6. **Reorganización de carpetas (08/10/2026):** el proyecto se aplanó a un solo nivel
   (fin de la carpeta anidada `ADOPTA-YA 1.0/ADOPTA-YA 1.0/`); los PDFs de las entregas
   pasaron a `docs/entregas/`, el script SQL a `sql/` y el espacio de trabajo se renombró
   a `adopta-ya.code-workspace`. Los movimientos se hicieron con `git mv` (historial preservado).

Detalle completo (severidad, evidencias y pendientes): `docs/01_INFORME_DE_AUDITORIA.md`.

## 5. Advertencias

- **No desplegar el paquete actual en hosting público sin antes** eliminar `local.properties`
  (apunta al SDK de otra máquina) y revisar que no haya secretos.
- La app es **prototipo sin producción**: la API funciona en memoria (sin persistencia real
  salvo MySQL local si está configurado), el seguimiento calcula alertas por fecha pero **no
  hay notificación real (correo/push)** ni generación de fichas clínicas (ver `docs/03_MODULOS.md`).
- Tratamiento de datos personales: prever consentimiento expreso y minimización conforme a la
  **Ley 1581 de 2012** antes de capturar datos reales de adoptantes.
