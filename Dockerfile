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

# Replace placeholders in index.html with actual environment variables
RUN sed -i "s/{{SPOTIFY_CLIENT_ID}}/$SPOTIFY_CLIENT_ID/g" /usr/share/nginx/html/index.html && \
    sed -i "s/{{SPOTIFY_CLIENT_SECRET}}/$SPOTIFY_CLIENT_SECRET/g" /usr/share/nginx/html/index.html

CMD ["nginx", "-g", "daemon off;"]