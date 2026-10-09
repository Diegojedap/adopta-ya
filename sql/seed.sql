-- Datos de ejemplo de ¡ADOPTA YA! (M-17)
-- Uso: mysql -u root -p adoptaya < sql/seed.sql

USE adoptaya;

INSERT INTO mascotas (nombre, especie, edad, descripcion, emoji, estado) VALUES
  ('Max',   'perro', '2 años', 'Amigable, cariñoso y lleno de energía.',       '🐶', 'disponible'),
  ('Luna',  'gato',  '1 año',  'Tranquila, tierna y busca una familia amorosa.', '🐱', 'disponible'),
  ('Rocky', 'perro', '3 años', 'Juguetón, obediente y muy cariñoso.',          '🐶', 'disponible');

-- Cuenta administradora de ejemplo; reemplazar clave_hash con bcrypt real antes de usar.
INSERT INTO usuarios (nombre, email, clave_hash, rol) VALUES
  ('Administrador', 'admin@adoptaya.local', 'CAMBIAR_HASH', 'administrador');
