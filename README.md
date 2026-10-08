# ¡ADOPTA YA! — Sistema integral web de gestión de adopciones y seguimiento post-adopción

Prototipo académico (CUN — Ingeniería de Sistemas, Proyecto de Ingeniería I) que busca
centralizar el proceso de adopción de mascotas en fundaciones y refugios independientes:
catálogo → solicitud → evaluación → formalización → seguimiento post-adopción.

> **Estado actual (08/10/2026):** prototipo verificable de **interfaz web responsive + empaquetado Android**.
> La capa de datos (API, base de datos, autenticación, contratos y seguimiento) está **diseñada pero no implementada**.
> Pruebas automatizadas: **11/14 PASS** (`npm test`).

---

## 1. Contenido de este repositorio

```
ADOPTA-YA 1.0/                     ← raíz del repositorio
├── README.md                      ← este documento
├── .gitignore
├── package.json                   ← sólo dependencias directas (@capacitor/*) + jsdom (dev)
├── capacitor.config.json          ← appId com.adoptaya.app · webDir www
├── adopta-ya.code-workspace       ← espacio de trabajo de VS Code (conexión MySQL local)
├── test_estatico_adopta_ya.js     ← script de pruebas P-01…P-14 (usa npm test)
├── resultados_pruebas.json        ← resultados de la última ejecución de npm test
├── docs/
│   ├── 01_INFORME_DE_AUDITORIA.md ← auditoría técnica: hallazgos, severidad y estado
│   ├── 02_ARQUITECTURA.md         ← arquitectura actual vs. objetivo, herramientas, cliente, alojamiento
│   ├── 03_MODULOS.md              ← módulos implementados/pendientes y trazabilidad de requisitos
│   └── entregas/                  ← evidencias documentales
│       ├── ACA 1 ¡ADOPTA YA!.pdf  ← Entrega 1 (idea de proyecto)
│       └── ENTREGA_2_AJUSTE_AVANZADO_ADOPTA_YA.pdf  ← Entrega 2 (ajuste avanzado y sustentación)
├── sql/
│   └── adopta_ya.session.sql      ← evidencia de la intención de uso de MySQL
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

Funcionalidades visibles: catálogo con 3 mascotas de ejemplo (Max, Luna, Rocky),
botón «Ver mascotas» (desplazamiento suave), botones «Quiero adoptar…» (mensaje informativo)
y sección de responsabilidad en la adopción. Diseño responsivo (media query a 700 px).

### 2.2 Android

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

### 2.3 Pruebas automatizadas

```powershell
npm test               # ejecuta test_estatico_adopta_ya.js (P-01…P-14) y genera resultados_pruebas.json
```

Resultado vigente: **PASA 11 / FALLA 3**. Las fallas son P-05 (catálogo desde API),
P-07 (persistencia de la solicitud) y P-09 (hashing/autenticación): corresponden a
módulos pendientes, no a defectos de la interfaz.

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
- La app **no tiene backend**: las «adopciones» sólo muestran un `alert`. No hay cuentas,
  ni solicitudes persistidas, ni contratos PDF, ni alertas de seguimiento (ver `docs/03_MODULOS.md`).
- Tratamiento de datos personales: prever consentimiento expreso y minimización conforme a la
  **Ley 1581 de 2012** antes de capturar datos reales de adoptantes.
