FROM node:11-alpine

RUN apk --no-cache add ca-certificates

# Create app directory
WORKDIR /app

COPY package*.json ./

# Install app dependencies
RUN npm install

COPY . /app

# Build react/vue/angular/transpile bundle static files
RUN npm run build

#RUN rm -rf /app/node_modules

# optional
#RUN npm -g install serve
#CMD ["serve", "-s", "build", "-p", "8080"]
#CMD ["node", "server.js"]
CMD ["npm", "start"]
