FROM node:20-alpine

#create a working directory
WORKDIR /app

#Install app dependencies
COPY package.json ./

#Run NPM Install
RUN npm install

#Bundle app source
COPY . .

EXPOSE 8000

CMD [ "npm", "run", "dev" ]

