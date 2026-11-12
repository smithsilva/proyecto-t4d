-- Ejecutar UNA vez en la base de datos de tu proyecto.
-- Reemplaza a Supabase Auth: la clave ahora se guarda (cifrada) en la tabla usuarios.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_code TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMPTZ;

-- Si la tabla tiene la columna auth_id (de Supabase) con NOT NULL, quita la restriccion:
-- ALTER TABLE usuarios ALTER COLUMN auth_id DROP NOT NULL;
