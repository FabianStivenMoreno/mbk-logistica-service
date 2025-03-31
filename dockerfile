FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json e instalar dependencias
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copiar el resto del código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer el puerto en el que corre la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]