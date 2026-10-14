-- Datos de ejemplo de ¡ADOPTA YA! (M-17)
-- Uso: mysql -u root -P 3307 -h 127.0.0.1 adoptaya < sql/seed.sql
-- (La vía recomendada es `npm run db:preparar`, que crea el esquema y siembra sin duplicar.)

USE adoptaya;

-- Mascotas de ejemplo: solo se insertan si la tabla está vacía (idempotente).
INSERT INTO mascotas (nombre, especie, edad, descripcion, emoji, estado, salud, vacunas, esterilizado)
SELECT * FROM (
  SELECT 'Max'   AS nombre, 'perro' AS especie, '2 años' AS edad, 'Amigable, cariñoso y lleno de energía.'        AS descripcion, '🐶' AS emoji, 'disponible' AS estado, 'Sano. Vacunado y desparasitado.'    AS salud, 'Rabia, parvovirus' AS vacunas, 1 AS esterilizado
  UNION ALL
  SELECT 'Luna',  'gato',  '1 año',  'Tranquila, tierna y busca una familia amorosa.', '🐱', 'disponible', 'Sana. En buen estado general.',     'Triple felina', 1
  UNION ALL
  SELECT 'Rocky', 'perro', '3 años', 'Juguetón, obediente y muy cariñoso.',            '🐶', 'disponible', 'Sano. Control veterinario al día.', 'Rabia',         0
) AS semilla
WHERE (SELECT COUNT(*) FROM mascotas) = 0;

-- La cuenta administradora (admin@adoptaya.local) la siembra la propia API con un hash
-- bcrypt real al arrancar, o `npm run db:preparar`; por eso aquí ya no se inserta.
