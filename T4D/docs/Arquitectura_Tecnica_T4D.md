# ARQUITECTURA TÉCNICA Y ESPECIFICACIONES

### T4D — Sistema de Control de Inventario
**Technology For Defense S.A.S.**
Bogotá D. C., Colombia

---

### Control documental

- **Fecha de elaboración:** 23 de octubre de 2026
- **Versión:** 1.0
- **Autor:** Equipo de desarrollo T4D / completar nombre del estudiante
- **Estado:** Borrador para revisión
- **Documento relacionado:** `02.2_Requerimientos_Funcionales.md`
- **Documento relacionado:** `02.5_Plan_Migracion_Datos.md`
- **Documento relacionado:** `Plan_Respaldo_Recuperacion_T4D.docx`

---

## Contenido

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura de la aplicación](#3-arquitectura-de-la-aplicación)
4. [Base de datos](#4-base-de-datos)
5. [APIs y endpoints](#5-apis-y-endpoints)
6. [Seguridad](#6-seguridad)
7. [Rendimiento y optimización](#7-rendimiento-y-optimización)
8. [Integraciones externas](#8-integraciones-externas)
9. [Configuración y despliegue](#9-configuración-y-despliegue)
10. [Monitoreo y logs](#10-monitoreo-y-logs)
11. [Anexos](#11-anexos)

---

## 1. Resumen ejecutivo

T4D es una aplicación web para Technology For Defense S.A.S. que centraliza información de inventario de productos y repuestos asociados a vehículos blindados, movimientos de existencias, historial de precios, tareas y mantenimientos de taller, clientes, proveedores, empleados, sucursales, movimientos contables, notificaciones y reportes. Su propósito es reducir los registros manuales y los sistemas aislados, mejorar la trazabilidad y permitir que cada usuario opere según su rol.

La solución documentada separa la interfaz web, el servidor de aplicación y los servicios administrados. El frontend está construido con React y Vite; el backend usa Node.js y Express; la base de datos relacional se aloja en Supabase/PostgreSQL. Las imágenes de productos se almacenan en Cloudinary y se conserva su URL en la base de datos. El código fuente se versiona con Git y GitHub.

#### Paradigma de interfaz
SPA (Single Page Application), mediante React; confirmar rutas y configuración final del router.

#### Arquitectura lógica
Frontend React/Vite + API propia Node.js/Express + PostgreSQL administrado en Supabase.

#### Tipo de solución
Aplicación web con servicios en la nube; el backend es un proceso Node/Express independiente, no debe describirse como totalmente serverless.

#### Escalabilidad
Depende de los planes y límites contratados de hosting, backend y Supabase; no se ha medido escalabilidad horizontal automática.

#### Usuarios
Administrador, Gerente, Contador/Contadora y Mecánico.

#### Datos sensibles
Datos personales de clientes y empleados; se debe aplicar la Ley 1581 de 2012 y controles de acceso.

### 1.1 Características principales documentadas

- Autenticación con correo y contraseña y verificación por código enviado al correo, según los requerimientos funcionales.
- Control de acceso por rol, con módulos y permisos diferenciados.
- Consulta, búsqueda y filtrado del inventario; clasificación de stock Bajo, Medio o Alto.
- Registro de movimientos de inventario e historial de precios para facilitar la trazabilidad.
- Gestión de asignaciones de tareas y mantenimientos del taller.
- Gestión administrativa: clientes, direcciones, proveedores, empleados, sucursales y métodos de pago.
- Reportes, indicadores, gráficos y exportación de información, según el módulo implementado.

### 1.2 Principios de diseño

#### Separación de responsabilidades
La interfaz React no debe contener secretos ni sustituir las validaciones del backend; Express gestiona las rutas y la lógica de negocio; PostgreSQL conserva los datos.

#### Seguridad por diseño
Autenticación, validación de permisos en el servidor, protección de variables de entorno y control de acceso a datos.

#### Trazabilidad
Los cambios de existencias y precios deben conservar usuario, fecha, tipo y observación conforme a los requerimientos.

---

## 2. Stack tecnológico

La lista describe tecnologías identificadas en los documentos y en el historial técnico del proyecto. Las versiones exactas deben confirmarse en los archivos `package.json`, `package-lock.json` y `pubspec.yaml` vigentes antes de aprobar esta arquitectura; no se inventan versiones.

#### Frontend web — React + Vite
- **Uso en T4D:** Componentes de interfaz, módulos y compilación de archivos estáticos.
- **Estado / versión:** Identificado; versión exacta por verificar en `package.json`.

#### Estilos/UI — Bootstrap, bootstrap-icons, lucide-react
- **Uso en T4D:** Diseño de interfaz, iconografía y componentes visuales.
- **Estado / versión:** Identificados en el proyecto; versión exacta por verificar.

#### Backend/API — Node.js + Express
- **Uso en T4D:** Servidor HTTP, rutas, controladores, middleware y reglas de negocio.
- **Estado / versión:** Identificado; versión exacta por verificar.

#### Base de datos — Supabase PostgreSQL
- **Uso en T4D:** Persistencia relacional, llaves foráneas y consultas.
- **Estado / versión:** Identificado; versión del servidor/plan por confirmar.

#### Autenticación — Supabase Auth + lógica de backend
- **Uso en T4D:** Gestión de credenciales y vinculación por `auth_id`; la verificación por código se describe en requisitos.
- **Estado / versión:** Confirmar flujo final y configuración.

#### Correo — Nodemailer + SMTP Gmail
- **Uso en T4D:** Envío de códigos o notificaciones por correo, según la configuración del backend.
- **Estado / versión:** Integración desarrollada; confirmar credenciales y operación estable.

#### Imágenes — Cloudinary
- **Uso en T4D:** Almacenamiento de imágenes de productos y conservación de URL en la tabla `productos`.
- **Estado / versión:** Identificado en el plan de migración; verificar configuración activa.

#### Control de versiones — Git + GitHub
- **Uso en T4D:** Historial del código, ramas, colaboración y recuperación de versiones.
- **Estado / versión:** En uso.

#### Despliegue web — firebase 
- **Uso en T4D:** Publicación del frontend React/Vite en el flujo de despliegue documentado.
- **Estado / versión:** Build Vite reportado como exitoso; URL final por completar.

#### Pruebas de datos — Supabase staging
- **Uso en T4D:** Validar scripts, migraciones y restauraciones sin intervenir producción.
- **Estado / versión:** Entorno de pruebas requerido por el plan de migración.

### 2.1 ¿Por qué React y Vite?

- React permite dividir la interfaz en componentes reutilizables y organizar pantallas por módulo y rol.
- Vite ofrece un servidor de desarrollo y una compilación de producción mediante `npm run build`.
- El frontend puede desplegarse como archivos estáticos, separado del proceso backend y de la base de datos.

### 2.2 ¿Por qué Node.js y Express?

- Permiten centralizar rutas HTTP, middleware de autenticación, controladores y validaciones del lado servidor.
- Facilitan aplicar reglas de negocio antes de escribir en PostgreSQL, por ejemplo, registrar movimientos de inventario e historial de precios.
- Separan los permisos y la lógica del navegador; las decisiones de autorización no deben depender únicamente de ocultar botones.

### 2.3 Comparación: backend propio frente a acceso directo a Supabase

#### Reglas de negocio
- **API propia Node/Express:** Centralizadas en controladores/servicios del backend.
- **Acceso directo desde frontend a Supabase:** La lógica cliente puede manipularse; reglas críticas requieren funciones y políticas de base de datos.

#### Secretos
- **API propia Node/Express:** Permite mantener credenciales privilegiadas en el servidor.
- **Acceso directo desde frontend a Supabase:** Nunca debe exponerse `service_role` en navegador.

#### Autorización
- **API propia Node/Express:** Middleware y validaciones del backend, más permisos de base de datos.
- **Acceso directo desde frontend a Supabase:** RLS debe estar correctamente activado y probado.

#### Adecuación a T4D
- **API propia Node/Express:** Es el enfoque documentado para operaciones que generan movimientos e historial.
- **Acceso directo desde frontend a Supabase:** Puede ser complementario solo si está diseñado y protegido explícitamente.

### 2.4 Costos y estrategia Git

Los planes y costos actuales de Supabase, Netlify, GitHub, Cloudinary y correo no están especificados en los documentos fuente. Deben verificarse en las cuentas contratadas y registrarse en esta sección antes de la aprobación.

#### Supabase
- **Plan/costo actual:** Por confirmar
- **Acción requerida:** Registrar plan, límites de base de datos, Auth, backups y disponibilidad.

#### firebase
- **Plan/costo actual:** Por confirmar
- **Acción requerida:** Registrar plan, uso y dominio.

#### GitHub
- **Plan/costo actual:** Por confirmar
- **Acción requerida:** Confirmar tipo de cuenta y permisos del repositorio.

#### Cloudinary
- **Plan/costo actual:** Por confirmar
- **Acción requerida:** Confirmar cuota de almacenamiento y tráfico.

#### SMTP Gmail
- **Plan/costo actual:** Por confirmar
- **Acción requerida:** Validar límites, autenticación y confiabilidad para correo transaccional.

**Estrategia observada:** se trabaja con ramas como `main` y ramas de integrantes (por ejemplo, `nicol`), y se realizan pull/merge entre ramas. Como estándar recomendado, usar `main` para la versión estable, una rama `develop` si el equipo la adopta y ramas `feature/nombre` para funcionalidades. La existencia de `develop` no está confirmada; no debe darse por implementada.

```bash
git status
git switch -c feature/nombre-funcionalidad
git add .
git commit -m "Describe el cambio"
git push -u origin feature/nombre-funcionalidad
```

---

## 3. Arquitectura de la aplicación

### 3.1 Diagrama lógico

```text
USUARIO
   |
   | HTTPS (en producción)
   v
FRONTEND WEB: React + Vite
   | componentes / formularios / vistas por rol
   | solicitudes HTTP
   v
BACKEND: Node.js + Express (API propia)
   | CORS, middleware de autenticación,
   | rutas, controladores y reglas de negocio
   v
SUPABASE: PostgreSQL
   | 17 tablas relacionadas según el plan de migración
   |
   +---- SUPABASE AUTH: cuentas y credenciales
   |
   +---- CLOUDINARY: imágenes; la BD guarda la URL

Servicios complementarios:
   SMTP Gmail/Nodemailer para correo
   GitHub para versionamiento
   Netlify para frontend publicado (según despliegue documentado)
```

> **Nota:** El diagrama representa la arquitectura lógica descrita por los archivos. La topología exacta de producción, dominios, HTTPS del backend, proveedor de hosting del backend y redes debe completarse con los datos reales de despliegue.

### 3.2 Responsabilidad por capa

#### Frontend React/Vite
- **Responsabilidad:** Mostrar módulos, capturar datos, validar formato básico y presentar respuestas.
- **No debe asumir:** Ser la única barrera de seguridad o almacenar claves privilegiadas.

#### API Express
- **Responsabilidad:** Autenticar/autorizar solicitudes, validar entradas, aplicar reglas de negocio y responder errores HTTP.
- **No debe asumir:** Confiar solo en el rol enviado por el navegador.

#### PostgreSQL/Supabase
- **Responsabilidad:** Persistir registros, garantizar relaciones mediante PK/FK y ejecutar controles definidos en base de datos.
- **No debe asumir:** Suponer que una copia de tablas incluye automáticamente Auth y archivos externos.

#### Supabase Auth
- **Responsabilidad:** Administrar identidad y credenciales; vincular la cuenta con `usuarios.auth_id`.
- **No debe asumir:** Guardar contraseñas en texto plano en la tabla `usuarios`.

#### Cloudinary
- **Responsabilidad:** Guardar imágenes de productos; devolver URL que se registra en la base de datos.
- **No debe asumir:** Considerar que el backup SQL conserva los archivos de imagen.

### 3.3 Estructura de carpetas conocida

```text
T4D/
├── frontend web (React + Vite; rutas exactas por verificar)
├── backend/
│   ├── server.js
│   └── src/
│       ├── middlewares/
│       │   └── auth.middleware
│       ├── rutas / routes (estructura exacta por verificar)
│       ├── controladores / controllers (estructura exacta por verificar)
│       └── configuración de Supabase
├── package.json / package-lock.json
└── .env (local, nunca versionado)
```

> **Nota:** La estructura anterior es esquemática. Antes de entregar, reemplazarla por el árbol real de carpetas generado desde el repositorio actual; no crear carpetas solo para que coincidan con este ejemplo.

### 3.4 Flujo de datos: iniciar sesión

1. El usuario ingresa correo, contraseña y el código solicitado por el flujo de verificación.
2. El frontend envía la solicitud al endpoint de autenticación del backend.
3. El backend consulta Supabase Auth para validar las credenciales y verifica el registro correspondiente en `usuarios`.
4. El backend valida el estado de la cuenta y la información requerida para el acceso; el flujo exacto de emisión/validación del código debe comprobarse en el código actual.
5. Si la autenticación y autorización son correctas, el sistema devuelve el resultado de acceso y el frontend muestra el panel que corresponde al rol.
6. Las solicitudes posteriores a rutas protegidas deben incluir la credencial de sesión/token esperada por el middleware; una petición sin autorización debe ser rechazada.

### 3.5 Rutas públicas y protegidas

#### `/auth` — Autenticación
- **Estado documentado:** Pública para iniciar sesión; rutas específicas dependen de la configuración.
- **Observación:** No significa que todas las operaciones de auth sean públicas; revisar cada endpoint.

#### `/productos`
- **Estado documentado:** Protegida por middleware en `server.js`.
- **Observación:** Confirmar métodos y permisos por rol.

#### `/usuarios`
- **Estado documentado:** Protegida por middleware en `server.js`.
- **Observación:** Operaciones administrativas requieren autorización por rol.

#### `/reportes`
- **Estado documentado:** Protegida por middleware en `server.js`.
- **Observación:** Verificar permisos de exportación.

#### `/asignaciones`
- **Estado documentado:** Protegida por middleware en `server.js`.
- **Observación:** Validar rol y acceso a tareas.

#### `/proveedores`
- **Estado documentado:** Protegida por middleware en `server.js`.
- **Observación:** CRUD debe pasar por backend según la arquitectura documentada.

#### `/historialprecios` y `/notificaciones`
- **Estado documentado:** Existen rutas/controladores según el historial técnico.
- **Observación:** Confirmar montaje y métodos exactos en el código vigente.

---

## 4. Base de datos

El plan de migración identifica Supabase/PostgreSQL como destino y documenta 17 tablas relacionadas. El conteo de 263 filas corresponde al momento en que se redactó el plan; puede representar datos de prueba y no debe presentarse como inventario actual confirmado.

### 4.1 Inventario de tablas documentadas

#### `roles`
- **Propósito funcional:** Catálogo de perfiles y niveles de acceso.
- **Dependencias descritas:** Independiente; IDs documentados: 1 Administrador, 2 Contadora, 3 Gerente, 4 Mecánico.

#### `usuarios`
- **Propósito funcional:** Datos de cuenta, rol, estado y vínculo con Auth.
- **Dependencias descritas:** `roles`; Supabase Auth por `auth_id`.

#### `categorias`
- **Propósito funcional:** Categorías/niveles de blindaje.
- **Dependencias descritas:** Puede relacionarse consigo misma por `categoria_padre`.

#### `proveedores`
- **Propósito funcional:** Datos de proveedores y NIT.
- **Dependencias descritas:** Maestro.

#### `sucursales`
- **Propósito funcional:** Datos de sucursales.
- **Dependencias descritas:** Maestro.

#### `metodos_pago`
- **Propósito funcional:** Métodos de pago registrados.
- **Dependencias descritas:** Maestro.

#### `productos`
- **Propósito funcional:** Catálogo, precio, stock, unidad, imagen y referencias.
- **Dependencias descritas:** `categorias`, `proveedores`, `sucursales`, `usuarios`.

#### `clientes`
- **Propósito funcional:** Datos personales y documento de clientes.
- **Dependencias descritas:** `usuarios`.

#### `direcciones_cliente`
- **Propósito funcional:** Direcciones asociadas a clientes.
- **Dependencias descritas:** `clientes`.

#### `empleados`
- **Propósito funcional:** Información de empleados.
- **Dependencias descritas:** `usuarios`.

#### `asignaciones_tareas`
- **Propósito funcional:** Asignación de trabajo a mecánicos.
- **Dependencias descritas:** Relación circular con `mantenimiento`; también usada por detalles/notificaciones.

#### `mantenimiento`
- **Propósito funcional:** Servicios/mantenimientos del taller.
- **Dependencias descritas:** Relación circular con `asignaciones_tareas`.

#### `detalle_asignacion`
- **Propósito funcional:** Detalle de productos asociados a asignaciones.
- **Dependencias descritas:** `asignaciones_tareas`, `productos`.

#### `historial_precios`
- **Propósito funcional:** Registro histórico de cambios de precio.
- **Dependencias descritas:** `productos`, `usuarios`.

#### `movimientos_inventario`
- **Propósito funcional:** Entradas y salidas de stock.
- **Dependencias descritas:** `productos`, `usuarios`.

#### `movimientos_contables`
- **Propósito funcional:** Movimientos contables asociados a operaciones.
- **Dependencias descritas:** `mantenimiento`, `usuarios`, `asignaciones_tareas`.

#### `notificaciones`
- **Propósito funcional:** Notificaciones relacionadas con usuarios y asignaciones.
- **Dependencias descritas:** `usuarios`, `asignaciones_tareas`.

### 4.2 Relaciones y reglas referenciales

```text
roles (1) ────< usuarios
usuarios (1) ──< productos
proveedores (1) <── productos ──> (1) categorias
sucursales (1) <── productos
clientes (1) ────< direcciones_cliente
usuarios (1) ────< clientes / empleados
productos (1) ────< movimientos_inventario
productos (1) ────< historial_precios
asignaciones_tareas <──── relación circular ────> mantenimiento
asignaciones_tareas + productos ────< detalle_asignacion
usuarios + mantenimiento + asignaciones_tareas ────< movimientos_contables
usuarios + asignaciones_tareas ────< notificaciones
```

> **Nota:** Las relaciones del diagrama son un resumen conceptual del plan de migración, no sustituyen el diagrama entidad-relación generado desde el esquema real. Tipos exactos, nombres de columnas, PK, FK, `ON DELETE`, índices y restricciones deben exportarse de `information_schema` y `pg_constraint` antes de incluir DDL definitivo.

### 4.3 Orden de carga de datos

1. **Nivel 0:** `roles`, categorías (primero las categorías sin padre), proveedores, sucursales y métodos de pago.
2. **Nivel 1:** crear cuentas en Supabase Auth y cargar `usuarios` con `auth_id` válido.
3. **Nivel 2:** `empleados`, `clientes` y `productos`.
4. **Nivel 3:** `direcciones_cliente`.
5. **Nivel 4:** resolver la dependencia circular en tres pasos: `asignaciones_tareas` con `id_mantenimiento` NULL; `mantenimiento` con `id_asignacion`; actualizar `asignaciones_tareas.id_mantenimiento`.
6. **Nivel 5:** `detalle_asignacion`, `historial_precios`, `movimientos_inventario`, `movimientos_contables` y `notificaciones`.
7. Al cierre, fijar stock según conteo físico y registrar el movimiento de carga inicial por producto.

### 4.4 Índices, triggers y funciones SQL

Los documentos fuente no aportan un inventario verificable de índices, triggers ni funciones SQL personalizados actualmente instalados. Por tanto, no se afirma que ya existan. Se recomienda inspeccionar el esquema real y evaluar índices para columnas usadas en filtros y relaciones, por ejemplo código de barras, nombre de producto, llaves foráneas, fechas de movimientos y NIT; solo deben crearse tras revisar los índices existentes y probar su impacto.

Los requerimientos establecen que cada ajuste de stock genere un movimiento y que cada cambio de precio quede en historial. El plan de migración indica que el backend aplica reglas para generar esos registros. Antes de agregar triggers en PostgreSQL, decidir si la fuente de verdad será el backend o la base de datos para evitar registros duplicados.

```sql
-- Consultar tamaño real de la base (ejecutar en el SQL Editor autorizado)
SELECT pg_size_pretty(pg_database_size(current_database())) AS tamano_bd;

-- Inventario de tablas del esquema public
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### 4.5 Transacciones e integridad

Las operaciones que actualicen stock y creen el movimiento correspondiente deben ser atómicas: si falla el registro de auditoría, no debería quedar el stock cambiado sin trazabilidad. Confirmar si el backend implementa una transacción real o una función PostgreSQL/RPC; varias peticiones HTTP separadas no constituyen por sí solas una transacción.

Las reglas `ON DELETE` deben revisarse por tabla: restringir la eliminación de registros maestros con historia asociada; usar cascada solo cuando el borrado de hijos sea intencional y seguro. El plan de respaldo recomienda restaurar primero en un proyecto Supabase de staging y validar conteos e integridad antes de producción.

---

## 5. APIs y endpoints

El backend usa Node.js/Express y organiza el acceso mediante rutas, controladores y middleware de autenticación. Los documentos no incluyen un inventario completo de métodos HTTP y paths; lo siguiente recoge los grupos identificados y marca los detalles que se deben confirmar en los archivos de rutas.

#### `/auth`
- **Operaciones esperadas:** Inicio de sesión y operaciones de autenticación que existan en el código.
- **Control / observación:** Verificar path y método exactos; no publicar tokens ni códigos en logs.

#### `/productos`
- **Operaciones esperadas:** GET consultar; POST crear; PUT/PATCH editar; DELETE o baja lógica según implementación.
- **Control / observación:** Ruta protegida; validación de rol; registrar movimientos e historial cuando aplique.

#### `/usuarios`
- **Operaciones esperadas:** CRUD administrativo y activación/desactivación.
- **Control / observación:** Solo administrador según requerimientos; impedir que el usuario cambie su propio rol.

#### `/reportes`
- **Operaciones esperadas:** Consultar métricas y exportar reportes.
- **Control / observación:** Validar rol autorizado y limitar volumen de resultados.

#### `/asignaciones`
- **Operaciones esperadas:** Consultar/crear/actualizar asignaciones de tareas.
- **Control / observación:** Validar responsable, estado y relación con mantenimiento.

#### `/proveedores`
- **Operaciones esperadas:** CRUD de proveedores.
- **Control / observación:** Acceso a través del backend; NIT único como llave lógica.

#### `/historialprecios`
- **Operaciones esperadas:** Consulta de historial; escritura asociada a cambios de precio.
- **Control / observación:** Confirmar path y métodos actuales.

#### `/notificaciones`
- **Operaciones esperadas:** Consultar y gestionar notificaciones; envío por correo depende del flujo.
- **Control / observación:** Confirmar si notificación interna y correo están implementados para todos los eventos.

### 5.1 Convenciones HTTP

#### `GET`
- **Uso REST habitual:** Consultar uno o varios recursos.
- **Respuesta esperada:** 200 OK; lista vacía si no hay resultados.

#### `POST`
- **Uso REST habitual:** Crear un recurso o ejecutar una acción explícita.
- **Respuesta esperada:** 201 Created o 200 OK según endpoint.

#### `PATCH`
- **Uso REST habitual:** Actualizar parcialmente un recurso.
- **Respuesta esperada:** 200 OK o 204 No Content.

#### `PUT`
- **Uso REST habitual:** Reemplazar un recurso, si se usa en el proyecto.
- **Respuesta esperada:** 200 OK o 204 No Content.

#### `DELETE`
- **Uso REST habitual:** Eliminar o desactivar, según reglas del recurso.
- **Respuesta esperada:** 204 No Content o respuesta de confirmación.

### 5.2 Manejo de errores recomendado

#### `400` — Solicitud inválida
- **Significado:** Datos inválidos o solicitud incompleta.
- **Acción del cliente:** Mostrar validaciones específicas; no reenviar automáticamente.

#### `401` — No autenticado
- **Significado:** No autenticado o credencial inválida.
- **Acción del cliente:** Solicitar inicio de sesión.

#### `403` — Sin permiso
- **Significado:** Autenticado, pero sin permiso.
- **Acción del cliente:** Informar falta de permisos; no repetir la acción.

#### `404` — No encontrado
- **Significado:** Recurso/ruta no encontrado.
- **Acción del cliente:** Revisar URL o existencia del registro.

#### `409` — Conflicto
- **Significado:** Conflicto de integridad o duplicado (si se mapea así).
- **Acción del cliente:** Informar el conflicto, por ejemplo NIT/código repetido.

#### `500` — Error interno
- **Significado:** Error interno inesperado.
- **Acción del cliente:** Mostrar mensaje general y registrar detalle en servidor sin exponer secretos.

### 5.3 Ejemplo de consulta con Supabase

Este ejemplo es ilustrativo de una consulta directa a Supabase y no confirma que el frontend del proyecto acceda directamente a la base. En T4D las operaciones de negocio deben respetar la API y los controles definidos en el backend.

```javascript
// Ejemplo ilustrativo: consulta paginada desde un servicio autorizado
const desde = 0;
const hasta = 19;
const { data, error, count } = await supabase
  .from('productos')
  .select('id_producto, nombre_producto, stock_actual, precio_actual', { count: 'exact' })
  .order('nombre_producto', { ascending: true })
  .range(desde, hasta);
if (error) {
  throw new Error('No fue posible consultar el inventario');
}
```

> **Pendiente:** Antes de entregar, agregar al menos dos consultas reales con relaciones (JOIN/select anidado o endpoint del backend) y un hook React probado con estados loading y error. No incluir código ficticio como si ya estuviera en producción.

---

## 6. Seguridad

### 6.1 Autenticación y autorización

- Los requerimientos definen inicio de sesión con correo, contraseña y código de verificación enviado al correo (2FA según el documento funcional).
- Las contraseñas se administran mediante Supabase Auth; no deben guardarse en texto plano en `usuarios`.
- Cada usuario tiene un rol: Administrador, Gerente, Contador o Mecánico. El backend debe validar permisos en cada operación, no solo en la interfaz.
- El plan de migración requiere crear primero la cuenta en Supabase Auth y guardar su identificador en `usuarios.auth_id`.
- El estado inactivo debe impedir el inicio de sesión, conforme a los criterios de aceptación.

### 6.2 Matriz resumida de permisos

#### Usuarios
- **Administrador:** Administrar
- **Gerente:** Sin permiso documentado
- **Contador:** Sin permiso documentado
- **Mecánico:** Sin permiso documentado

#### Inventario/productos
- **Administrador:** Administrar
- **Gerente:** Solo lectura
- **Contador:** Solo lectura
- **Mecánico:** Consultar y ajustar stock según reglas

#### Movimientos de inventario
- **Administrador:** Consultar/gestionar según RF
- **Gerente:** Consultar y exportar según RF
- **Contador:** Consulta según acceso de inventario
- **Mecánico:** Genera movimiento al ajustar stock; validar acceso final

#### Historial de precios
- **Administrador:** Gestionar
- **Gerente:** Lectura
- **Contador:** Lectura
- **Mecánico:** No especificado claramente

#### Tareas y clientes
- **Administrador:** Pendiente de confirmar alcance administrativo
- **Gerente:** Gestionar asignaciones y clientes
- **Contador:** No especificado claramente
- **Mecánico:** Ejecutar mantenimientos

#### Contabilidad, proveedores, empleados, sucursales
- **Administrador:** Pendiente de confirmar acceso adicional
- **Gerente:** No especificado claramente
- **Contador:** Gestionar según requerimientos
- **Mecánico:** Sin permiso documentado

#### Categorías
- **Administrador:** Pendiente de confirmar
- **Gerente:** No especificado claramente
- **Contador:** No especificado claramente
- **Mecánico:** Gestionar según requerimientos

#### Reportes/notificaciones
- **Administrador:** Acceso definido en requerimientos
- **Gerente:** Permisos por confirmar
- **Contador:** Consultar/exportar reportes según RF
- **Mecánico:** Permisos por confirmar

> **Nota:** Los requerimientos funcionales contienen pendientes de confirmación sobre permisos adicionales del Administrador, edición/eliminación por Mecánico y envío de notificaciones. Esta matriz no reemplaza la autorización formal del cliente.

### 6.3 Variables de entorno

#### `SUPABASE_URL`
- **Uso:** URL del proyecto Supabase.
- **Regla:** Puede aparecer en configuración no secreta, pero mantenerla por entorno.

#### `SUPABASE_KEY`
- **Uso:** Clave usada por el backend; confirmar si es anon/publishable o `service_role`.
- **Regla:** Si es privilegiada, solo servidor y nunca frontend/GitHub.

#### `EMAIL_USER`
- **Uso:** Cuenta SMTP remitente.
- **Regla:** Guardar solo en entorno privado.

#### `EMAIL_PASS`
- **Uso:** Contraseña de aplicación o secreto SMTP.
- **Regla:** Secreto; no incluirlo en el documento.

#### `FRONTEND_URL`
- **Uso:** Origen autorizado para CORS.
- **Regla:** Usar URL de entorno correcta.

#### `JWT_SECRET` (si el código lo usa)
- **Uso:** Firma de tokens propios.
- **Regla:** No asumir su nombre exacto sin revisar `.env`; generar secreto fuerte.

> Los nombres de las variables son ilustrativos.

```ini
# Ejemplo de .env (valores ficticios; NO usar estos valores en producción)
SUPABASE_URL=https://proyecto-ejemplo.supabase.co
SUPABASE_KEY=REEMPLAZAR_POR_CLAVE_LOCAL
FRONTEND_URL=https://app-ejemplo.netlify.app
EMAIL_USER=correo-ejemplo@dominio.test
EMAIL_PASS=REEMPLAZAR_POR_SECRETO
```

### 6.4 Controles mínimos

- Agregar `.env` y `.env.*` al `.gitignore`; revisar que ningún secreto haya sido publicado en el historial de Git.
- No exponer la clave `service_role` en React/Vite. Si se filtra, rotarla.
- Validar y normalizar entradas en el backend; usar consultas parametrizadas/cliente oficial y no construir SQL concatenando texto del usuario.
- Configurar CORS con orígenes permitidos, HTTPS en producción y headers de seguridad apropiados.
- Activar y probar RLS en las tablas expuestas por APIs de Supabase. Si las operaciones se hacen solo con backend privilegiado, controlar autorización en backend y restringir acceso directo a la base.
- Limitar los logs: no registrar contraseñas, tokens, códigos de verificación, claves, datos personales innecesarios ni cadenas de conexión.
- Aplicar acceso mínimo necesario y protección de datos personales según Ley 1581 de 2012.

> **Estado de verificación:** los documentos fuente no incluyen evidencia de pruebas RLS con dos roles ni un inventario de políticas actual. La existencia y eficacia de RLS deben comprobarse en Supabase; no se declaran como probadas.

---

## 7. Rendimiento y optimización

El requerimiento no funcional RNF02 propone consultas, búsquedas y filtros en menos de 2 segundos; es un objetivo sugerido, no una medición demostrada. RNF04 propone 99 % de disponibilidad mensual, también pendiente de acuerdo con el cliente.

#### Paginación
- **Aplicación propuesta en T4D:** Consultar inventario, proveedores, clientes y movimientos por páginas en lugar de cargar todos los registros.
- **Verificación necesaria:** Medir número de filas, tamaño de respuesta y tiempo de consulta.

#### Índices PostgreSQL
- **Aplicación propuesta en T4D:** Evaluar índices para FK, código de barras, NIT, nombres y fechas de consulta frecuente.
- **Verificación necesaria:** Revisar índices existentes y comparar `EXPLAIN ANALYZE` antes/después.

#### Debounce
- **Aplicación propuesta en T4D:** Aplicar a búsqueda de productos/clientes si la interfaz consulta mientras se escribe.
- **Verificación necesaria:** Medir cantidad de solicitudes con y sin debounce.

#### Code splitting / lazy loading
- **Aplicación propuesta en T4D:** Cargar módulos del panel cuando el usuario los abre, si el router lo permite.
- **Verificación necesaria:** Revisar bundle y navegación real.

#### Optimización de imágenes
- **Aplicación propuesta en T4D:** Guardar imágenes en Cloudinary y usar tamaños/formato apropiados.
- **Verificación necesaria:** Comprobar peso, dimensiones y tiempos de carga.

#### Build de producción
- **Aplicación propuesta en T4D:** Ejecutar `npm run build` y revisar archivos de `dist`.
- **Verificación necesaria:** Guardar salida del build y tamaños reales.

### 7.1 Métricas que deben medirse

#### Lighthouse Performance
- **Cómo obtenerla:** Chrome DevTools → Lighthouse, sobre la URL publicada.
- **Resultado:** Pendiente de medición.

#### LCP y CLS
- **Cómo obtenerla:** Informe Lighthouse/Core Web Vitals.
- **Resultado:** Pendiente de medición.

#### Tiempo de consulta
- **Cómo obtenerla:** DevTools Network y/o logs del backend; repetir con datos representativos.
- **Resultado:** Pendiente de medición.

#### Tamaño del build
- **Cómo obtenerla:** Salida de `npm run build` y tamaño de `dist`.
- **Resultado:** Pendiente de registrar en el equipo actual.

#### Volumen de base de datos
- **Cómo obtenerla:** Consulta `pg_database_size` en Supabase.
- **Resultado:** Pendiente de medición.

> **Nota:** No se incluyen cifras de rendimiento inventadas. Debe ejecutarse una medición inicial y, si se implementan optimizaciones, una segunda medición comparable.

---

## 8. Integraciones externas

#### Supabase PostgreSQL
- **Propósito:** Persistencia de datos relacionales.
- **Estado descrito:** Actual / base de datos destino documentada.
- **Riesgo/precaución:** Respaldar y probar restauración; revisar permisos y disponibilidad.

#### Supabase Auth
- **Propósito:** Gestión de cuentas y contraseñas.
- **Estado descrito:** Actual / cuenta vinculada por `auth_id`.
- **Riesgo/precaución:** Auth y usuarios deben mantenerse sincronizados; el dump SQL no reemplaza el backup de Auth.

#### Cloudinary
- **Propósito:** Almacenar imágenes de productos.
- **Estado descrito:** Incluido en el plan de migración.
- **Riesgo/precaución:** Respaldar o verificar archivos por separado; SQL conserva URL, no el archivo.

#### SMTP Gmail + Nodemailer
- **Propósito:** Enviar correos de autenticación/notificaciones.
- **Estado descrito:** Configuración presente en backend; estabilidad final debe comprobarse.
- **Riesgo/precaución:** Proteger credenciales, validar límites y probar envío desde producción.

#### GitHub
- **Propósito:** Control de versiones del código.
- **Estado descrito:** Actual.
- **Riesgo/precaución:** No guardar `.env`, backups ni datos reales.

#### Netlify
- **Propósito:** Publicación del frontend.
- **Estado descrito:** Despliegue documentado; confirmar URL final y variables.
- **Riesgo/precaución:** Separar variables por entorno y verificar redirecciones SPA.

### 8.1 Integración de correo (flujo)

1. El backend recibe una solicitud válida que requiere enviar un código o notificación.
2. El servidor construye el mensaje con los datos mínimos necesarios.
3. Nodemailer envía el mensaje mediante el transporte SMTP configurado en variables de entorno.
4. El backend registra éxito o error sin escribir credenciales ni códigos sensibles en logs.
5. Se informa al frontend de un resultado controlado; los errores SMTP no deben filtrar detalles internos.

### 8.2 Roadmap: elementos futuros o por confirmar

- Confirmar si la pestaña Seguridad del perfil (gestión de contraseña, sesiones y configuración de 2FA) será implementada; los requerimientos la marcan como próxima.
- Automatizar alertas de monitoreo para fallos de API, errores de correo y fallos de backup, si no existe ya una solución.
- Evaluar un servicio de monitoreo de errores frontend/backend y métricas reales (por ejemplo, Sentry) solo después de validar necesidades y costos.

> **Nota:** No se afirma que WhatsApp Business, pagos en línea ni generación de PDF estén implementados. El documento de requisitos excluye el procesamiento de pagos en línea: T4D registra el método de pago, pero no procesa el cobro.

---

## 9. Configuración y despliegue

### 9.1 Requisitos previos

- Git instalado y acceso autorizado al repositorio.
- Node.js y npm compatibles con el `package.json` vigente.
- Credenciales de desarrollo para Supabase y SMTP, guardadas en un `.env` local.
- Proyecto Supabase de pruebas y acceso a la instancia correspondiente.
- Variables de entorno configuradas por separado para desarrollo y producción.

### 9.2 Instalación local del frontend

```bash
# Desde la carpeta del frontend, donde está package.json
git clone URL_DEL_REPOSITORIO
cd RUTA_DEL_FRONTEND
npm install
# Crear .env con variables de desarrollo (no copiar secretos a Git)
npm run dev
# Compilar para producción
npm run build
```

> **Nota:** Los comandos exactos de instalación dependen de la estructura actual del repositorio. Si frontend y backend tienen `package.json` separados, instalar dependencias en cada carpeta. No ejecutar comandos desde una carpeta sin `package.json`.

### 9.3 Instalación y arranque del backend

```bash
cd RUTA_DEL_PROYECTO/T4D/backend
npm install
# Crear .env local con SUPABASE_URL, clave de backend,
# FRONTEND_URL y configuración SMTP según el código.
node server.js
```

> **Nota:** En desarrollo se ha documentado el backend en `http://localhost:5000` y el frontend Vite en `https://localhost:5173` en una configuración local. El HTTPS local depende de certificados `localhost.key` y `localhost.crt`; si faltan, Vite puede fallar al iniciar. No confundir esa configuración local con HTTPS y dominios de producción.

### 9.4 Scripts de package.json

Los scripts exactos deben copiarse del `package.json` actual. Se ha confirmado el uso de `npm run dev` para el frontend y `npm run build` para compilar; el backend se ha arrancado con `node server.js`. Completar esta lista con los scripts reales de cada `package.json`.

#### `npm run dev`
- **Propósito:** Iniciar servidor de desarrollo frontend.
- **Estado:** Identificado en el flujo de desarrollo.

#### `npm run build`
- **Propósito:** Compilar frontend para producción.
- **Estado:** Identificado; build reportado exitoso en una ejecución anterior.

#### `node server.js`
- **Propósito:** Iniciar backend Express.
- **Estado:** Identificado en el flujo de desarrollo.

#### `npm test` / `npm run lint`
- **Propósito:** Pruebas y análisis estático.
- **Estado:** No confirmado; revisar scripts reales.

### 9.5 Despliegue

1. Confirmar que la rama y el commit contienen la versión que se quiere publicar.
2. Ejecutar `npm install` y `npm run build` localmente; resolver errores antes de desplegar.
3. En Netlify, seleccionar el repositorio y la rama correcta, configurar el directorio base del frontend y el directorio de publicación `dist`, según la estructura real.
4. Configurar las variables públicas necesarias del frontend en el hosting. No configurar `service_role` ni secretos SMTP en el frontend.
5. Si el backend se publica por separado, configurar sus variables en el proveedor del backend y autorizar el dominio del frontend en CORS.
6. Configurar reglas de redirección SPA para que las rutas de React devuelvan `index.html` cuando aplique.
7. Después del despliegue, probar login con cada rol, inventario, movimientos, reportes y una operación que genere historial; revisar logs y rollback disponible.

> **Importante:** El documento de respaldo y recuperación define una restauración en staging, una copia previa a cambios riesgosos y un plan de reversión. La recuperación de datos y el rollback del código son procesos diferentes: Git/Netlify no restauran automáticamente PostgreSQL.

### 9.6 Entornos

#### Local
- **Uso:** Desarrollo y depuración.
- **Reglas:** Datos de prueba; `.env` privado; no usar secretos de producción.

#### Staging
- **Uso:** Ensayo de migraciones, restauraciones y pruebas funcionales.
- **Reglas:** Proyecto Supabase separado con esquema equivalente; no probar scripts directamente en producción.

#### Producción
- **Uso:** Operación real de T4D.
- **Reglas:** Acceso restringido, backup previo a cambios, monitoreo y aprobación de despliegues.

---

## 10. Monitoreo y logs

El monitoreo debe permitir distinguir fallos de frontend, API, base de datos, autenticación, correo y almacenamiento de imágenes. Los documentos fuente no aportan evidencia de un Error Boundary, Sentry, Vercel Analytics ni una plataforma de logs centralizada; se consideran verificaciones o mejoras pendientes, no capacidades confirmadas.

#### Frontend / Netlify
- **Qué revisar:** Estado del deploy, errores de consola, recursos que no cargan y variables de entorno.
- **Respuesta inicial:** Reproducir el error, revisar Network/Console y comparar con el último deploy correcto.

#### Backend Express
- **Qué revisar:** Salida de consola/logs, excepciones, códigos HTTP, CORS y disponibilidad del proceso.
- **Respuesta inicial:** Identificar ruta y hora; revisar trazas sin exponer datos sensibles; reiniciar o revertir solo con autorización.

#### Supabase PostgreSQL
- **Qué revisar:** Logs de consultas/errores, conexiones, límites, estado del proyecto y restricciones.
- **Respuesta inicial:** Determinar si es fallo de conexión, consulta, permisos o capacidad.

#### Supabase Auth
- **Qué revisar:** Errores de login, cuenta vinculada, usuario desactivado y configuración del proveedor.
- **Respuesta inicial:** Validar estado de Auth y correspondencia con `usuarios.auth_id`.

#### SMTP/Nodemailer
- **Qué revisar:** Errores de conexión, autenticación, DNS, timeout y límites del proveedor.
- **Respuesta inicial:** Probar configuración desde servidor y comunicar alternativa si el código de acceso no llega.

#### Cloudinary
- **Qué revisar:** URLs rotas, permisos, cuota y disponibilidad de imágenes.
- **Respuesta inicial:** Verificar URL, recurso y configuración sin exponer claves.

### 10.1 Niveles de registro sugeridos

- **`INFO`:** Arranque del servicio, despliegue, operaciones generales y resultado de tareas programadas.
- **`WARN`:** Reintentos, entradas rechazadas, servicio externo lento o configuraciones próximas a límite.
- **`ERROR`:** Excepciones, consultas fallidas, fallos de autenticación técnica y errores de integraciones.
- **`DEBUG`:** Solo en desarrollo; nunca registrar secretos ni información personal innecesaria.

### 10.2 Procedimiento ante el reporte «la aplicación no carga»

1. Registrar hora, usuario afectado, navegador, URL y mensaje de error, sin pedir contraseñas.
2. Revisar si el frontend publicado está disponible y si el último despliegue finalizó correctamente.
3. Inspeccionar la consola del navegador y Network para distinguir error de carga, CORS, HTTP 401/403/404/500 o timeout.
4. Verificar estado del backend, logs de Express y conexión a Supabase.
5. Si coincide con un despliegue reciente, evaluar rollback del frontend/backend; no restaurar la base sin evidencia de corrupción.
6. Si hay pérdida o corrupción de datos, activar el Plan de Respaldo y Recuperación T4D y restaurar primero en staging.
7. Documentar causa, acciones, impacto, tiempo de recuperación y prevención.

### 10.3 Indicadores operativos

#### Disponibilidad
- **Objetivo / frecuencia inicial propuesta:** Revisar mensualmente; objetivo funcional sugerido: 99 %.
- **Estado:** Pendiente de instrumentar y medir.

#### Tiempo de respuesta
- **Objetivo / frecuencia inicial propuesta:** RNF sugiere menos de 2 segundos para consultas/búsquedas/filtros.
- **Estado:** Pendiente de medición.

#### Errores HTTP 5xx
- **Objetivo / frecuencia inicial propuesta:** Revisión semanal o ante incidentes.
- **Estado:** Pendiente de configurar reporte.

#### Backups válidos
- **Objetivo / frecuencia inicial propuesta:** Comprobar cada copia y registrar SHA-256; ejecutar restauraciones periódicas.
- **Estado:** Plan propuesto; pruebas reales pendientes.

#### Errores de correo
- **Objetivo / frecuencia inicial propuesta:** Revisar ante fallos de código de acceso y en cada prueba de despliegue.
- **Estado:** Pendiente de establecer alerta.

---

## 11. Anexos

### 11.1 Dependencias

No se adjuntó el `package.json` completo en los documentos de referencia. Por eso no se copia una lista de dependencias ni se inventan versiones. Para cerrar este anexo, copiar las secciones `dependencies` y `devDependencies` del `package.json` del frontend y del backend por separado, y registrar la versión de Node con `node --version`.

```bash
node --version
npm --version
npm list --depth=0
# Ejecutar dentro de cada carpeta que tenga package.json
```

### 11.2 Comandos útiles

```bash
# Estado y ramas Git
git status
git branch -a
git pull origin NOMBRE_RAMA

# Frontend (desde la carpeta con package.json)
npm install
npm run dev
npm run build

# Backend (desde T4D/backend, si esa estructura sigue vigente)
npm install
node server.js

# Verificar dependencias PostgreSQL local, si se utiliza pg_dump
pg_dump --version
pg_restore --version
```

### 11.3 Glosario

- **API:** Interfaz que permite a dos componentes de software intercambiar solicitudes y respuestas.
- **Backend:** Parte del sistema que ejecuta lógica del servidor y aplica reglas de negocio.
- **Frontend:** Interfaz con la que interactúa el usuario.
- **SPA:** Aplicación web que actualiza vistas sin recargar por completo el documento en cada navegación.
- **REST:** Estilo de diseño de API que usa recursos y métodos HTTP.
- **CRUD:** Crear, consultar, actualizar y eliminar registros.
- **PK:** Llave primaria que identifica de manera única una fila.
- **FK:** Llave foránea que relaciona una tabla con otra.
- **PostgreSQL:** Sistema gestor de bases de datos relacionales.
- **Supabase:** Plataforma que ofrece PostgreSQL y servicios relacionados como Auth.
- **Supabase Auth:** Servicio de gestión de identidad y credenciales.
- **RLS:** Row Level Security: políticas que restringen filas accesibles por cada usuario/rol.
- **Middleware:** Función intermedia que procesa una solicitud antes de llegar al controlador.
- **JWT:** Formato de token firmado usado para transportar declaraciones de autenticación.
- **CORS:** Política del navegador que controla qué orígenes pueden acceder a recursos de otro origen.
- **SMTP:** Protocolo usado para enviar correo electrónico entre servidores.
- **Cloudinary:** Servicio externo para almacenar y entregar imágenes/medios.
- **Build:** Proceso que genera archivos preparados para producción.
- **Deploy:** Publicación de una versión en un entorno accesible.
- **Staging:** Entorno de pruebas separado de producción.
- **Backup:** Copia de datos/configuración para recuperar información tras un incidente.
- **RPO:** Punto objetivo de recuperación: pérdida máxima de datos aceptable.
- **RTO:** Tiempo objetivo de recuperación: tiempo máximo aceptable para restablecer el servicio.
- **Rollback:** Reversión controlada a una versión o estado anterior.
- **Índice:** Estructura de base de datos que puede acelerar búsquedas y joins.
- **Trigger:** Rutina que se ejecuta automáticamente cuando ocurre un evento definido en la base de datos.
- **Debounce:** Técnica que espera una pausa de escritura antes de ejecutar una búsqueda.
- **CSP:** Content Security Policy: cabecera que limita fuentes de recursos y ayuda a mitigar XSS.
- **XSS:** Ataque en el que se inyecta código ejecutable en una página vista por otros usuarios.
- **2FA:** Autenticación en dos pasos: combina factores de verificación distintos.

### 11.4 Documentos relacionados

- `02.2_Requerimientos_Funcionales.md` — describe módulos, roles, requerimientos funcionales y no funcionales.
- `02.5_Plan_Migracion_Datos.md` — define tablas, orden de carga, validaciones, riesgos y pendientes de migración.
- `Plan_Respaldo_Recuperacion_T4D.docx` — establece política propuesta de respaldo, restauración, DRP, pruebas y responsables.

### 11.5 Pendientes antes de aprobar la arquitectura

- [ ] Completar el nombre del autor, revisor, docente y fecha de aprobación.
- [ ] Confirmar las versiones exactas de React, Vite, Express, Node.js, Supabase JS y demás dependencias desde los `package.json` vigentes.
- [ ] Generar el diagrama entidad-relación y el árbol de carpetas desde el repositorio actual.
- [ ] Extraer los endpoints y métodos HTTP exactos de los archivos `routes` y probar cada uno.
- [ ] Confirmar el flujo real de código 2FA, creación de JWT/sesión y expiración.
- [ ] Verificar la matriz de permisos con el cliente, especialmente los permisos adicionales del Administrador y del Mecánico.
- [ ] Revisar RLS, índices, triggers, funciones SQL y reglas `ON DELETE` en la base real; probar controles con usuarios de diferentes roles.
- [ ] Medir Lighthouse, tamaño del build, tiempos de respuesta y tamaño de la base de datos; adjuntar evidencias.
- [ ] Registrar planes y costos reales de servicios externos y URL de producción.
- [ ] Realizar la prueba de instalación por otra persona y documentar los pasos que necesiten ajuste.

### 11.6 Control de aprobación

#### Autor
- **Nombre:** ______________________________
- **Firma:** ______________________________
- **Fecha:** ____/____/______

#### Revisor / compañero
- **Nombre:** ______________________________
- **Firma:** ______________________________
- **Fecha:** ____/____/______

#### Docente
- **Nombre:** Ing. Edwin Marín
- **Firma:** ______________________________
- **Fecha:** ____/____/______

#### Representante T4D (si aplica)
- **Nombre:** ______________________________
- **Firma:** ______________________________
- **Fecha:** ____/____/______
