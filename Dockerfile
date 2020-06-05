FROM node:lts-alpine
WORKDIR /app
RUN npm install -g serve
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["serve", "-s", "dist", "-p", "8080"]