# Marketplace Backend - Node.js & Express

Este es el servidor centralizado del Marketplace, una aplicación distribuida diseñada para el comercio electrónico C2C. El backend actúa como un orquestador que gestiona la lógica de negocio, la comunicación en tiempo real y la integración con servicios en la nube.

## Tecnologías Utilizadas

* **Entorno de Ejecución:** [Node.js](https://nodejs.org/) (v20+)
* **Framework:** [Express.js](https://expressjs.com/)
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [Sequelize](https://sequelize.org/)
* **Comunicación en Tiempo Real:** [Socket.io](https://socket.io/)
* **Seguridad y Auth:** [Auth0](https://auth0.com/) (JWT)
* **Almacenamiento en Nube:** [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)

## Características Principales

* **Autenticación Federada:** Validación de usuarios mediante tokens JWT proporcionados por Auth0.
* **Gestión de Productos:** CRUD completo con soporte para carga de imágenes directamente a contenedores de Azure.
* **Chat en Vivo:** Sistema de mensajería instantánea bidireccional mediante WebSockets.
* **Arquitectura MVC:** Separación clara entre Modelos, Controladores y Rutas.
* **Validación de Datos:** Uso de middlewares para asegurar la integridad de las peticiones.

## Estructura del Proyecto

```text
src/
├── database/      # Configuración y conexión a PostgreSQL
├── middlewares/   # Validaciones de seguridad y Auth0
├── modules/       # Lógica de negocio dividida por módulos:
│   ├── auth/      # Gestión de sesiones
│   ├── chat/      # Controladores y servicios de mensajería
│   ├── products/  # Gestión de catálogo e inventario
│   └── users/     # Perfiles y datos de usuario
├── uploads/       # Almacenamiento temporal de archivos
└── index.js       # Punto de entrada y arranque del servidor
```

# Instalación y Configuración

Clonar el repositorio

```bash
git clone [URL-DE-TU-REPOSITORIO]
cd backend
```
# Instalar dependencias:
```bash
npm install
```

# Variables de Entorno

```bash 
PORT=3000
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=marketplace_db
DB_HOST=127.0.0.1
AZURE_STORAGE_CONNECTION_STRING=tu_conexion_azure
AUTH0_DOMAIN=tu_dominio_auth0
AUTH0_AUDIENCE=tu_audiencia_api
```

# Ejecutar el servidor
```bash
npm run dev
```

# Seguridad
El backend implementa un middleware de verificación que valida el AccessToken enviado desde el cliente móvil. Ninguna operación de escritura (POST, PUT, DELETE) puede ser ejecutada sin un token válido emitido por Auth0.
















