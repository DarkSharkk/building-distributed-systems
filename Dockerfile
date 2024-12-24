# Используем официальный образ Node.js
FROM node:14

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы приложения
COPY . .

# Устанавливаем переменные окружения
ENV DB_USER=user
ENV DB_PASSWORD=root
ENV DB_NAME=nums
ENV DB_HOST=localhost
ENV DB_PORT=5432

# Открываем порт, на котором будет работать приложение
EXPOSE 3000

# Запускаем приложение
CMD ["node", "app.js"]
