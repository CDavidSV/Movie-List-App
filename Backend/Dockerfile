FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm i
RUN npm run build
EXPOSE 8080

# CMD ["npm", "run", "dev"]
CMD ["npm", "start"]