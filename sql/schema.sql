-- Esquema de base de datos de ¡ADOPTA YA! (M-17)
-- Motor: MySQL 8 · Charset utf8mb4
-- Uso: mysql -u root -p < sql/schema.sql

CREATE DATABASE IF NOT EXISTS adoptaya
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE adoptaya;

CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL UNIQUE,
  clave_hash    VARCHAR(255)  NULL COMMENT 'NULL para cuentas creadas con Google (#11)',
  rol           ENUM('administrador','adoptante','veterinario') NOT NULL DEFAULT 'adoptante',
  proveedor     ENUM('local','google') NOT NULL DEFAULT 'local' COMMENT 'Origen de la cuenta (#11)',
  google_sub    VARCHAR(64)   NULL UNIQUE COMMENT 'Identificador "sub" de Google (#11)',
  creado_en     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bases ya creadas antes del login con Google (#11): migrar usuarios (ejecutar una vez, o usar
-- `npm run db:preparar`, que lo hace de forma idempotente).
-- ALTER TABLE usuarios MODIFY COLUMN clave_hash VARCHAR(255) NULL;
-- ALTER TABLE usuarios ADD COLUMN proveedor ENUM('local','google') NOT NULL DEFAULT 'local';
-- ALTER TABLE usuarios ADD COLUMN google_sub VARCHAR(64) NULL UNIQUE;

CREATE TABLE IF NOT EXISTS mascotas (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120)  NOT NULL,
  especie       ENUM('perro','gato','otro') NOT NULL DEFAULT 'perro',
  edad          VARCHAR(40)   NOT NULL,
  descripcion   TEXT          NULL,
  emoji         VARCHAR(8)    NULL,
  estado        ENUM('disponible','en_revision','adoptado') NOT NULL DEFAULT 'disponible',
  salud         TEXT          NULL COMMENT 'Ficha clínica: estado de salud, tratamientos (M-10)',
  vacunas       VARCHAR(255)  NULL COMMENT 'Vacunas aplicadas (M-10)',
  esterilizado  TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Esterilizado (M-10)',
  creado_en     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bases ya creadas antes de M-10: añadir las columnas de ficha clínica (ejecutar una vez).
-- ALTER TABLE mascotas
--   ADD COLUMN salud TEXT NULL,
--   ADD COLUMN vacunas VARCHAR(255) NULL,
--   ADD COLUMN esterilizado TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS solicitudes (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mascota_id            INT UNSIGNED  NOT NULL,
  adoptante_id          INT UNSIGNED  NULL,
  solicitante_nombre    VARCHAR(120)  NULL,
  solicitante_email     VARCHAR(160)  NULL,
  solicitante_telefono  VARCHAR(40)   NULL,
  motivacion            TEXT          NULL,
  consentimiento        TINYINT(1)    NOT NULL DEFAULT 0,
  estado                ENUM('en_revision','aprobada','rechazada') NOT NULL DEFAULT 'en_revision',
  creado_en             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revisado_en           TIMESTAMP     NULL,
  CONSTRAINT fk_solicitud_mascota   FOREIGN KEY (mascota_id)   REFERENCES mascotas(id) ON DELETE CASCADE,
  CONSTRAINT fk_solicitud_adoptante FOREIGN KEY (adoptante_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historial_estados (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  solicitud_id  INT UNSIGNED  NOT NULL,
  estado        ENUM('en_revision','aprobada','rechazada') NOT NULL,
  nota          VARCHAR(255)  NULL,
  revisor_id    INT UNSIGNED  NULL,
  creado_en     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evidencias (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  solicitud_id  INT UNSIGNED  NOT NULL,
  url           VARCHAR(500)  NULL COMMENT 'Foto (data-URL) opcional; la descripción puede ir sola (M-14)',
  descripcion   VARCHAR(1000) NULL,
  creado_en     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evidencia_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bases ya creadas antes del ajuste de M-14: permitir evidencias solo con descripción (ejecutar una vez).
-- ALTER TABLE evidencias MODIFY COLUMN url VARCHAR(500) NULL;
