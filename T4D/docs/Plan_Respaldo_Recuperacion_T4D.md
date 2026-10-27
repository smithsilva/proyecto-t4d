# PLAN DE RESPALDO Y RECUPERACIÓN DE DATOS

### T4D — Sistema de Control de Inventario
**Technology For Defense S.A.S.**

---

- **Responsable técnico:** Nicol Smith Zuñiga Silva, Juan Velasco Meneses, Gabriela Molina Ramirez
- **Fecha de preparación:** 23/10/2026
- **Versión:** 1.0
- **Estado:** Borrador para revisión; requiere validación técnica y aprobación del cliente
- **Base de datos destino:** Supabase sobre PostgreSQL
- **Documentos base:** `GUIA_APRENDIZAJE_PLAN_RESPALDO_RECUPERACION.md`

---

## 1. Objetivo y alcance

El objetivo de este plan es proteger y recuperar la información del sistema T4D de Technology For Defense S.A.S., que centraliza el inventario de productos para vehículos blindados, movimientos de inventario, precios, clientes, tareas de taller, mantenimientos, información contable, proveedores, empleados, sucursales, notificaciones y reportes.

El plan establece qué información debe respaldarse, la frecuencia propuesta, la custodia de las copias, los procedimientos de respaldo y restauración y las verificaciones necesarias para volver a operar con información íntegra.

### 1.1 Alcance incluido

- Base de datos PostgreSQL alojada en Supabase: estructura y datos de las 17 tablas documentadas en el plan de migración.
- Configuración de base de datos que sea exportable y esté dentro del alcance del respaldo lógico, incluidos objetos del esquema `public` y políticas/triggers que se deban verificar por separado.
- Código fuente del frontend React/Vite y del backend Node.js/Express, respaldado mediante Git/GitHub; el repositorio no reemplaza el backup de la base de datos.
- Referencias a imágenes de productos almacenadas en Cloudinary. La tabla guarda URL; la disponibilidad del archivo en Cloudinary debe verificarse por separado.
- Configuración operativa necesaria para recuperar el servicio, sin incluir secretos en el documento ni en el repositorio.

### 1.2 Fuera del alcance

- Computadores personales de los usuarios y sus archivos locales, salvo los archivos de respaldo controlados por el equipo.
- Contraseñas de usuarios en texto plano. Las cuentas se gestionan mediante Supabase Auth y no deben exportarse contraseñas.
- Datos que todavía no estén identificados en el inventario aprobado de migración.
- Recuperación de proveedores externos si estos sufren una interrupción general; el plan cubre la recuperación de los datos y la aplicación bajo control del proyecto.

### 1.3 Objetivos RPO y RTO propuestos

#### RPO — Pérdida máxima de datos
- **Objetivo inicial propuesto:** 24 horas para el respaldo lógico diario.
- **Justificación / condición:** Es una meta inicial de proyecto académico; se debe confirmar si una jornada de movimientos de stock o contables sería aceptable perder. La frecuencia diaria por sí sola no garantiza este RPO si el backup falla.

#### RTO — Tiempo máximo de recuperación
- **Objetivo inicial propuesto:** 8 horas para recuperación completa.
- **Justificación / condición:** Meta propuesta para restaurar base, validar integridad y comprobar acceso por roles. Debe medirse en el simulacro; no se considera logrado hasta contar con evidencia.

#### Disponibilidad
- **Objetivo inicial propuesto:** Horario laboral, meta de 99 % mensual según RNF04.
- **Justificación / condición:** El documento de requerimientos marca 99 % como valor sugerido, pendiente de aprobación del cliente.

> **Nota:** Los RPO/RTO anteriores son objetivos de planificación, no mediciones reales ni compromisos aprobados. Si la empresa requiere menor pérdida de movimientos, será necesario evaluar una frecuencia mayor y las opciones de recuperación de Supabase disponibles en el plan contratado.

---

## 2. Política de respaldos

- Mantener al menos tres copias de la información: base de producción, copia lógica local protegida y copia externa en una ubicación o proveedor distinto. Esta regla 3-2-1 es el objetivo; se debe comprobar que las tres copias existen.
- No almacenar archivos `.dump`, `.sql`, claves de Supabase ni archivos `.env` en GitHub ni compartirlos por chat.
- Proteger las copias con acceso restringido, cifrado cuando esté disponible y una contraseña/credencial custodiada fuera del archivo de backup.
- No ejecutar pruebas de restauración sobre producción. Las pruebas se harán en un segundo proyecto Supabase de staging, tal como indica el plan de migración.
- Antes de una migración, cambio de esquema o despliegue riesgoso, generar y verificar un respaldo manual.
- Registrar fecha, tipo, tamaño, ubicación, huella SHA-256, resultado y persona responsable de cada respaldo.
- Aplicar la Ley 1581 de 2012 al manejo de datos personales de clientes y empleados; conservar solo el acceso necesario.
- No asumir que GitHub contiene los datos de Supabase ni que las imágenes están respaldadas por conservar sus URL.

### 2.1 Criticidad de tablas

#### 🔴 Crítico — Operación y finanzas
- **Tablas / componentes:** `productos`, `movimientos_inventario`, `movimientos_contables`, `mantenimiento`, `asignaciones_tareas`
- **Motivo:** Afectan existencias, trazabilidad de trabajo y cifras financieras.

#### 🔴 Crítico — Acceso y permisos
- **Tablas / componentes:** `usuarios`, `roles`
- **Motivo:** Afectan acceso, permisos y asociación de acciones a usuarios; la autenticación se administra también en Supabase Auth.

#### 🟠 Importante — Datos maestros
- **Tablas / componentes:** `proveedores`, `sucursales`, `clientes`, `direcciones_cliente`, `empleados`, `categorias`, `metodos_pago`
- **Motivo:** Son datos maestros/administrativos necesarios para operar y reconstruir relaciones.

#### 🟠 Importante — Trazabilidad
- **Tablas / componentes:** `historial_precios`, `detalle_asignacion`
- **Motivo:** Conservan trazabilidad de precios y repuestos utilizados; `detalle_asignacion` aparece con 0 filas en el inventario de migración.

#### 🟢 Normal / revisar retención
- **Tablas / componentes:** `notificaciones`
- **Motivo:** El plan de migración indica que normalmente no se migran porque son mensajes del sistema nuevo; confirmar con el cliente si deben conservarse.

> **Nota:** La clasificación es propuesta a partir de la función descrita en los requerimientos. La criticidad definitiva, la retención legal y la necesidad de conservar notificaciones deben aprobarse con el cliente.

### 2.2 Responsabilidad compartida

#### Infraestructura del servicio Supabase
- **Responsable propuesto:** Proveedor Supabase
- **Control requerido:** Revisar el alcance del plan contratado y sus opciones de backup; no asumir que cubre cualquier borrado o error humano.

#### Backup lógico con `pg_dump`
- **Responsable propuesto:** Equipo técnico T4D
- **Control requerido:** Ejecutar, proteger, verificar huella y registrar resultado.

#### Copia externa
- **Responsable propuesto:** Equipo técnico T4D
- **Control requerido:** Copiar a ubicación separada y comprobar la huella de la copia externa.

#### Código fuente
- **Responsable propuesto:** Equipo de desarrollo / GitHub
- **Control requerido:** Control de versiones, ramas y recuperación de versión; no incluye los datos de la BD.

#### Datos reales e inventario físico
- **Responsable propuesto:** T4D / responsable de inventario
- **Control requerido:** Confirmar conteos y valores contra registros fuente y conteo físico.

---

## 3. Estrategia de respaldo

### Nivel 1 — Protección del proveedor
- **Qué protege:** Mecanismos disponibles en Supabase según plan.
- **Frecuencia propuesta:** Según el plan contratado; verificar en consola.
- **Destino:** Supabase.
- **Retención inicial propuesta:** Según condiciones del servicio.
- **Recuperación estimada:** Depende de la función disponible y del incidente.

### Nivel 2 — Backup lógico completo
- **Qué protege:** Esquema `public` y datos exportables PostgreSQL.
- **Frecuencia propuesta:** Diario a las 02:00; además antes de cambios riesgosos.
- **Destino:** Equipo seguro dedicado del responsable.
- **Retención inicial propuesta:** Diarios 30 días.
- **Recuperación estimada:** Por medir en prueba de restauración.

### Nivel 3 — Copia externa
- **Qué protege:** Copia del `.dump` y su archivo SHA-256.
- **Frecuencia propuesta:** Después de cada backup diario; verificar copia remota.
- **Destino:** Almacenamiento separado de producción.
- **Retención inicial propuesta:** Semanales 12 semanas y mensuales 12 meses como propuesta.
- **Recuperación estimada:** Por medir, depende de descarga y restauración.

### Nivel 4 — Código / configuración
- **Qué protege:** Frontend y backend, scripts y documentación sin secretos.
- **Frecuencia propuesta:** En cada cambio aprobado.
- **Destino:** GitHub privado/público según política; secretos fuera del repo.
- **Retención inicial propuesta:** Historial de Git.
- **Recuperación estimada:** Rollback de código, separado del rollback de datos.

> **Nota:** La frecuencia y retención son una política inicial sugerida, no datos confirmados de la operación actual. Deben ajustarse al tamaño real de la base, costos, plan Supabase y requisitos legales aplicables.

> **Importante:** GitHub versiona el código, pero no protege automáticamente filas, cambios de inventario, clientes, mantenimientos ni movimientos contables almacenados en PostgreSQL.

---

## 4. Tipos de respaldo

#### Completo lógico
- **Uso en T4D:** Exportar el esquema `public` y sus datos mediante `pg_dump` en formato custom.
- **Decisión:** Principal; permite transportar y restaurar la base PostgreSQL.

#### Snapshot / backup administrado
- **Uso en T4D:** Punto de recuperación ofrecido por Supabase, si está incluido en el plan.
- **Decisión:** Complementario; confirmar disponibilidad y retención reales.

#### Incremental / diferencial
- **Uso en T4D:** No se define un backup incremental propio en los documentos del proyecto.
- **Decisión:** No implementado en esta versión; no afirmar que existe.

#### Código versionado
- **Uso en T4D:** Código de frontend/backend y scripts en Git.
- **Decisión:** Complementario; no reemplaza los datos.

#### Archivos externos
- **Uso en T4D:** Imágenes alojadas en Cloudinary y sus URL en `productos`.
- **Decisión:** Verificar disponibilidad y opciones de copia de Cloudinary por separado.

> **Nota:** Un respaldo lógico completo debe validarse para confirmar qué objetos incluye. Las cuentas de Supabase Auth, políticas, extensiones, secretos, almacenamiento de imágenes y configuración de servicios pueden requerir procedimientos separados; no se debe asumir que un dump de `public` los recupera todos.

---

## 5. Frecuencia y retención

#### Backup lógico completo
- **Calendario propuesto:** Todos los días a las 02:00, fuera del horario de mayor uso.
- **Retención:** 30 copias diarias.
- **Verificación:** Archivo no vacío, tamaño razonable, huella SHA-256 y log exitoso.

#### Copia externa
- **Calendario propuesto:** Después de validar el backup diario.
- **Retención:** 12 copias semanales y 12 mensuales como propuesta.
- **Verificación:** Verificar la huella del archivo descargado desde el destino externo.

#### Backup manual pre-cambio
- **Calendario propuesto:** Antes de migraciones, cambios de esquema, borrados masivos o despliegues que afecten datos.
- **Retención:** Conservar hasta que el cambio sea aprobado y cierre el período de reversión.
- **Verificación:** Registrar cambio asociado y resultado.

#### Prueba de integridad
- **Calendario propuesto:** Semanal.
- **Retención:** Registro de resultados durante 12 meses como propuesta.
- **Verificación:** Validar checksum y listar objetos con `pg_restore --list`.

#### Restauración en staging
- **Calendario propuesto:** Mensual.
- **Retención:** Guardar evidencia y tiempos.
- **Verificación:** Comparar conteos y ejecutar consultas de integridad.

#### Simulacro completo
- **Calendario propuesto:** Semestral y después de cambios importantes del procedimiento.
- **Retención:** Guardar informe.
- **Verificación:** Medir RTO y confirmar si el RPO es alcanzable.

> **Nota:** El tamaño real de la base no aparece documentado. Debe medirse con `pg_database_size` y el tamaño real de cada `.dump` antes de calcular el almacenamiento anual. La retención final de documentos contables y datos personales debe revisarse con el cliente y la normativa aplicable.

---

## 6. Procedimientos de respaldo

### 6.1 Preparación segura

1. Confirmar que se tiene acceso autorizado al proyecto Supabase correcto y que se conoce la versión de PostgreSQL.
2. Instalar herramientas cliente PostgreSQL (`pg_dump`, `pg_restore` y `psql`) con una versión igual o superior a la del servidor.
3. Obtener la cadena de conexión desde Supabase → Connect. Usar Session pooler si la red no soporta IPv6, según la guía del proyecto.
4. Guardar la cadena de conexión en una variable de entorno local protegida. No pegar contraseñas en el documento, el código ni GitHub.
5. Crear un directorio protegido para los respaldos y comprobar que tiene espacio disponible.

### 6.2 Backup completo manual (PostgreSQL / Supabase)

```powershell
# PowerShell (Windows): definir la variable solo en la sesión actual
$env:DB_URL = "CADENA_DE_CONEXION_DE_SUPABASE"

# Crear nombre de archivo con fecha y hora
$fecha = Get-Date -Format "yyyy-MM-dd_HH-mm"
pg_dump "$env:DB_URL" --schema=public --no-owner -Fc -f "backup_T4D_$fecha.dump"

# Verificar que el archivo existe y no está vacío
Get-Item "backup_T4D_$fecha.dump" | Select-Object Name, Length, LastWriteTime

# Inspeccionar el contenido del dump
pg_restore --list "backup_T4D_$fecha.dump" | Select-Object -First 40

# Generar huella SHA-256
Get-FileHash "backup_T4D_$fecha.dump" -Algorithm SHA256 |
Format-List | Out-File "backup_T4D_$fecha.sha256"
```

> **Importante:** Reemplazar el texto de ejemplo por la cadena obtenida de Supabase solo en la terminal local. No guardar ni entregar la cadena con la contraseña. El comando de ejemplo respalda el esquema `public`; los objetos fuera de ese esquema y Supabase Auth deben evaluarse por separado.

### 6.3 Copia externa

1. Copiar el archivo `.dump` y su registro de huella a un almacenamiento separado del equipo y del proyecto Supabase de producción.
2. Descargar una copia desde el destino externo o calcular su huella allí y compararla con la huella original.
3. Registrar fecha, ubicación, tamaño y resultado en el control de backups.
4. Limitar el acceso a las copias a las personas autorizadas; no incluirlas en el repositorio Git.

### 6.4 Backup manual antes de una operación riesgosa

1. Identificar el cambio, responsable, ventana de ejecución y forma de revertirlo.
2. Generar un backup completo con fecha y hora.
3. Verificar tamaño, listado de objetos y SHA-256.
4. Confirmar que existe una copia externa accesible.
5. Ejecutar el cambio solo después de comprobar el respaldo y registrar la aprobación.

### 6.5 Protección del repositorio

```gitignore
# Agregar al .gitignore del proyecto
*.dump
*.sql
*.sha256
.env
.env.*
```

> **Nota:** El archivo `.sha256` no contiene la contraseña, pero debe mantenerse junto con el backup para verificarlo. La política del repositorio debe impedir que se publiquen datos reales.

---

## 7. Procedimientos de restauración

> **Regla de oro:** Toda restauración de práctica se ejecuta en un segundo proyecto Supabase vacío (staging), nunca sobre la base principal. Antes de producción se requiere autorización y un plan de reversión.

### 7.1 Restaurar en un proyecto de prueba

1. Seleccionar el archivo `.dump` y comprobar su SHA-256 contra el registro guardado.
2. Verificar que el proyecto de destino es el de pruebas y que está vacío o preparado para una restauración controlada.
3. Obtener la cadena de conexión del proyecto de prueba y asignarla a `DB_PRUEBA` en una terminal protegida.
4. Iniciar cronómetro antes de ejecutar la restauración.
5. Ejecutar `pg_restore` y registrar mensajes o advertencias.

   ```powershell
   # PowerShell: usar la cadena del proyecto de PRUEBA, nunca la de producción
   $env:DB_PRUEBA = "CADENA_DE_CONEXION_DEL_PROYECTO_DE_PRUEBA"
   pg_restore -d "$env:DB_PRUEBA" --no-owner --no-privileges "backup_T4D_FECHA.dump"
   ```

6. Repetir las consultas de conteo para las 17 tablas y compararlas con los conteos registrados antes del respaldo.
7. Verificar integridad referencial, valores de inventario y contabilidad, y acceso por rol.
8. Revisar políticas RLS, triggers, funciones y objetos necesarios desde Supabase; anotar cualquier objeto que no haya sido recuperado automáticamente.
9. Detener el cronómetro y registrar el tiempo real. Ese valor es el RTO medido para esta prueba.
10. Guardar capturas, log de comandos, checksum, conteos antes/después y observaciones.

### 7.2 Consultas de verificación

```sql
SELECT 'roles' AS tabla, COUNT(*) FROM roles
UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'categorias', COUNT(*) FROM categorias
UNION ALL SELECT 'proveedores', COUNT(*) FROM proveedores
UNION ALL SELECT 'sucursales', COUNT(*) FROM sucursales
UNION ALL SELECT 'metodos_pago', COUNT(*) FROM metodos_pago
UNION ALL SELECT 'productos', COUNT(*) FROM productos
UNION ALL SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL SELECT 'direcciones_cliente', COUNT(*) FROM direcciones_cliente
UNION ALL SELECT 'empleados', COUNT(*) FROM empleados
UNION ALL SELECT 'asignaciones_tareas', COUNT(*) FROM asignaciones_tareas
UNION ALL SELECT 'mantenimiento', COUNT(*) FROM mantenimiento
UNION ALL SELECT 'detalle_asignacion', COUNT(*) FROM detalle_asignacion
UNION ALL SELECT 'historial_precios', COUNT(*) FROM historial_precios
UNION ALL SELECT 'movimientos_inventario', COUNT(*) FROM movimientos_inventario
UNION ALL SELECT 'movimientos_contables', COUNT(*) FROM movimientos_contables
UNION ALL SELECT 'notificaciones', COUNT(*) FROM notificaciones;

-- Calidad básica
SELECT id_producto FROM productos
WHERE stock_actual < 0 OR precio_actual < 0;

SELECT id_mantenimiento FROM mantenimiento
WHERE total <> subtotal + iva;

SELECT nit, COUNT(*) FROM proveedores
GROUP BY nit HAVING COUNT(*) > 1;

SELECT codigo_barras, COUNT(*) FROM productos
GROUP BY codigo_barras HAVING COUNT(*) > 1;
```

> **Nota:** El plan de migración registra 263 filas en 17 tablas al momento de su elaboración. Es una referencia histórica del entorno descrito, posiblemente con datos de prueba; no debe tomarse como el conteo actual esperado sin volver a consultar la base.

### 7.3 Escenarios de recuperación

#### Escenario 1 — Registro eliminado por error

**Acciones principales:**
- Detener cambios relacionados.
- Identificar tabla, llave primaria y hora.
- Recuperar el registro desde backup en staging.
- Revisar relaciones y dependencias.
- Aplicar recuperación puntual autorizada evitando sobrescribir cambios recientes.

**Validación final:** Comparar campos y llaves foráneas con el registro de referencia; confirmar que no se alteraron otras tablas.

#### Escenario 2 — Datos de una tabla dañados

**Acciones principales:**
- Suspender escrituras que puedan agravar el daño.
- Generar respaldo del estado actual para análisis.
- Restaurar el dump en staging.
- Extraer y comparar los registros afectados.
- Planificar recuperación puntual con autorización.

**Validación final:** Ejecutar consultas de calidad, conteos e integridad; usuario funcional confirma los datos.

#### Escenario 3 — Pérdida total de la base

**Acciones principales:**
- Declarar incidente.
- Informar a responsable y cliente.
- Crear/seleccionar instancia de recuperación.
- Restaurar último dump válido.
- Recuperar objetos y configuraciones requeridos.
- Configurar backend con credenciales seguras.
- Probar acceso por roles.

**Validación final:** Conteos, integridad referencial, inventario, movimientos, mantenimientos, contabilidad y login correctos; medir RTO y documentar pérdida estimada de datos (RPO).

#### Escenario 4 — Despliegue de aplicación fallido

**Acciones principales:**
- Detener el despliegue.
- Identificar último commit/versión estable en Git.
- Revertir frontend/backend según plataforma y procedimiento de despliegue.
- No restaurar la base si el problema es solo de código.

**Validación final:** Pruebas de inicio de sesión, módulos por rol, consulta de inventario, movimientos y reportes. Confirmar compatibilidad del código anterior con el esquema actual.

> **⚠️ Advertencia:** Nunca ejecutar `TRUNCATE ... CASCADE` ni restaurar sobre producción como primer intento de solución. La recuperación puntual debe planificarse para no borrar registros relacionados ni sobrescribir datos válidos posteriores al backup.

---

## 8. Plan de recuperación ante desastres (DRP)

Se considera desastre para T4D una pérdida o corrupción de la base de datos, una interrupción que impida operar durante un período superior al RTO propuesto de 8 horas, una pérdida de credenciales críticas o un incidente de seguridad que ponga en riesgo la integridad o confidencialidad de los datos.

#### Fase 1 — Detección
- **Acciones:** Confirmar la falla, hora de inicio, módulos afectados y si existe riesgo de escrituras adicionales. Conservar logs y evidencias.
- **Responsable propuesto:** Responsable técnico; suplente si no está disponible.

#### Fase 2 — Activación y comunicación
- **Acciones:** Declarar incidente, abrir registro, informar a la dirección/cliente, indicar impacto conocido, último backup válido y hora de próxima actualización.
- **Responsable propuesto:** Líder del incidente / representante de T4D.

#### Fase 3 — Recuperación
- **Acciones:** Elegir backup válido, verificar checksum, restaurar en entorno controlado y recuperar configuración/servicios requeridos.
- **Responsable propuesto:** Responsable técnico.

#### Fase 4 — Validación y retorno
- **Acciones:** Ejecutar consultas de conteo y calidad; probar autenticación y módulos de Administrador, Gerente, Contador y Mecánico; autorizar el retorno.
- **Responsable propuesto:** Técnico + representantes funcionales.

#### Fase 5 — Cierre y mejora
- **Acciones:** Registrar causa, línea de tiempo, datos perdidos, RTO real, acciones correctivas y cambios al plan.
- **Responsable propuesto:** Líder del incidente + equipo.

### 8.1 Riesgos principales

#### Borrado o modificación accidental de datos
- **Probabilidad inicial:** Media
- **Impacto:** Alto
- **Mitigación:** Backup diario, backup previo a cambios y restauración puntual ensayada.

#### Backup incompleto o dañado
- **Probabilidad inicial:** Media
- **Impacto:** Alto
- **Mitigación:** Checksum, inspección del dump y prueba mensual de restauración.

#### Pérdida de acceso a Supabase o credenciales
- **Probabilidad inicial:** Media
- **Impacto:** Alto
- **Mitigación:** Custodia segura de accesos, suplente autorizado y documentación sin secretos.

#### Falla de despliegue del frontend/backend
- **Probabilidad inicial:** Media
- **Impacto:** Medio/alto
- **Mitigación:** Git, versiones identificadas y procedimiento de rollback de código.

#### Pérdida de imágenes externas
- **Probabilidad inicial:** Baja/media
- **Impacto:** Medio
- **Mitigación:** Revisar disponibilidad de Cloudinary y definir una política de copia de archivos.

#### Ransomware o acceso no autorizado
- **Probabilidad inicial:** Baja/media
- **Impacto:** Alto
- **Mitigación:** Copia externa fuera del alcance de las credenciales de producción y control de accesos.

### 8.2 Comunicación durante el incidente

**Mensaje modelo:**

> "Se identificó una interrupción que afecta [módulos/servicios] del sistema T4D desde [hora]. El equipo técnico está verificando el último respaldo válido de [fecha/hora] y ejecutando el procedimiento de recuperación. El tiempo estimado inicial es [estimación], sujeto a las verificaciones de integridad. La próxima actualización será a las [hora]. Informaremos cualquier posible pérdida de datos confirmada."

### 8.3 Criterios para volver a operar

- La base restaurada responde y los conteos se compararon con una referencia confiable.
- No hay errores bloqueantes de integridad referencial ni valores imposibles en stock, precios o totales de mantenimiento.
- Los roles pueden iniciar sesión y acceden únicamente a los módulos autorizados.
- Las funciones críticas de inventario, movimientos, mantenimiento, contabilidad y reportes fueron verificadas.
- El responsable de T4D autoriza el retorno y queda registrada la decisión.

---

## 9. Pruebas de recuperación y simulacro

#### Verificación del archivo y SHA-256
- **Frecuencia propuesta:** Semanal.
- **Evidencia:** Log y archivo de checksum.
- **Criterio de aceptación:** Huella válida y archivo con tamaño razonable.

#### Restauración de backup completo en staging
- **Frecuencia propuesta:** Mensual.
- **Evidencia:** Capturas, comandos, conteos y cronómetro.
- **Criterio de aceptación:** Restauración finalizada y conteos/integridad comparables.

#### Simulacro completo de pérdida de base
- **Frecuencia propuesta:** Semestral y tras cambios relevantes.
- **Evidencia:** Informe con línea de tiempo y responsables.
- **Criterio de aceptación:** Aplicación recuperada; RTO real comparado con objetivo; diferencias documentadas.

#### Prueba de rollback de código
- **Frecuencia propuesta:** Antes de cambios importantes o trimestral.
- **Evidencia:** Commit/versiones y resultado de pruebas.
- **Criterio de aceptación:** Versión estable vuelve a funcionar sin afectar indebidamente la base.

### 9.1 Registro del simulacro (completar al ejecutarlo)

- **Fecha y hora de inicio:** Pendiente de ejecutar
- **Archivo de respaldo y fecha:** Pendiente de ejecutar
- **Tamaño del archivo:** Pendiente de medir
- **Resultado de SHA-256:** Pendiente de verificar
- **Hora de finalización / duración total:** Pendiente de medir
- **Conteos antes y después:** Pendiente de registrar
- **¿Se cumplió el RTO propuesto de 8 horas?:** Pendiente de medir
- **Errores encontrados y correcciones:** Pendiente de documentar
- **Evidencias adjuntas:** Pendiente: capturas y logs

> **Nota:** La prueba no se considera completada hasta que se restaure realmente en staging y se anexen las evidencias. No se deben inventar tiempos, capturas ni resultados.

---

## 10. Monitoreo y alertas

#### 🔴 Alta — No se generó el backup diario o el último backup supera 24 horas
- **Acción:** Reintentar de forma controlada, revisar conexión y logs; no asumir que existe una copia válida.
- **Notificar a:** Responsable técnico y suplente.

#### 🔴 Alta — Archivo vacío o tamaño inusualmente pequeño
- **Acción:** Marcar como fallido, revisar log y generar nuevo backup.
- **Notificar a:** Responsable técnico.

#### 🚨 Crítica — SHA-256 no coincide
- **Acción:** No usar el archivo; buscar otra copia válida y revisar transferencia/almacenamiento.
- **Notificar a:** Responsable técnico y líder del incidente.

#### 🚨 Crítica — Falla de restauración o conteos distintos
- **Acción:** Mantener el sistema de prueba aislado, registrar errores y probar otro backup válido.
- **Notificar a:** Responsable técnico y representante T4D.

#### 🚨 Crítica — Acceso sospechoso o exposición de credenciales
- **Acción:** Revocar/rotar credenciales afectadas, revisar logs y evaluar incidente de datos.
- **Notificar a:** Responsable técnico y dirección.

#### 🟠 Media/alta — Falta de espacio en almacenamiento de backups
- **Acción:** Liberar espacio según política de retención y verificar que queda una copia externa válida.
- **Notificar a:** Responsable técnico.

> **Nota:** Como control inicial, registrar para cada ejecución el código de salida del comando, fecha, tamaño y SHA-256. La automatización de alertas queda como tarea de implementación; no está confirmada en los documentos base.

---

## 11. Roles y responsabilidades

**Leyenda:** `R` = ejecuta · `A` = responde y aprueba · `C` = consultado · `I` = informado

#### Ejecutar backup
- Responsable técnico: **R**
- Suplente técnico: **R alterno**
- Representante T4D / cliente: **I**
- Docente (entorno académico): **I**

#### Custodiar copia externa
- Responsable técnico: **R**
- Suplente técnico: **R alterno**
- Representante T4D / cliente: **A**
- Docente (entorno académico): **I**

#### Autorizar restauración de producción
- Responsable técnico: **C**
- Suplente técnico: **I**
- Representante T4D / cliente: **A**
- Docente (entorno académico): **I**

#### Restaurar y validar técnicamente
- Responsable técnico: **R**
- Suplente técnico: **R alterno**
- Representante T4D / cliente: **A/C**
- Docente (entorno académico): **I**

#### Validar procesos del negocio
- Responsable técnico: **C**
- Suplente técnico: **I**
- Representante T4D / cliente: **R/A**
- Docente (entorno académico): **I**

#### Realizar y documentar simulacro
- Responsable técnico: **R**
- Suplente técnico: **R alterno**
- Representante T4D / cliente: **C**
- Docente (entorno académico): **I**

#### Aprobar el documento
- Responsable técnico: **C**
- Suplente técnico: **I**
- Representante T4D / cliente: **A**
- Docente (entorno académico): **C**

> **Nota:** Los nombres y suplentes deben completarse con personas reales antes de aprobar el plan. La asignación de responsabilidades de esta sección es propuesta.

### Contactos de emergencia (plantilla)

- **Responsable técnico:** Nombre y canal institucional
- **Suplente técnico:** Nombre y canal institucional
- **Representante autorizado de T4D:** Nombre y canal institucional
- **Proveedor / administrador de Supabase:** Canal oficial de soporte aplicable

---

## 12. Costos y recursos

No es posible calcular un costo exacto con los documentos base porque no incluyen el tamaño real de la base, el volumen de los archivos de respaldo, el plan contratado de Supabase ni las tarifas vigentes del almacenamiento externo. Los valores deben verificarse antes de aprobar el presupuesto.

#### Supabase
- **Uso:** Base de datos y funciones de backup disponibles en el plan.
- **Dato pendiente para calcular costo:** Plan contratado, límites y funciones de recuperación incluidas.

#### Equipo local seguro
- **Uso:** Copia temporal del dump.
- **Dato pendiente para calcular costo:** Espacio libre y política de cifrado/acceso.

#### Almacenamiento externo
- **Uso:** Copia fuera del entorno de producción.
- **Dato pendiente para calcular costo:** Proveedor, GB necesarios, tarifa mensual y costo de descarga.

#### Herramientas PostgreSQL
- **Uso:** `pg_dump`, `pg_restore` y `psql`.
- **Dato pendiente para calcular costo:** Versión compatible; herramientas cliente pueden ser gratuitas.

#### Tiempo del equipo
- **Uso:** Ejecución, validación y simulacros.
- **Dato pendiente para calcular costo:** Horas por backup, restauración y revisión.

> **Nota:** Para estimar almacenamiento, primero ejecutar la consulta de tamaño real de la base y medir los `.dump` generados. El costo de no tener backup puede incluir reconstrucción manual de movimientos de inventario, pérdida de trazabilidad de precios, tareas de taller y registros contables.

---

## 13. Registro, control de versiones y aprobaciones

### 13.1 Registro de backups

#### Registro 1
- **Fecha/hora:** Pendiente
- **Tipo:** Completo lógico
- **Archivo / ubicación:** Pendiente
- **Tamaño:** Pendiente
- **SHA-256 verificado:** Pendiente
- **Resultado:** No ejecutado
- **Responsable:** Pendiente

#### Registro 2
- **Fecha/hora:**
- **Tipo:**
- **Archivo / ubicación:**
- **Tamaño:**
- **SHA-256 verificado:**
- **Resultado:**
- **Responsable:**

### 13.2 Lista de verificación mensual

- [ ] Se generaron los backups previstos y no hay alertas pendientes.
- [ ] Se verificaron los archivos y sus huellas SHA-256.
- [ ] La copia externa fue comprobada, no solo la copia local.
- [ ] Se restauró una copia en staging y se midió el tiempo.
- [ ] Se compararon conteos de las 17 tablas y se revisaron consultas de integridad.
- [ ] Se revisaron permisos, accesos y custodia de secretos.
- [ ] Se actualizaron los contactos, el procedimiento y las evidencias.
- [ ] Se registraron hallazgos, responsables y fechas de corrección.

### 13.3 Control de versiones

#### Versión 1.0
- **Fecha:** 26/10/2026
- **Descripción:** Primera versión basada en el plan de migración y los requerimientos funcionales. Se dejan marcados los datos y pruebas pendientes.
- **Estado:** Borrador
- **Elaboró / revisó:** Equipo de desarrollo / pendiente de revisión

### 13.4 Aprobaciones

#### Responsable técnico
- **Nombre:** ______________________________
- **Firma:** ______________________________
- **Fecha:** ____/____/______

#### Suplente técnico
- **Nombre:** ______________________________
- **Firma:** ______________________________
- **Fecha:** ____/____/______

#### Representante de Technology For Defense S.A.S.
- **Nombre:** ______________________________
- **Firma:** ______________________________
- **Fecha:** ____/____/______

#### Compañero que ejecutó el simulacro
- **Nombre:** ______________________________
- **Firma:** ______________________________
- **Fecha:** ____/____/______

#### Docente — Ing. Edwin Marín
- **Nombre:** ______________________________
- **Firma:** ______________________________
- **Fecha:** ____/____/______

---

## Referencias documentales

- `02.5_Plan_Migracion_Datos.md` — T4D, inventario de 17 tablas, conteo histórico de 263 filas, Supabase/PostgreSQL, entornos staging/producción, validación y rollback.
- `02.2_Requerimientos_Funcionales.md` — módulos de acceso, inventario, taller/clientes, administración/contabilidad, notificaciones/reportes; seguridad, auditoría y disponibilidad.
- `GUIA_APRENDIZAJE_PLAN_RESPALDO_RECUPERACION.md` — estructura de 12 secciones, RPO/RTO, regla 3-2-1, laboratorios pg_dump/pg_restore, simulacro, monitoreo, RACI y control de aprobación.
- Documentación oficial de referencia indicada en la guía: Supabase backups y conexiones PostgreSQL; PostgreSQL `pg_dump` y `pg_restore`. Consultar versiones vigentes antes de ejecutar comandos.
