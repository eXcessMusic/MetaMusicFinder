# Use Node.js 18
FROM node:18-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy the rest of the application code to the working directory
COPY . .

# Run the config script
RUN npm run config

# Build the app using Angular CLI
RUN ng build --configuration production

# Print Node.js version and list installed packages
RUN node --version && npm list --depth=0

# Expose the port the app runs on
EXPOSE 4000

# Set the NODE_ENV environment variable
ENV NODE_ENV=production

# Run the app when the container launches
CMD ["npm", "start"]