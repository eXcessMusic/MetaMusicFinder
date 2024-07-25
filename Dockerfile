# Stage 1: Build the Angular application
FROM node:18.18.0-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN rm -rf dist/*
RUN npm run build

# Stage 2: Prepare the production image
FROM nginx:1.23.2-alpine
EXPOSE 80
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/music-search-angular/browser /usr/share/nginx/html

# Install envsubst
RUN apk add --no-cache gettext

# Copy a custom nginx startup script
COPY nginx-entrypoint.sh /nginx-entrypoint.sh
RUN chmod +x /nginx-entrypoint.sh

CMD ["/bin/sh", "/nginx-entrypoint.sh"]