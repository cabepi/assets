# Asset Track Web

Plataforma moderna para la gestión y seguimiento operativo de activos corporativos.

## Características

*   **Dashboard Ejecutivo**: Métricas en tiempo real.
*   **Gestión de Inventario**: Listado, filtrado, búsqueda y visualización de activos.
*   **Asignaciones**:
    *   **Modo Entrega**: Asignación de equipos en stock a usuarios.
    *   **Modo Devolución**: Retorno de equipos asignados al inventario.
*   **Etiquetas Inteligentes**: Generación automática de códigos QR para cada activo.
*   **Base de Datos**: Integración robusta con PostgreSQL (Vercel Postgres).

## Configuración Local

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno**:
    Copia el archivo de ejemplo y rellena con tus credenciales.
    ```bash
    cp .env.example .env.local
    ```
    *   `POSTGRES_URL`: URL de conexión a tu base de datos Vercel Postgres.
    *   `NEXT_PUBLIC_BASE_URL`: URL base de la aplicación (ej. `http://localhost:3000` localmente).

3.  **Ejecutar Servidor de Desarrollo**:
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

1.  Importa este repositorio en Vercel.
2.  En la configuración del proyecto, añade las **Variables de Entorno** definidas en `.env.example`.
    *   **Importante**: Cambia `NEXT_PUBLIC_BASE_URL` a la URL de tu dominio en producción (ej. `https://asset-track-web.vercel.app`).
3.  Conecta tu base de datos Vercel Postgres (Vercel Storage).
4.  Despliega.
