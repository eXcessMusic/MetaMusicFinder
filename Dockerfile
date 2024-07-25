# Stage 1: Build the Angular application
FROM node:18.18.0-alpine AS build
# Set the working directory
WORKDIR /usr/src/app
# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
# Install dependencies
RUN npm ci
# Copy the rest of the application source code
COPY . .
# Remove previous builds (if any)
RUN rm -rf dist/*
# Create environment files
RUN node config-env.mjs
# Build the Angular application
RUN npm run build
# Create runtime config
RUN node config-env.mjs
# Copy runtime-config.js to the dist folder
RUN cp src/assets/runtime-config.js dist/music-search-angular/browser/assets/

# Stage 2: Serve the application with Nginx
FROM nginx:1.23.2-alpine
# Expose port 80
EXPOSE 80
# Copy Nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf
# Copy the Angular build output to Nginx's html directory
COPY --from=build /usr/src/app/dist/music-search-angular/browser /usr/share/nginx/html
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]