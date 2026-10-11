FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf *

COPY index.html script.js ./
COPY styles/ ./styles/

EXPOSE 80
