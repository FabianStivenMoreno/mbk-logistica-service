# **mbk-logistica-service** 🚀

Este servicio de autenticación está construido con **Node.js**, **Express**, **TypeScript** y usa **MySQL** como base de datos.

---

## 📦 **Instalación y configuración**

### 1️⃣ **Clonar el repositorio**
```sh
git clone https://github.com/FabianStivenMoreno/mbk-logistica-service.git
cd mbk-logistica-service
```

### 2️⃣ **Configurar variables de entorno**
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Configuración general
PUERTO=3000
ROOT_PATH=/logistica/v1
LOGGER_LEVEL=debug
NODE_ENV=dev

# Configuración del servidor SMTP (para notificaciones por correo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER= logisticanoreply@gmail.com
SMTP_PASS=cualquierPass
SMTP_FROM="Logistica" logisticanoreply@gmail.com

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=prueba_coordinadora


#Configuracion de REDIS
REDIS_HOST=0.0.0.0
REDIS_PORT=6379

```

---

## 🚀 **Opción 1: Ejecutar con Docker Compose**
Esta opción levanta el servicio junto con una instancia de Redis en contenedores Docker.

### ✅ **Requisitos previos**
- Tener instalado [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/install/).
- Si no se ha creado la red se debe crear red con docker ejecutando el siguiente comando
```sh
docker network create coordinadora
```

### ▶ **1. Iniciar contenedores**
```sh
docker-compose up -d
```

### ▶ **2. Verificar logs del servicio**
```sh
docker logs -f logistica_service
```

### ▶ **3. Acceder a la API**
El servicio estará disponible en:
- 🔗 **http://localhost:3000/logistica/v1**
- En la carpeta docs hay una colección para probar desde postman los endpoints desarrollados

### ▶ **4. Detener y eliminar contenedores**
```sh
docker-compose down
```

---

## 💻 **Opción 2: Ejecutar localmente (sin Docker Compose)**
Si prefieres ejecutar el servicio sin Docker, necesitarás instalar Redis y MySQL manualmente.

### ✅ **Requisitos previos**
- Tener instalado [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/).
- Tener instalado [MySQL](https://dev.mysql.com/downloads/installer/).
- Tener instalado [Redis](https://redis.io/downloads/)

### ▶ **1. Instalar dependencias**
```sh
npm install
```

### ▶ **2. Asegurar que MySQL esté corriendo localmente**
Verifica que MySQL esté ejecutándose y crea la base de datos manualmente:

```sql
CREATE DATABASE prueba_coordinadora;
```

### ▶ **3. Asegurar que Redis esté corriendo localmente**
Verifica que MySQL esté ejecutándose y crea la base de datos manualmente:


### ▶ **4. Compilar TypeScript**
```sh
npm run build
```


### ▶ **5. Iniciar el servicio**
```sh
npm start
```

### ▶ **6. Acceder a la API**
- 🔗 **http://localhost:3000/auth/v1**
- 🔗 **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🛠 **Pruebas**
Ejecuta los tests con:
```sh
npm run test
```
---

### 📌 **Notas adicionales**
- Si cambias los valores de conexión a la base de datos en `.env`, actualiza tu configuración en `docker-compose.yml` si usas Docker.
- Para depuración, usa `docker-compose logs -f` o `docker logs -f auth_service`.
- Para correr este proyecto es prerequisito descargar y levantar [mbk-logistica-service](https://github.com/FabianStivenMoreno/mbk-auth-service) 
- VIDEO [Explicacion flujo](https://www.youtube.com/watch?v=Ggi6Lpt99ME)

---

🚀 ¡Listo para ejecutar y probar el servicio de logistica!

