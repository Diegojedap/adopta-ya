# Informe de auditoría técnica — ¡ADOPTA YA! 1.0

**Fecha:** 08 de octubre de 2026
**Alcance:** código fuente del paquete ADOPTA-YA 1.0 (web + proyecto Android + documentación de Entregas 1 y 2)
**Método:** revisión estática de archivos, ejecución del script de pruebas `test_estatico_adopta_ya.js`
(con jsdom) y verificación de artefactos empaquetados (assets, APK).

---

## 1. Resumen ejecutivo

El proyecto es un **prototipo de interfaz** de una plataforma de adopción de mascotas.
Lo que existe y funciona hoy es la capa de presentación: una página estática responsive
con catálogo de ejemplo, más un proyecto Android/Capacitor con un APK debug compilado.

La auditoría encontró **2 defectos críticos/alto ya corregidos** (rutas sensibles a
mayúsculas y credenciales de MySQL en texto plano) y **3 defectos de higiene ya
corregidos** (dependencias transitivas declaradas como directas, ausencia de script de
pruebas, pruebas no ejecutables). Permanecen **3 brechas funcionales estructurales**
(API/base de datos, autenticación, APK desactualizado) que son el trabajo pendiente de
la Entrega 3, no defectos ocultos del prototipo actual.

**Resultado de pruebas tras las correcciones: 11/14 PASS** (antes: no ejecutable).

| Severidad | Total | Resueltos | Pendientes |
|---|---|---|---|
| Crítico | 1 | 1 | 0 |
| Alto | 3 | 1 | 2 |
| Medio | 5 | 3 | 2 |
| Bajo | 3 | 0 | 3 |

---

## 2. Qué funciona hoy (verificado)

| # | Funcionalidad | Evidencia |
|---|---|---|
| 1 | Página de inicio con encabezado, propuesta y CTA | `ADOPTA-YA 1.0/www/index.html:13-31` |
| 2 | Catálogo de 3 mascotas (Max, Luna, Rocky) con nombre, edad, descripción y botón | `www/index.html:33-71` (P-04) |
| 3 | Navegación con desplazamiento suave al catálogo | `www/js/script.js:1-7` (P-08) |
| 4 | Interacción de adopción: mensaje de agradecimiento con el nombre de la mascota | `www/js/script.js:9-14` (P-06) |
| 5 | Sección informativa de responsabilidad (hogar / salud / amor) | `www/index.html:73-104` |
| 6 | Diseño responsive (media query ≤700 px, viewport, `lang="es"`) | `www/css/style.css:175-193` (P-02, P-03) |
| 7 | Empaquetado Android con Capacitor 8 y proyecto Gradle | `android/`, `capacitor.config.json` (P-13) |
| 8 | APK debug compilado (~3,9 MB) | `android/app/build/outputs/apk/debug/app-debug.apk` (P-14) |
| 9 | Suite de pruebas automatizadas P-01…P-14 ejecutable con `npm test` | `test_estatico_adopta_ya.js`, `resultados_pruebas.json` |

## 3. Qué NO funciona / no existe

| # | Falta | Impacto | Requisito |
|---|---|---|---|
| 1 | No hay API ni base de datos: el catálogo está embebido en el HTML | Ninguna mascota se gestiona desde un panel; los cambios no persisten | REQ-01 |
| 2 | `adoptar()` no crea solicitud: sólo muestra un `alert` | El flujo de adopción termina en un mensaje | REQ-02 |
| 3 | No hay autenticación, usuarios ni roles | Nadie administra el catálogo; sin panel de evaluación | REQ-05 |
| 4 | No hay generación de contrato PDF | Formalización del proceso inexistente | Alcance Entrega 1 |
| 5 | No hay seguimiento post-adopción ni alertas | Indicador ≥85% de seguimiento no medible | REQ-03 |
| 6 | No hay formulario de postulación ni evaluación | El administrador no puede filtrar candidatos | REQ-02 |
| 7 | Carpeta `www/img/` vacía; imágenes sustituidas por emojis | Catálogo sin fotografías reales | Calidad/UX |
| 8 | No hay despliegue web (Vercel/Render u otro) | La app sólo existe como APK local y archivos | Viabilidad |

## 4. Hallazgos (hallazgo · severidad · estado)

### F-01 · Rutas sensibles a mayúsculas (CRÍTICO — CORREGIDO)
`www/index.html:8` enlazaba `CSS/style.css` y `www/index.html:112` `JS/script.js`, pero
las carpetas reales eran `css/` y `js/` (minúsculas). Windows no lo detecta, pero
**Android y Linux sí: la app quedaba sin estilos ni JavaScript** en cualquier sistema
de archivos sensible a mayúsculas (incluido el WebView empaquetado al re-sincronizar).
La app «funcionaba» sólo porque la copia empaquetada tenía las carpetas en mayúsculas.
**Acción:** referencias y carpetas unificadas a minúsculas en `www/` y en
`android/app/src/main/assets/public/`; verificado con `npm run sync` y con P-01/P-13.

### F-02 · Credenciales de MySQL en texto plano (ALTO — CORREGIDO)
La contraseña del usuario `root` de MySQL (valor retirado) estaba en claro en dos archivos versionables:
`.vscode/settings.json` y `www/ADOPTA-YA 1.0.code-workspace`. El segundo además vivía
**dentro de `www/` (el `webDir`)**, por lo que `cap sync` puede empaquetarlo dentro del APK.
Incumple el propio RNF-02 y la línea de Ley 1581 declarada en la Entrega 1.
**Acción:** contraseña vaciada en ambos archivos y el `.code-workspace` movido a la raíz
del entregable (fuera del `webDir`). La contraseña debe configurarse localmente.

### F-03 · `package.json` con dependencias transitivas como directas (MEDIO — CORREGIDO)
Declaraba 80 dependencias, la mayoría propias de `@capacitor/cli` (transitivas). Dificulta
auditoría y reproduce installs frágiles.
**Acción:** sólo `@capacitor/core|cli|android` como dependencias + `jsdom` (devDependency).

### F-04 · Sin script de pruebas real (MEDIO — CORREGIDO)
`scripts.test` decía `echo "Error: no test specified" && exit 1` (P-12 fallaba).
**Acción:** `"test": "node test_estatico_adopta_ya.js"`.

### F-05 · Suite de pruebas no ejecutable (MEDIO — CORREGIDO)
El script exige `jsdom`, que no estaba entre las dependencias; además el registro
npmjs.org no es accesible desde esta máquina (peticiones colgadas).
**Acción:** `jsdom@23.0.1` instalada desde la caché local de npm. Para cerrar la
resolución offline se fijaron por `overrides` `psl@1.9.0`, `ws@8.20.1` y
`tough-cookie@4.1.3` (versiones presentes en caché, compatibles con el rango de jsdom 23).
Con internet: `npm install` normal y eliminación del bloque `overrides`.

### F-06 · Sin capa de API/persistencia (ALTO — PENDIENTE, CONOCIDO)
`www/js/script.js` (14 líneas) no contiene `fetch`/XHR (P-05 falla) y `adoptar()` no
persiste nada (P-07 falla). Existe sólo un indicio de intención MySQL:
`adopta_ya.session.sql` con `SELECT * FROM mascotas;`.
**Acción recomendada:** implementar API (Node/Express o Python/Flask) + MySQL siguiendo
la arquitectura objetivo (ver `docs/02_ARQUITECTURA.md`), priorizando el flujo
mínimo: mascotas → solicitudes → estados.

### F-07 · Sin autenticación ni hashing (ALTO — PENDIENTE, CONOCIDO)
No hay librería de hashing/JWT (P-09 falla) ni pantalla de login. REQ-05 sin cumplir.
**Acción recomendada:** bcrypt + JWT/roles (admin, adoptante, veterinario) antes de
capturar datos personales reales.

### F-08 · APK desactualizado respecto de la fuente (MEDIO — PENDIENTE)
El APK vigente se compiló con la versión anterior de `www/` (referencias `CSS/`/`JS/`).
Sigue siendo instalable y funcional, pero ya no refleja la fuente corregida.
Regenerarlo requiere Android SDK (este `local.properties` apunta al SDK de otra
máquina: `C:\Users\troun\...`), JDK 17+ (aquí sólo hay JDK 11) y red para Gradle 8.14.3.
**Acción:** `npm run sync` + build en Android Studio / `gradlew assembleDebug` en una
máquina con el SDK.

### F-09 · Artefactos de build dentro del paquete (BAJO — PARCIAL)
El paquete incluye `android/app/build/` e intermediarios de Gradle (~cientos de archivos).
**Acción:** `.gitignore` creado (ver raíz); los artefactos no se versionan, salvo el APK
conservado como evidencia (Anexo C de la Entrega 2).

### F-10 · Restos de Cordova sin plugins (BAJO — DOCUMENTADO)
`android/.../assets/public/cordova.js` y `cordova_plugins.js` son generados por Capacitor
y están vacíos; `capacitor.plugins.json` es `[]`. No afecta, pero conviene no confundirlo
con un uso real de Cordova.

### F-11 · `local.properties` con ruta de otra máquina (BAJO — DOCUMENTADO)
`android/local.properties` apunta al SDK de otro usuario. Gradle lo usa sólo en local;
no debe versionarse (ya está en `.gitignore`), pero conviene regenerarlo con Android Studio.

### F-12 · Metadatos incompletos (BAJO — PARCIAL)
Faltaban descripción, autor, licencia y keywords en `package.json`; corregido.
Siguen faltando LICENSE y CONTRIBUTING en la raíz del repositorio.

## 5. Resultado de pruebas (`npm test`, 08/10/2026)

| Prueba | Requisito | Resultado | Nota |
|---|---|---|---|
| P-01 Recursos con case exacto | REQ-04 | **PASA** | Corregido (F-01) |
| P-02 Viewport y `lang="es"` | REQ-04 | **PASA** | — |
| P-03 Media query móvil | REQ-04 | **PASA** | `@media (max-width: 700px)` |
| P-04 Catálogo con nombre/acción | REQ-01 | **PASA** | 3 tarjetas |
| P-05 Catálogo desde API | REQ-01 | **FALLA** | Sin fetch/XHR: catálogo hardcodeado (F-06) |
| P-06 `adoptar()` informa al usuario | REQ-02 | **PASA** | — |
| P-07 `adoptar()` persiste solicitud | REQ-02 | **FALLA** | Sin backend (F-06) |
| P-08 `mostrarMascotas()` desplaza | REQ-04 | **PASA** | — |
| P-09 Hashing/autenticación | REQ-05 | **FALLA** | Sin librerías de auth (F-07) |
| P-10 Sin secretos en claro | RNF-02 | **PASA** | Corregido (F-02) |
| P-11 Dependencias directas | RNF-03 | **PASA** | Corregido (F-03) |
| P-12 Script de pruebas real | RNF-03 | **PASA** | Corregido (F-04) |
| P-13 Copia Android == `www/` | REQ-04 | **PASA** | Verificado tras `npm run sync` |
| P-14 APK debug existe | REQ-04 | **PASA** | 3,93 MB (desactualizado, ver F-08) |

Evidencia: `ADOPTA-YA 1.0/resultados_pruebas.json`.

## 6. Recomendaciones priorizadas

| Prioridad | Acción | Esfuerzo |
|---|---|---|
| P0 | Definir modelo de datos (mascotas, usuarios, solicitudes, estados, evidencias) y crear el esquema MySQL | Bajo |
| P0 | API REST mínima: CRUD de mascotas + creación de solicitudes con estado «En revisión» | Medio |
| P0 | Consumir la API desde `script.js` (reemplazar el catálogo hardcodeado y el `alert`) | Medio |
| P1 | Autenticación con roles (admin/adoptante/veterinario) y hashing bcrypt (REQ-05) | Medio |
| P1 | Formulario de postulación + panel de evaluación del refugio | Medio |
| P1 | Regenerar APK tras cambios y publicar demo web (Vercel + Render free tier) | Bajo |
| P2 | Contrato PDF con plantilla y firma/aceptación | Medio |
| P2 | Seguimiento post-adopción: carga de evidencias y alertas a los 30 días (REQ-03) | Alto |
| P2 | UAT con usuarios del contexto y medición de línea base (tiempo de respuesta) | Medio |

## 7. Conclusión

El prototipo cumple lo que puede demostrarse: una interfaz responsive y empaquetable con
evidencia de APK y pruebas automatizables. Tras esta auditoría, el paquete es **reproducible**
(las pruebas se ejecutan con `npm test`), **sin secretos versionados** y con la fuente
coherente entre `www/` y el proyecto Android. El salto de calidad siguiente no es cosmético:
es construir la capa de datos y seguridad que la Entrega 2 ya declara como pendiente.
