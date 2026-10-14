# Arquitectura y entorno — ¡ADOPTA YA! 1.0

**Fecha de la descripción:** 12 de octubre de 2026. Se describe primero la arquitectura
**actual** (la que se puede verificar en el código) y luego la **objetivo** (la diseñada
en las Entregas 1 y 2). No deben confundirse.

---

## 1. Cliente objetivo y actores

**Cliente objetivo:** fundaciones y refugios de mascotas **independientes** (sin ánimo de
lucro) y redes de rescatistas urbanas, que hoy gestionan adopciones con WhatsApp,
formularios, papel, Drive y hojas de cálculo, sin trazabilidad del proceso ni control
post-adopción.

**Actores del sistema:**

| Actor | Rol | Interacción principal |
|---|---|---|
| Administrador / Fundación | Opera la plataforma | Registra mascotas, publica fichas, evalúa y aprueba/rechaza solicitudes, audita reportes post-adopción |
| Adoptante / Usuario | Persona natural que quiere adoptar | Explora el catálogo, diligencia la postulación, adjunta requisitos, reporta el estado de la mascota los primeros 6 meses |
| Veterinario / Apoyo operativo | Soporte clínico | Actualiza vacunación, desparasitación y esterilización en la ficha de la mascota |

**Restricción legal de diseño:** tratamiento de datos personales conforme a la
**Ley Estatutaria 1581 de 2012** (consentimiento expreso, minimización, cifrado).
Deriva en los requisitos REQ-05 (hashing de credenciales) y RNF-02 (sin secretos en claro).

## 2. Arquitectura ACTUAL (verificable en el código)

Un **monolito estático de presentación** empaquetado como app híbrida. No hay proceso
servidor, ni estado, ni persistencia: todo el «dato» vive en el HTML.

```
┌──────────────────────────────────────────────────────────┐
│  Dispositivo del usuario (móvil / navegador)             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  WebView Android (app com.adoptaya.app)  —o—       │  │
│  │  Navegador                                         │  │
│  │                                                    │  │
│  │   index.html  ──► css/style.css   (presentación)   │  │
│  │        │                                           │  │
│  │        └──────► js/script.js      (2 funciones)    │  │
│  │                    ├─ mostrarMascotas()  scroll    │  │
│  │                    └─ adoptar(nombre)    alert     │  │
│  │                                                    │  │
│  │   Datos: 3 mascotas fijas escritas en el HTML      │  │
│  └────────────────────────────────────────────────────┘  │
│         ▲                                                │
│         │  Capacitor 8.5.2 (bridge nativo, sin plugins)  │
│         │  MainActivity extends BridgeActivity           │
│         │  Permiso: INTERNET                             │
└─────────┴────────────────────────────────────────────────┘
   Sin API · Sin base de datos · Sin autenticación · Sin servicios
```

**Componentes existentes:**

| Componente | Archivo | Rol |
|---|---|---|
| Página única | `www/index.html` | Barra de navegación, hero, catálogo y responsabilidad; los formularios (acceso, postulación, seguimiento, panel y gestión) viven en **modales** (`#modal-*`) |
| Estilos | `www/css/style.css` | Paleta teal + coral (primario `#0f766e`, acento `#f97316`) con variables CSS, **tema claro/oscuro** (`[data-theme="dark"]`), layout responsive (grid), media query 700 px |
| Lógica | `www/js/script.js` | Navegación, confirmación de adopción, apertura/cierre de modales (`abrirModal`/`cerrarModal`), tema (`alternarTema`) e idioma (`alternarIdioma`, ES/EN), sin persistencia salvo `localStorage` (tema/idioma) |
| Configuración Capacitor | `capacitor.config.json` | `appId com.adoptaya.app`, `webDir www` |
| Puente Android | `android/.../MainActivity.java` | `BridgeActivity` estándar |
| Empaquetado | `android/` (Gradle 8.14.3, compileSdk 36, minSdk 24) | APK debug |

## 3. Arquitectura OBJETIVO (Entregas 1 y 2)

Cuatro capas, con desarrollo propio (decisión formalizada frente a No-Code/CMS: control
del modelo de datos, reglas de negocio, seguridad y trazabilidad).

```
 ACTORES
 ┌────────────┐   ┌──────────────────┐   ┌─────────────────────┐
 │ Adoptante  │   │ Admin/Fundación  │   │ Veterinario/Apoyo   │
 └─────┬──────┘   └────────┬─────────┘   └──────────┬──────────┘
       │                   │                        │
 ──────┴───────────────────┴────────────────────────┴──────────
       ▼                   ▼                        ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ CAPA DE PRESENTACIÓN — Web responsive + app Android         │
 │ catálogo · ficha · formulario · panel admin · seguimiento   │
 └──────────────────────────┬──────────────────────────────────┘
                            ▼  HTTPS / JSON
 ┌─────────────────────────────────────────────────────────────┐
 │ CAPA DE APLICACIÓN / API                                    │
 │ mascotas · solicitudes · evaluación · seguimiento ·         │
 │ contratos (PDF) · alertas · autenticación y roles           │
 └──────────────────────────┬──────────────────────────────────┘
                            ▼
 ┌──────────────────────────┴──────────────────────────────────┐
 │ CAPA DE PERSISTENCIA — MySQL                                │
 │ mascotas · usuarios · solicitudes · estados · evidencias    │
 └─────────────────────────────────────────────────────────────┘
                            ▲
 ┌──────────────────────────┴──────────────────────────────────┐
 │ SERVICIOS DE APOYO                                          │
 │ generación PDF · almacenamiento multimedia · notificaciones │
 └─────────────────────────────────────────────────────────────┘
```

**Flujo de negocio objetivo:**
`Publicación de mascota → Solicitud digital → Evaluación → Formalización (contrato PDF) → Seguimiento post-adopción con alertas (30/60/90 días)`

**Stack decidido (Entrega 1, sección 9.2):** desarrollo web full-stack
(React + Node.js o Python + MySQL), editado en VS Code, desplegado en
**Vercel (frontend) + Render (API)** bajo free tier, con MySQL como SGBD.

## 4. Estado de cada capa hoy

| Capa | Estado | Evidencia |
|---|---|---|
| Presentación | **Implementada (parcial)** — catálogo dinámico vía API con reserva estática, navegación, acceso, postulación, panel de evaluación, seguimiento y CRUD de mascotas | `www/` (P-02, P-03, P-04, P-06, P-08, P-15, P-16, P-18) |
| Aplicación/API | **Implementada (prototipo)** — CRUD de mascotas, solicitudes, evaluación, evidencias y alertas; sirve también la web | `server/index.js`, `npm start` (P-05, P-07, P-18) |
| Persistencia | **Implementada (MySQL local en uso)** — usuarios, mascotas, solicitudes, historial, evidencias y alertas | `sql/schema.sql`, `sql/seed.sql`, `sql/preparar_bd.js`, `sql/servidor_mysql.js` |
| Seguridad | **Implementada (prototipo)** | auth con `bcryptjs` + JWT (P-09); sin secretos versionados (P-10) |
| Servicios (PDF/alertas) | **Implementados (prototipo)** — contrato PDF sin dependencias (M-13) y alertas de seguimiento 30/60/90 calculadas (M-15, sin scheduler ni correo) | `server/contrato.js`, rutas `/contrato` y `/seguimiento/alertas` |
| Empaquetado Android | **Implementado** — APK debug regenerado 13/10/2026 sobre la fuente corregida | `android/`, P-13, P-14 |

## 5. Herramientas y versiones (inventario verificado)

| Categoría | Herramienta | Versión / detalle | Dónde se verifica |
|---|---|---|---|
| Lenguaje frontend | HTML5 / CSS3 / JavaScript ES6 | vanilla, sin framework ni bundler | `www/` |
| Runtime móvil | Capacitor core / cli / android | 8.5.2 | `package.json` |
| Build Android | Gradle wrapper | 8.14.3 | `android/gradle/wrapper/gradle-wrapper.properties` |
| SDK Android | compileSdk / targetSdk / minSdk | 36 / 36 / 24 | `android/variables.gradle` |
| App ID | com.adoptaya.app · versionName 1.0 | versionCode 1 | `capacitor.config.json`, `android/app/build.gradle` |
| Java | JDK del sistema; se requirió JDK 21 para compilar | 17.0.20.1 en `C:\Java` (se usó un JDK 21 portátil: Capacitor 8 exige 21) | `java -version` |
| Pruebas | Node.js 24.16 + jsdom 23.0.1 | suite P-01…P-18 | `npm test` |
| Paquetes | npm 11.13 | resolución offline (registro npmjs.org inaccesible) | `package-lock.json` |
| Base de datos | MySQL 8.4.9 portátil en 127.0.0.1:3307 (SQLTools) | esquema en `sql/schema.sql` + `sql/seed.sql`; arranque con `npm run db:iniciar` | `adopta-ya.code-workspace`, `server/index.js` |
| API local | Node.js (módulo `http`) + `mysql2` | puerto 3000 · `npm start` (web + API) | `server/index.js` |
| IDE | Visual Studio Code | `launch.json` apunta a `http://localhost:8080` | `.vscode/` |

## 6. ¿Dónde está alojada la aplicación?

**Hoy: en ningún servidor.** No existe despliegue web (no hay configuración de Vercel,
Netlify, Render, Fly.io, IIS ni hosting alguno en el paquete). La única forma de usarla es:

1. **Local en navegador:** abriendo `www/index.html` o sirviendo la carpeta `www/`;
   con la API encendida (`npm start` en otra terminal) el catálogo se carga desde
   `http://localhost:3000/mascotas`; sin ella, la web usa las tarjetas estáticas de reserva.
2. **App Android:** instalando el APK debug generado
   (`android/app/build/outputs/apk/debug/app-debug.apk`, 3,93 MB), que embebe los
   archivos web dentro del paquete (`assets/public/`). El manifiesto sólo pone el
   permiso `INTERNET`, sin usarlo aún.

**Alojamiento objetivo (por construir):** Vercel (estáticos) + Render (API) + MySQL
free tier, según la viabilidad económica de la Entrega 1 (sección 12.3). El APK se
convierte en la capa de distribución móvil complementaria, no en el único canal.

## 7. Decisiones de diseño y riesgos abiertos

- **Desarrollo propio vs. No-Code:** decidido a favor del desarrollo propio por control
  del modelo de datos, reglas de estados, seguridad y trazabilidad (Entrega 2, §7).
- **Responsivo primero:** el media query a 700 px y el viewport son la base del REQ-04;
  la app Android reutiliza el mismo HTML (estrategia híbrida barata).
- **Riesgo abierto — free tier:** cuotas de almacenamiento para fotos/evidencias
  (mitigar con compresión en cliente, ya sugerido en la Entrega 1).
- **Riesgo mitigado — JDK/SDK:** el SDK local (`C:\Android`, platform 36) y un JDK 21
  permitieron regenerar el APK debug (F-08 resuelto el 13/10/2026). La inspección TLS
  corporativa obliga a confiar las CAs raíz de Windows al truststore del JDK para bajar
  dependencias de `dl.google.com`.
- **Riesgo abierto — Ley 1581:** antes de capturar datos reales, implementar consentimiento
  y control de acceso (F-07); de lo contrario la recolección sería ilícita.
