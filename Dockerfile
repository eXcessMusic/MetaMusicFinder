# Stage 1: Build the Angular application
FROM node:18.18.0-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve Angular app and run Express server
FROM node:18.18.0-alpine
WORKDIR /usr/src/app

# Copy package.json and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the built Angular app
COPY --from=build /usr/src/app/dist ./dist

# Copy the Express server file
COPY server/server.js ./

# Expose port 3000
EXPOSE 3000

# Start the Express server
CMD ["node", "server.js"]