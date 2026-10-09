# Arquitectura y entorno — ¡ADOPTA YA! 1.0

**Fecha de la descripción:** 08 de octubre de 2026. Se describe primero la arquitectura
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
| Página única | `www/index.html` | Header, inicio, catálogo, responsabilidad, footer |
| Estilos | `www/css/style.css` | Paleta naranja (#ff7043), tarjetas flex, media query 700 px |
| Lógica | `www/js/script.js` | Navegación y confirmación de adopción (sin persistencia) |
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
| Presentación | **Implementada (parcial)** — catálogo dinámico vía API con reserva estática y navegación | `www/` (P-02, P-03, P-04, P-06, P-08) |
| Aplicación/API | **Implementada (prototipo)** — mascotas, solicitudes y evaluación sobre store en memoria (hook opcional a MySQL) | `server/index.js`, `npm start` (P-05, P-07) |
| Persistencia | **Esquema versionado**, sin conexión activa (sin MySQL confirmado) | `sql/schema.sql`, `sql/seed.sql` |
| Seguridad | **Implementada (prototipo)** | auth con `bcryptjs` + JWT (P-09); sin secretos versionados (P-10) |
| Servicios (PDF/alertas) | **No implementados** | — |
| Empaquetado Android | **Implementado** — APK debug; requiere rebuild tras correcciones | `android/`, P-13, P-14 |

## 5. Herramientas y versiones (inventario verificado)

| Categoría | Herramienta | Versión / detalle | Dónde se verifica |
|---|---|---|---|
| Lenguaje frontend | HTML5 / CSS3 / JavaScript ES6 | vanilla, sin framework ni bundler | `www/` |
| Runtime móvil | Capacitor core / cli / android | 8.5.2 | `package.json` |
| Build Android | Gradle wrapper | 8.14.3 | `android/gradle/wrapper/gradle-wrapper.properties` |
| SDK Android | compileSdk / targetSdk / minSdk | 36 / 36 / 24 | `android/variables.gradle` |
| App ID | com.adoptaya.app · versionName 1.0 | versionCode 1 | `capacitor.config.json`, `android/app/build.gradle` |
| Java | JDK instalado en la máquina | 11.0.24 (insuficiente: AGP requiere 17+) | `java -version` |
| Pruebas | Node.js 24.16 + jsdom 23.0.1 | suite P-01…P-14 | `npm test` |
| Paquetes | npm 11.13 | resolución offline (registro npmjs.org inaccesible) | `package-lock.json` |
| Base de datos prevista | MySQL en 127.0.0.1:3307 (SQLTools) | esquema en `sql/schema.sql` + `sql/seed.sql`, sin conexión activa | `adopta-ya.code-workspace`, `server/index.js` |
| API local | Node.js (módulo `http`, sin dependencias) | puerto 3000 · `npm start` | `server/index.js` |
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
- **Riesgo abierto — JDK/SDK:** esta máquina no puede compilar Android (JDK 11, sin SDK,
  sin red). El build debe hacerse en un entorno con Android Studio (ver hallazgo F-08).
- **Riesgo abierto — Ley 1581:** antes de capturar datos reales, implementar consentimiento
  y control de acceso (F-07); de lo contrario la recolección sería ilícita.
