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
- [ ] Fase E (login real de punta a punta).

**Pendiente del responsable:** crear las credenciales (§4) y aportar el **Web client ID**;
luego ponerlo en `server/.env` y en `www/js/script.js` (`GOOGLE_CLIENT_ID`), `npm run sync` y
regenerar/instalar el APK para probar.
