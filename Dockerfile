# Stage 1: Build the Angular application
FROM node:18.18.0-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN rm -rf dist/*

# Create runtime config
RUN node config-env.mjs

# Build the Angular application
RUN npm run build

# Ensure runtime-config.js is in the correct location
RUN cp src/assets/runtime-config.js dist/music-search-angular/browser/assets/

# Stage 2: Serve the application with Nginx
FROM nginx:1.23.2-alpine
EXPOSE 80
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/music-search-angular/browser /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]