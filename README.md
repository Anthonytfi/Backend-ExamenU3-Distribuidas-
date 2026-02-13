# Marketplace Backend - Servidor de Aplicaciones Distribuidas

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.11.0-brightgreen)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-4.18.2-blue)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Este repositorio contiene el motor central (Backend) del proyecto Marketplace. Es una API RESTful desarrollada con **Node.js** y **Express**, diseñada para gestionar la persistencia de datos, la seguridad mediante identidad federada y la comunicación bidireccional en tiempo real.

## Stack Tecnológico
* **Runtime:** Node.js (Entorno de ejecución asíncrono).
* **Framework:** Express.js (Gestión de rutas y middlewares).
* **ORM:** Sequelize (Mapeo objeto-relacional para PostgreSQL).
* **Real-Time:** Socket.io (Protocolo WebSocket para el chat).
* **Cloud Services:** * **Auth0:** Autenticación robusta basada en JWT.
    * **Azure Blob Storage:** Almacenamiento distribuido de imágenes de productos

# Instalación y Configuración

Clonar el repositorio

```bash
git clone [URL DEL REPOSITORIO]
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
El sistema utiliza un esquema de seguridad basado en Bearer Tokens. Todas las peticiones a los módulos de products y chat deben incluir un encabezado de autorización válido: Authorization: Bearer <JWT_TOKEN>















