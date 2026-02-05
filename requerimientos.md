# Documentación de Funcionalidades y Requerimientos - AssetTrack Pro

Este documento detalla todas las funcionalidades implementadas en el sistema de gestión de activos, incluyendo reglas de negocio, campos de datos, validaciones y arquitectura técnica.

---

# 1. Dashboard Principal (Vista Ejecutiva)

*   **Estado**: ✅ Implementado
*   **Ruta**: `/`
*   **Funcionalidad**: Ofrece una visión global del estado del inventario y salud financiera.
*   **Componentes Detallados**:
    *   **KPI Cards**: Estadísticas en tiempo real mediante agregaciones SQL (`COUNT`, `SUM`).
        *   *Valor Total*: Suma del `purchase_price` de todos los activos.
        *   *Activos*: Conteo total de registros en `fixed_assets`.
        *   *Mantenimiento*: Conteo de activos con `status = 'maintenance'`.
    *   **Gráfico de Categorías**: Distribución visual de activos agrupados por `category_id`.
    *   **Tabla de Garantías**: Listado de los próximos 5 activos cuya garantía vence en los siguientes 30 días.

# 2. Inventario Maestro

*   **Estado**: ✅ Implementado
*   **Ruta**: `/inventory`
*   **Funcionalidad**: Gestión centralizada, búsqueda y filtrado del parque tecnológico.
*   **Capacidades Técnicas**:
    *   **Búsqueda Global**: Input con *debounce* de 300ms que busca coincidencias en `name`, `asset_tag`, `model`, o `serial_number`.
    *   **Filtros Persistentes**: Selectores de **Categoría** y **Estado** que sincronizan su estado con los parámetros URL (`?category=...&status=...`), permitiendo compartir búsquedas.
    *   **Impresión de Etiquetas**: Selección múltiple (checkboxes) para generar una planilla de impresión con códigos QR de los activos seleccionados.
*   **Datos en Tabla**: Etiqueta (Tag), Activo (Nombre + Imagen placeholder), Modelo, Categoría, Estado (Badge con color dinámico), Fecha Compra, Precio, Acciones.

# 3. Gestión Detallada del Activo

*   **Estado**: ✅ Implementado
*   **Ruta**: `/inventory/[id]`
*   **Funcionalidad**: Expediente digital completo del activo.

### 3.1. Edición de Datos
*   **Mecanismo**: Modal con formulario controlado (`EditAssetModal`).
*   **Reglas de Negocio**:
    *   **Generación de Etiqueta (Auto-Tag)**: Al crear un activo, si no se especifica, el sistema genera automáticamente el tag con formato `AST-{AÑO}-{SECUENCIAL}` (ej. `AST-2024-0042`) basado en el conteo total de activos.
    *   **Validación de Unicidad**: El sistema previene duplicados de `asset_tag` en tiempo real; si se intenta asignar un tag existente a otro activo, el Server Action lanza un error explícito.
*   **Secciones Editables**:
    *   *Información General*: Etiqueta, Nombre, Marca, Modelo, Serie, Categoría.
    *   *Specs Técnicas*: CPU, RAM, Almacenamiento, Detalles Adicionales.
    *   *Financiero*: Fecha de Compra, Costo, Método de Depreciación.

### 3.2. Ciclo de Vida y Acciones
*   **Mover Activo**:
    *   Modal para cambio de ubicación.
    *   **Ubicaciones Restringidas**: Solo permite seleccionar de una lista cerrada (Nap del Caribe, Oficina de Santiago, Torre Bolivar Almacen, Torre Bolivar Piso 2, Torre Bolivar Piso 3, Torre Bolivar Piso 8).
    *   *Impacto*: Actualiza `location_id` y crea registro en `location_history` con `previous_location_id` para trazabilidad completa.
*   **Mantenimiento**:
    *   Registro de eventos (Preventivo, Correctivo).
    *   *Impacto*: Opcionalmente cambia el estado del activo a "En Mantenimiento".
    *   **Reincorporación (Recover)**: Acción explícita para sacar un activo de mantenimiento y devolverlo a estado `stock`.
*   **Baja/Retiro**:
    *   Proceso formal de salida.
    *   Campos: Fecha de Retiro, Razón, Valor de Recuperación.
    *   *Impacto*: Cambia estado a `retired`, deshabilita ediciones futuras.

### 3.3. Trazabilidad
*   **Timeline de Ubicaciones**: Historial cronológico de dónde ha estado el activo.
*   **Bitácora de Mantenimiento**: Lista de todos los servicios realizados con costos acumulados.
*   **Código QR**: Generador SVG dinámico que enlaza a la verificación pública.

# 4. Centro de Asignaciones

*   **Estado**: ✅ Implementado
*   **Ruta**: `/assignments`
*   **Funcionalidad**: Control de flujo de entrega y recepción de equipos a empleados.

### 4.1. Modo Entrega (Check-out)
*   **Regla**: Solo permite seleccionar activos con estado `stock`.
*   **Proceso**:
    1.  Seleccionar Usuario (Búsqueda predictiva).
    2.  Seleccionar Activo (Búsqueda por Tag/Serie).
    3.  Definir Condición de Entrega (Nuevo, Bueno, etc.).
    4.  *Resultado*: Crea registro en `assignments` con `is_current=true`, cambia estado del activo a `assigned`.

### 4.2. Modo Devolución (Check-in)
*   **Regla**: Solo lista activos que actualmente están asignados (`is_current=true`).
*   **Proceso**:
    1.  Buscar por Usuario o Activo.
    2.  Registrar Condición de Retorno (e.g., "Pantalla rayada").
    3.  *Resultado*: Cierra la asignación (`returned_at`, `is_current=false`) y libera el activo **siempre a estado `stock`**.
        *   *Nota*: Si el activo retorna en mal estado, el gestor debe moverlo manualmente a "Mantenimiento" (ver Sec. 3.2).

# 5. Directorio de Usuarios

*   **Estado**: ✅ Implementado
*   **Ruta**: `/users` y `/users/[id]`
*   **Funcionalidad**: Visión centrada en el empleado de la dotación tecnológica.
*   **Vistas**:
    *   **Listado**: Búsqueda filtrable de empleados con indicadores de cuántos activos tienen en su poder.
    *   **Perfil Individual**:
        *   Datos del empleado (Departamento, Rol, Fecha Ingreso).
        *   **Activos en Posesión**: Lista con acceso directo al detalle de cada equipo.
        *   **Historial de Responsabilidad**: Registro histórico de equipos que tuvo asignados y ya devolvió.

# 6. Verificación Pública

*   **Estado**: ✅ Implementado
*   **Ruta**: `/verify/[id]`
*   **Seguridad**: **Ruta Protegida**. Requiere autenticación activa.
    *   *Comportamiento*: Si un usuario no autenticado intenta acceder, es redirigido automáticamente a `/login?redirect=/verify/[id]`.
    *   *Flujo de Retorno*: Tras un inicio de sesión exitoso, el sistema detecta el parámetro `redirect` y devuelve al usuario a la pantalla de verificación original.
*   **Uso**: Escaneo de QR físico por personal autorizado (Seguridad/Auditoría).
*   **Datos Visibles**:
    *   Estado actual (Stock vs Asignado).
    *   Imagen y especificaciones básicas.
    *   Cronología de Movimientos y Asignaciones (Trazabilidad).

# 7. Ingesta y Migración de Datos

*   **Scripts de Carga**:
    *   `scripts/generate_users.py`: Procesa listados de RRHH para crear usuarios, generando correos electrónicos y normalizando departamentos.
    *   `scripts/generate_historical_data.py`: Migra inventarios legacy (Excel/Txt), mapeando estados antiguos a los nuevos (`Asignada` -> `assigned`), creando activos y asignaciones históricas simultáneamente.
    *   `scripts/seed-*.ts`: Ejecutores TypeScript para insertar los datos SQL generados de forma transaccional.

---

# 8. Arquitectura Técnica

*   **Frontend**: Next.js 16 (App Router, Turbopack) con React Server Components.
*   **Estilizado**: Tailwind CSS 3.4.
*   **Base de Datos**: PostgreSQL (Vercel/Neon).
    *   **Esquema Híbrido**: Uso de columnas relacionales estandarizadas combinadas con campos `JSONB` (`technical_specs`) para flexibilidad en especificaciones de hardware variables.
*   **Acceso a Datos**: **Raw SQL** (vía `@vercel/postgres`). No se utiliza ORM para garantizar control total sobre las consultas y optimización.
*   **Mutaciones**: Server Actions (`'use server'`) para todo el manejo de formularios, garantizando seguridad y validación en el servidor sin exponer endpoints API innecesarios.

# 9. Autenticación y Seguridad

*   **Estado**: ✅ Implementado
*   **Mecanismo**: Login sin contraseña (Passwordless) basado en códigos OTP.
*   **Protección**: `src/middleware.ts` intercepta rutas protegidas, redirigiendo a login si el token falta o es inválido.

### 9.1. Flujo e Interfaz de Usuario (UI Login)
La pantalla de inicio de sesión (`/login`) está diseñada para ser minimalista y segura, operando en dos pasos distintos:

1.  **Paso 1: Identificación (Email)**
    *   **Interfaz**: Muestra logo y campo de correo corporativo.
    *   **Acción**: Valida via *Server Action* si el usuario existe y está activo.
    *   **Feedback**: Muestra error si el usuario no existe.

2.  **Paso 2: Verificación (OTP)**
    *   **Interfaz**: Solicita código de 4 dígitos enviado al correo.
    *   **Seguridad**: El correo se muestra en modo solo lectura para confirmación.
    *   **Validación**: Verifica código vs BD y expiración (5 mins).
    *   **Resultado**: Genera JWT via `jose`, setea cookie `session_token` y redirige al dashboard **o a la URL original si existe un parámetro `redirect`**.

### 9.2. Lógica Backend
1.  **Generación**: `generateOTP()` crea un código numérico aleatorio.
2.  **Almacenamiento**: Se guarda en `asset.otp_codes` con `expires_at = NOW() + 5 min`.
3.  **Envío**: Se dispara el servicio de correo (ver Sec. 10).
4.  **Verificación**: `verifyLoginOTP` consulta la tabla, valida expiración y marca `used=true`.

# 10. Servicio de Notificaciones (Email)

*   **Estado**: ✅ Implementado (API REST Personalizada)
*   **Arquitectura**: Microservicio REST (`src/lib/email-service.ts`) reemplazando SDK de AWS.
*   **Componente Técnico**:
    *   **Autenticación**: Tokens Bearer con autorefresh (manejo de 401).
    *   **Diseño**: Plantilla HTML responsiva embebida para códigos OTP.
    *   **Endpoint**: Consume API externa configurada en variables de entorno.

# 11. Gestión Avanzada de Usuarios

*   **Clonación de Usuarios**:
    *   Se implementó script temporal para clonar perfiles existentes, facilitando la creación de usuarios masivos con roles idénticos.
