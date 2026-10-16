# Login con Google (roadmap #11)

> Documento de diseño y guía de credenciales para el inicio de sesión con Google
> («Sign in with Google») en la web y en el APK Android de **¡ADOPTA YA!**.
> Es la implementación del punto **#11** del backlog (`docs/03_MODULOS.md` §4).

---

## 1. Objetivo

Permitir que un adoptante (o el propio refugio) entre con su **cuenta de Google** sin crear
contraseña, reutilizando el mismo JWT interno que ya emite la API
(`POST /auth/login`) para que el resto del sistema (solicitudes, panel, seguimiento) funcione
sin cambios.

**Es gratis**: crear el proyecto en Google Cloud, la pantalla de consentimiento y los
*client IDs* no requieren tarjeta ni facturación; «Iniciar sesión con Google» es un servicio
gratuito.

---

## 2. Restricción clave: Google bloquea OAuth dentro de un WebView

Google prohíbe las peticiones de OAuth 2.0 dentro de *webviews* embebidos
(error `disallowed_useragent`). El APK de Capacitor corre en un **WebView**, por lo que un
`<script>` de Google Identity Services **no** funciona ahí.

Conclusión: **split por plataforma**.

| Plataforma | Mecanismo | Resultado |
|---|---|---|
| **Web** (navegador, `http://localhost:3000`) | Google Identity Services (GIS) — flujo de **ID token** | ID token (`credential`) |
| **Android/APK** | Plugin nativo con **Credential Manager** (`@capgo/capacitor-social-login` v8) | ID token (`idToken`) |

En ambos casos el ID token se envía a la **misma** ruta de la API (`POST /auth/google`), que lo
verifica y responde con el JWT propio. Así el resto del frontend no distingue el origen.

---

## 3. Arquitectura del flujo

```
        WEB (GIS)                         APK (plugin nativo)
   google.accounts.id                    SocialLogin.login()
        │ idToken                              │ idToken
        └───────────────┬──────────────────────┘
                        ▼
        POST /auth/google  { idToken }
                        │
            server/index.js
            google-auth-library.verifyIdToken({ audience: GOOGLE_CLIENT_ID })
                        │  payload: sub, email, name, email_verified
                        ▼
        buscarUsuarioPorGoogleSub / buscarUsuarioPorEmail
                        │
        ┌───────────────┴───────────────┐
        │ existe                        │ no existe
        ▼                               ▼
   reutiliza usuario          crearUsuario ({ proveedor:'google',
                                             google_sub, clave_hash:null })
                        │
                        ▼
        jwt.sign({ id, email, rol })  →  { token, usuario }
                        │
                        ▼
        frontend: localStorage.token + mostrarSesion(usuario)
```

---

## 4. Guía: crear las credenciales en Google Cloud Console

Datos de este proyecto:

- **Package name:** `com.adoptaya.app`
- **SHA-1 debug:** `EC:57:87:55:D7:D6:D9:C5:33:58:2D:E3:24:FF:38:52:A4:18:E5:BF`
- **Origen web:** `http://localhost:3000`

> El SHA-1 se obtiene con:
> `keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android`

### 4.1 Proyecto
1. Entra a https://console.cloud.google.com y crea un proyecto (p. ej. `adopta-ya`).

### 4.2 Pantalla de consentimiento OAuth
2. *APIs & Services → OAuth consent screen*.
3. Tipo **External**; nombre de la app `¡ADOPTA YA!`; correo de soporte y de desarrollador.
4. Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
5. Mientras esté en modo **Testing**, agrega tu correo en **Test users** (hasta 100). Si no,
   Google rechaza el login. (En producción no hace falta.)

### 4.3 Credencial A — Web client (para la web)
6. *Credentials → Create credentials → OAuth client ID → **Web application***.
7. **Authorized JavaScript origins:** `http://localhost:3000` (añade `http://localhost`).
   No se necesita *redirect URI* para el flujo de ID token.
8. Copia el **Client ID** (`...apps.googleusercontent.com`). Ese es el **Web client ID**; se usa
   como `GOOGLE_CLIENT_ID` en el backend y en el frontend web.

### 4.4 Credencial B — Android client (para el APK)
9. *Create credentials → OAuth client ID → **Android***.
10. **Package name:** `com.adoptaya.app`; **SHA-1:** el de la sección anterior.
11. El Android client ID **no** se usa como `webClientId`; sirve para que Google autorice la
    app instalada. Si más adelante firmas con otra clave (release), registra también ese SHA-1.

### 4.5 Configuración local
12. Copia `server/.env.example` a **`server/.env`** (no se versiona) y completa:
    ```
    GOOGLE_CLIENT_ID=<tu web client id>
    ```
13. En `www/js/script.js` define `GOOGLE_CLIENT_ID` con el mismo valor (es un dato público).
    En el APK se usa como `webClientId` del plugin en `capacitor.config.json`.

---

## 5. Cambios en el backend (Fase A)

- **Dependencia nueva:** `google-auth-library` (verificación robusta del ID token con JWKS).
- **Carga de `.env`:** `process.loadEnvFile('server/.env')` (Node ≥ 20.6), sin `dotenv`.
- **Ruta nueva:** `POST /auth/google  { idToken }`:
  - 400 si falta el token; 500 si `GOOGLE_CLIENT_ID` no está configurado;
  - 401 si el token no verifica;
  - 200 `{ token, usuario }` con el JWT propio (mismo formato que `/auth/login`).
- **Esquema (`sql/schema.sql`):**
  - `usuarios.clave_hash` pasa a **NULL** (Google no tiene contraseña);
  - columnas nuevas `google_sub VARCHAR(64) NULL UNIQUE` y
    `proveedor ENUM('local','google') NOT NULL DEFAULT 'local'`.
  - `sql/preparar_bd.js` aplica la migración de forma idempotente sobre bases ya creadas.

## 6. Cambios en el frontend (Fase B web / Fase C APK)

- **Web:** carga dinámica de `https://accounts.google.com/gsi/client` (no como `<script src>`
  estático en el HTML, para no romper la prueba P-01), botón «Continuar con Google» en
  `#modal-login` y función que envía el `credential` a `/auth/google`.
- **APK:** plugin `@capgo/capacitor-social-login` v8; si `Capacitor.isNativePlatform()` se usa
  el login nativo; `API_BASE` apunta a `http://10.0.2.2:3000` (emulador) o a la IP LAN del PC,
  con `network_security_config.xml` para permitir tráfico *cleartext* hacia el host local.

## 7. Verificación

- `npm test` → 18/18 (actualizando el *allowlist* de P-11 con las dependencias nuevas).
- `npm run db:iniciar` + `npm run db:preparar` + `npm start` y probar login Google en
  `http://localhost:3000`, confirmando que el usuario queda en MySQL (`usuarios.proveedor='google'`).
- `npm run sync` (P-13) y regeneración del APK.

## 8. Estado

- [x] Documento de diseño y guía de credenciales.
- [x] Fase A (backend + MySQL): `POST /auth/google`, `google-auth-library`, `.env`, migración.
- [x] Fase B (web): botón «Continuar con Google» (GIS) + i18n ES/EN.
- [x] Fase C (APK Android): plugin `@capgo/capacitor-social-login@8.5.17`, `API_BASE` a `10.0.2.2`,
  `network_security_config.xml`; APK regenerado (8.33 MB).
- [x] Fase D (parcial): `npm test` 18/18 y E2E de `/auth/google` contra MySQL (400/500/401).
- [x] Fase E (**web**): login real de punta a punta con una cuenta Google (usuario en MySQL con
  `proveedor='google'`).
- [x] Fase E (**APK nativo**, parcial): credencial Android **confirmada** por Google Play Services
  (`GOOGLE_SIGN_IN_VERIFY_CALLER; successful=true`), plugin `SocialLogin.login` ejecutándose
  (ver §9). **Falta cerrar el E2E**: además de que el emulador tenga una cuenta Google, el proxy
  corporativo sirve un certificado **no confiable** para `play.google.com` que rompe el asistente
  (ver §10), por lo que el nativo **no puede completarse en esta red corporativa**.

**Hecho por el responsable:** credenciales creadas (§4) y **Web client ID** aportado (en
`server/.env` y en `www/js/script.js`); la **credencial Android** (paquete + SHA-1) quedó validada
indirectamente porque Google verificó al llamador. Para cerrar el login nativo: iniciar sesión con
una cuenta Google **dentro del emulador** (ver §9) y tocar «Continuar con Google» en el APK.

## 9. Prueba del login nativo en el emulador (14-15/10/2026)

Máquina corporativa con **inspección TLS de Kaspersky Endpoint Security**: los certificados de
`ssl.gstatic.com`, `play.google.com`, etc. llegan firmados por
`CN=Kaspersky Endpoint Security Personal Certification Authority, O=AO Kaspersky Lab`, cuya raíz
**no** está en el trust store del emulador → los flujos que descargan esos recursos fallan con
`CertPathValidatorException: Trust anchor for certification path not found`.

Emulador: AVD `adopta_ya` (`tag.id=google_apis`, API 36, x86_64). Es **userdebug** → se puede
`adb root`.

### 9.1 Hallazgos (en orden)
1. **APK regenerado e instalado** (`npm run sync` + `gradlew assembleDebug` con JDK 21). El plugin
   nativo arranca: `GoogleProvider initialize/login package=com.adoptaya.app
   signingSha1=EC:57:87:…:E5:BF webClientId=…`.
2. **Credencial Android OK:** log de GMS
   `[GoogleSignIn_flowRunner] Flow step completed: GOOGLE_SIGN_IN_VERIFY_CALLER; successful=true`
   → **paquete + SHA-1 bien registrados** (no hay `ApiException:10`/`DEVELOPER_ERROR`).
3. **Bloqueo TLS:** el flujo caía en `…addaccount.ErrorActivity` con «There was a problem
   connecting to ssl.gstatic.com»; en logcat:
   `Failed to validate the certificate chain … Trust anchor … not found` y
   `[BrowserAuthFragment] onReceivedSslError … Issued to: CN=*.gstatic.com`.
4. **Fix aplicado (solo entorno, NO código):** instalar la **CA raíz de Kaspersky** en el trust
   store **del sistema** del emulador:
   - Emulador arrancado con **`-writable-system`**; `adb root`; `adb remount` (overlayfs);
   - CA exportada del almacén de Windows (`Cert:\LocalMachine\Root`, thumbprint
     `771FB6BDB2F80FA6F4D8B9F65729DC5A8F10689B`) → PEM;
     `openssl x509 -subject_hash_old` = **`9aafb596`** → archivo **`9aafb596.0`** copiado a
     `/system/etc/security/cacerts/`; reinicio del guest.
   - **Verificación:** desde el WebView del APK, `fetch("https://ssl.gstatic.com/generate_204")` y
     `https://play.google.com` → `TLS_OK`/`OK opaque` (el emulador ya confía).
5. **Tras el fix:** el asistente de Google (`MinuteMaidActivity`,
   `https://accounts.google.com/embedded/setup/v2/android?…`) **carga sin error TLS** (botones
   SKIP/NEXT y formulario de inicio de sesión). El login nativo queda pendiente **solo** de que el
   emulador tenga una cuenta Google.

### 9.2 Cómo retomar mañana
- Añadir una **cuenta Google** al emulador
  (*Settings → Passwords & accounts → Add account → Google*, o desde el propio botón del APK, que
  ya abre el asistente) y completar el inicio de sesión (correo + contraseña + 2FA).
- Luego tocar «Continuar con Google» en el APK y confirmar:
  - log del API (`server/index.js`): `[Google] ok: <correo> | proveedor: google | id: <n>`;
  - fila en MySQL: `SELECT id,correo,proveedor FROM usuarios WHERE proveedor='google';`
  - sesión mostrada en la app (sin `#modal-login`).
- **Alternativa más simple:** probar en una red **sin** inspección TLS (doméstica/hotspot), donde
  el asistente de Google funciona sin tocar el trust store.
- Notas de entorno:
  - El AVD arrancó con **`-writable-system`**; el `remount` usa overlayfs. Si el emulador se
    reinicia **sin** ese flag, la CA `9aafb596.0` se pierde y hay que volver a aplicarla.
  - El emulador (`google_apis`) sufrió ANR de `systemui` un par de veces; se recupera.
  - Inspección de la app: `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>` y
    CDP (`Runtime.evaluate`) sobre `http://127.0.0.1:9222/json`.

## 10. Continuación (15/10/2026): bug de contenido mixto y bloqueo del proxy

### 10.1 Bug corregido: contenido mixto (CÓDIGO)

El WebView del APK **corre sobre `https://localhost`** (scheme por defecto de Capacitor 8). Por
eso, todo `fetch` a la API local `http://10.0.2.2:3000` era bloqueado por **Mixed Content** y el
APK **nunca había podido consumir la API** (con independencia de Google). Log del WebView:

```
Mixed Content: The page at 'https://localhost/' was loaded over HTTPS, but requested an insecure
resource 'http://10.0.2.2:3000/health'. This request has been blocked; the content must be served
over HTTPS.
```

**Fix** en `capacitor.config.json`:

```json
"android": { "allowMixedContent": true }
```

Capacitor lo traduce a `WebSettings.MIXED_CONTENT_ALWAYS_ALLOW` (`CapConfig.java`:
`android.allowMixedContent`). Desplegado con `npm run sync` + `gradlew assembleDebug` + `adb install`.
Verificado por CDP **desde dentro del APK**:
`fetch(API_BASE+'/health')` → `OK {"ok":true,"fuente":"mysql"}` y `GET /mascotas` → 200.

### 10.2 Mejora: el login nativo ya no falla en silencio (CÓDIGO)

`ingresarConGoogleNativo()` mostraba `.catch(function () {})`, así que cualquier error era
invisible. Ahora muestra estado y errores:
- estado «Cargando Google…» (`google_cargando`);
- si el error es `NoCredentialException` → `google_sin_cuenta`
  («No hay cuentas de Google en el dispositivo…»);
- cualquier otro error → `google_error (mensaje)`.
Claves i18n ES/EN nuevas: `google_sin_cuenta`, `google_cancelado`.

### 10.3 Bloqueo de red: `play.google.com` con certificado no confiable (ENTORNO)

En esta sesión el asistente de Google **no** completó: cae en
`com.google.android.gms/.auth.uiflows.addaccount.ErrorActivity` con
*«There was a problem connecting to play.google.com.»*. Diagnóstico:

- `openssl s_client -connect play.google.com:443 -servername play.google.com -showcerts` →
  **1 solo certificado**, `subject=CN=*.google.com` e `issuer=CN=*.google.com` (**autofirmado,
  sin extensiones** — sin `basicConstraints` ni `subjectAltName`). Es un cert **de intercepción**
  del proxy corporativo (Kaspersky), no emitido por la CA de Kaspersky.
- En contraste, `accounts.google.com` presenta un cert **legítimo** (`issuer=C=US, O=Google Trust
  Services, CN=WE2`) y `ssl.gstatic.com`/`www.google.com` sí van firmados por la CA de Kaspersky
  (la que se instaló en §9.1).
- Log de GMS: `[MinuteMaidFragment] SSL error while trying to connect to play.google.com`.

**Intento:** se instaló ese cert autofirmado como CA del sistema del emulador
(`openssl x509 -subject_hash_old` = `d7378b6e` → `/system/etc/security/cacerts/d7378b6e.0` +
reboot) y **no ayudó** (Google pinea sus certificados y/o el proxy interviene el dominio);
se revirtió. El emulador **sigue sin cuenta Google** (`dumpsys account` → `Accounts: 0`).

### 10.4 Conclusión y ruta

El login nativo **no puede cerrarse en la red corporativa** por el MITM no confiable de
`play.google.com`. Ruta recomendada (§9.2): ejecutar en una **red sin inspección TLS**
(casa/hotspot), agregar una cuenta Google en el emulador y tocar «Continuar con Google»; con el
fix de §10.1 la app ya alcanza la API y con §10.2 mostrará cualquier error en pantalla.
