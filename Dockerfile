# Étape 1 : Construction de l'application Angular
FROM node:18.18.0-alpine AS build

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code source de l'application
COPY . .

# Supprimer les précédents builds (le cas échéant)
RUN rm -rf dist/*

# Create environment files
RUN node config-env.mjs

# Construire l'application Angular
RUN npm run build

# Étape 2 : Servir l'application avec Nginx
FROM nginx:1.23.2-alpine

# Exposer le port 80
EXPOSE 80

# Copier la configuration de Nginx
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copier la sortie du build Angular dans le répertoire html de Nginx
COPY --from=build /usr/src/app/dist/music-search-angular/browser /usr/share/nginx/html

# Démarrer le serveur Nginx
CMD ["nginx", "-g", "daemon off;"]