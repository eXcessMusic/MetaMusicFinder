#!/bin/sh
set -e

# Replace environment variables in index.html
envsubst < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

# Start Nginx
nginx -g 'daemon off;'