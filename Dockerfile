FROM node:12-alpine AS base
WORKDIR /app
RUN npm install -g serve
RUN mkdir dist
COPY package*.json ./
RUN npm install

FROM base AS source
COPY . .

FROM source
RUN npm run build
EXPOSE 8080
CMD ["serve", "-s", "dist", "-p", "8080"]
