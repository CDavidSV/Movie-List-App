FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm i
RUN npm run build
EXPOSE 8080

# Check config.js file for allowed domains before deciding to run in development mode or production mode
CMD ["npm", "start"]

# for development which uses nodemon and allows for different domains
# CMD ["npm", "run", "dev"]
