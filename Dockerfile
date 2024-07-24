FROM node:19.7.0-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Run the config script to create environment files
RUN node config-env.mjs
RUN rm -rf dist/*
RUN npm run build



FROM nginx:1.23.2-alpine
EXPOSE 80
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/music-search-angular /usr/share/nginx/html