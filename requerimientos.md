Para diseñar un sistema de activos fijos robusto para una empresa tecnológica, debemos estructurar las pantallas pensando en la **trazabilidad total**. Aquí tienes el detalle de las vistas principales, sus controles y los perfiles de acceso.

# 1. Dashboard Principal (Vista Ejecutiva)

*   **Estado**: ✅ Implementado
*   **Uso**: Monitoreo en tiempo real del estado de los activos, próximos vencimientos y valor financiero.
*   **Perfiles**: Administrador de IT, Gerente de Finanzas, Auditor.
*   **Contenido y Controles**:
    *   **KPI Cards**: Indicadores en tiempo real (SQL `count/sum`) de valor total, activos en mantenimiento y activos totales.
    *   **Gráfico de Distribución**: Activos por categoría.
    *   **Gráfico de Depreciación**: Proyección del valor en libros (Placeholder visual).
    *   **Alertas**: Tabla resumida de garantías.

# 2. Inventario Maestro (Listado de Activos)

*   **Estado**: ✅ Implementado
*   **Uso**: Visualización global y filtrado de todos los equipos y licencias.
*   **Perfiles**: Administrador de IT, Soporte Técnico, Finanzas.
*   **Funcionalidades Técnicas**:
    *   **Búsqueda Server-Side**: Búsqueda dinámica con *debounce* (300ms) por Nombre, ID (Tag) o Modelo.
    *   **Filtros Dinámicos**: Filtrado por **Estado** y **Categoría** (obtenidas de la BD) sincronizados por URL.
*   **Contenido y Controles**:
    *   **Barra de Búsqueda**: Input integrado con URL params.
    *   **Filtros Avanzados**: Selects funcionales.
    *   **Data Table**: Columnas de ID, Nombre, Modelo, Categoría, Estado, Fecha Compra.
    *   **Acciones**: Botón "Nuevo Activo" y "Ver Detalle".

# 3. Registro y Edición de Activo (Formulario Detallado)

*   **Estado**: ✅ Implementado
*   **Uso**: Alta de nuevos equipos en el sistema.
*   **Tecnología**: Server Actions (`createAsset`) para inserción segura y rápida.
*   **Reglas de Negocio**:
    *   **Generación de ID**: Automática con formato `AST-YYYY-XXXX`.
    *   **Especificaciones**: Almacenamiento flexible como JSONB.
*   **Campos y Controles**:
    *   **Información General**: Nombre (Req), Categoría (Dinámica), Marca, Modelo, Serie.
    *   **Especificaciones Técnicas**: CPU, RAM, Almacenamiento, Detalles (JSON).
    *   **Datos Financieros**: Fecha de Compra (Req), Precio (Req), Método de Depreciación.
    *   **Documentación**: Placeholder para carga de archivos.

# 4. Gestión de Asignaciones (Check-in / Check-out)

*   **Estado**: 🚧 En Desarrollo
*   **Uso**: Vincular o desvincular un activo de un empleado con validez legal (firma).
*   **Modos**:
    *   **Modo Entrega**: Asigna un activo en stock a un usuario. Requiere condición y firma.
    *   **Modo Devolución**: Retorna un activo asignado al stock. Requiere condición de retorno.
*   **Campos y Controles**:
    *   **Selección de Activo**: Búsqueda por Serie/Tag.
    *   **Selección de Usuario**: Búsqueda por Nombre.
    *   **Estado Físico**: Select (Nuevo, Excelente, Bueno, Regular, Malo).
    *   **Fecha Efectiva**: DatePicker.
*   **Contenido**: Tabla "Asignaciones Locales Recientes" con estado (Confirmado).

---

# 5. Especificaciones Técnicas (Arquitectura)

*   **Framework**: Next.js 14+ (App Router).
*   **Base de Datos**: Vercel Postgres (Neon).
*   **Patrón de Datos**: **Raw SQL** (Sin ORM) para control total de consultas y performance.
*   **Estilos**: Tailwind CSS con diseño limpio y moderno (SaaS B2B).
*   **Mutaciones**: Server Actions para formularios.
