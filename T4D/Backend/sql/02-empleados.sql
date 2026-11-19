-- Modulo Empleados en PostgreSQL (base t4d_db). Se puede ejecutar varias veces.

CREATE TABLE IF NOT EXISTS empleados (
  id_empleado        SERIAL PRIMARY KEY,
  cedula             VARCHAR(20)   NOT NULL,
  nombre_completo    VARCHAR(150)  NOT NULL,
  cargo              VARCHAR(100)  NOT NULL,
  salario            NUMERIC(12,2) NOT NULL DEFAULT 0,
  fecha_contratacion DATE          NOT NULL,
  fecha_terminacion  DATE,
  tipo_contrato      VARCHAR(30)   NOT NULL DEFAULT 'Indefinido',
  id_rol             INTEGER
);

ALTER TABLE empleados ADD COLUMN IF NOT EXISTS id_rol INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'empleados_id_rol_fkey'
  ) THEN
    ALTER TABLE empleados
      ADD CONSTRAINT empleados_id_rol_fkey
      FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE empleados DROP COLUMN IF EXISTS id_usuario;

CREATE UNIQUE INDEX IF NOT EXISTS empleados_cedula_unico ON empleados (cedula);
