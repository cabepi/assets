Para diseñar un sistema de activos fijos robusto para una empresa tecnológica, hemos estructurado las pantallas pensando en la **trazabilidad total**. Aquí tienes el detalle de las vistas principales, sus funcionalidades y los perfiles de acceso.

# 1. Dashboard Principal (Vista Ejecutiva)

*   **Estado**: ✅ Implementado
*   **Uso**: Monitoreo en tiempo real del estado de los activos, próximos vencimientos y valor financiero.
*   **Perfiles**: Administrador de IT, Gerente de Finanzas, Auditor.
*   **Contenido y Controles**:
    *   **KPI Cards**: Indicadores en tiempo real (SQL `count/sum`) de valor total, activos en mantenimiento y activos totales.
    *   **Gráfico de Distribución**: Activos por categoría.
    *   **Alertas**: Tabla resumida de garantías por vencer (30 días).

# 2. Inventario Maestro (Listado de Activos)

*   **Estado**: ✅ Implementado
*   **Uso**: Visualización global y filtrado de todos los equipos y licencias.
*   **Perfiles**: Administrador de IT, Soporte Técnico, Finanzas.
*   **Funcionalidades Técnicas**:
    *   **Búsqueda Server-Side**: Búsqueda dinámica con *debounce* por Nombre, Etiqueta (Tag), Serie o Modelo.
    *   **Filtros Dinámicos**: Filtrado por **Estado** y **Categoría**.
    *   **Impresión por Lote**: Funcionalidad para imprimir códigos QR de múltiples activos seleccionados.
*   **Contenido y Controles**:
    *   **Data Table**: Columnas de Etiqueta, Nombre, Modelo, Categoría, Estado, Fecha Compra.
    *   **Acciones**: Botón "Nuevo Activo", "Ver Detalle" y "Selección Múltiple".

# 3. Detalle y Edición de Activo

*   **Estado**: ✅ Implementado
*   **Uso**: Visualización profunda del ciclo de vida del activo y actualización de datos.
*   **Funcionalidades**:
    *   **Información Completa**: General, técnica y financiera.
    *   **Edición**: Modal para modificar datos críticos (Etiqueta, Nombre, Specs, Costos) con validación de unicidad de Tag.
    *   **Historial de Ubicaciones**: Timeline cronológico de movimientos.
    *   **Bitácora de Mantenimiento**: Registro de eventos de servicio y costos.
    *   **Código QR**: Generación dinámica apuntando a página de verificación pública.
    *   **Acciones de Ciclo de Vida**: Mover, Registrar Mantenimiento, Dar de Baja (Retiro).

# 4. Gestión de Asignaciones (Check-in / Check-out)

*   **Estado**: ✅ Implementado
*   **Uso**: Vincular o desvincular un activo de un empleado.
*   **Modos**:
    *   **Modo Entrega**: Asigna un activo en stock a un usuario. Requiere condición de entrega.
    *   **Modo Devolución**: Retorna un activo asignado al stock. Requiere condición de retorno.
*   **Validaciones**:
    *   Solo activos en 'stock' pueden entregarse.
    *   Solo activos 'assigned' pueden devolverse.
*   **Contenido**: Historial reciente de asignaciones en la misma pantalla.

# 5. Gestión de Usuarios (Consulta)

*   **Estado**: ✅ Implementado
*   **Uso**: Directorio de empleados y control de dotación tecnológica.
*   **Funcionalidades**:
    *   **Listado de Usuarios**: Búsqueda por nombre/email/departamento. Estadísticas de asignación.
    *   **Detalle de Usuario**:
        *   Perfil (Depto, Rol, Fecha Ingreso).
        *   **Activos Actuales**: Lista de equipos en poder del usuario.
        *   **Historial**: Registro histórico de equipos devueltos.

# 6. Verificación Pública (QR)

*   **Estado**: ✅ Implementado
*   **Uso**: Acceso rápido a información del activo escaneando el código QR físico.
*   **Seguridad**: Vista de solo lectura pública.
*   **Contenido**:
    *   Estado actual (Stock/Asignado).
    *   Especificaciones básicas.
    *   Línea de tiempo de asignaciones y mantenimientos (Auditoría).

# 7. Ingesta y Migración de Datos

*   **Estado**: ✅ Implementado
*   **Usuarios**: Carga inicial desde listado de empleados (script Python).
*   **Histórico**: Migración de activos y asignaciones históricas, mapeando estados y relaciones.

---

# 8. Especificaciones Técnicas (Arquitectura)

*   **Framework**: Next.js 15 (App Router).
*   **Base de Datos**: Vercel Postgres (Neon).
*   **Patrón de Datos**: **Raw SQL** (Sin ORM) para control total.
*   **Estilos**: Tailwind CSS.
*   **Mutaciones**: Server Actions para formularios y transacciones.
