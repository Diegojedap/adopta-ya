-- Datos de ejemplo de ¡ADOPTA YA! (M-17)
-- Uso: mysql -u root -p adoptaya < sql/seed.sql

USE adoptaya;

INSERT INTO mascotas (nombre, especie, edad, descripcion, emoji, estado, salud, vacunas, esterilizado) VALUES
  ('Max',   'perro', '2 años', 'Amigable, cariñoso y lleno de energía.',        '🐶', 'disponible', 'Sano. Vacunado y desparasitado.',    'Rabia, parvovirus', 1),
  ('Luna',  'gato',  '1 año',  'Tranquila, tierna y busca una familia amorosa.', '🐱', 'disponible', 'Sana. En buen estado general.',     'Triple felina',     1),
  ('Rocky', 'perro', '3 años', 'Juguetón, obediente y muy cariñoso.',            '🐶', 'disponible', 'Sano. Control veterinario al día.', 'Rabia',             0);

-- Cuenta administradora de ejemplo; reemplazar clave_hash con bcrypt real antes de usar.
INSERT INTO usuarios (nombre, email, clave_hash, rol) VALUES
  ('Administrador', 'admin@adoptaya.local', 'CAMBIAR_HASH', 'administrador');
