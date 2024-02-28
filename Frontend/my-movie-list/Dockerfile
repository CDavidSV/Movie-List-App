FROM node:20-alpine as build-step

WORKDIR /app

COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build-step /app/dist/ /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]