# ⚡ ChatBot For Jobsity

- Dependencies
[Node.js](https://nodejs.org/),
[Docker](https://www.docker.com/)

## Features
* TypeScript for the 3 projects
* Standardized model for all projects
* Docker Rabbit MQ easy to configure for all platforms
* WebSocket communication with [Socket.io](https://socket.io/)
* frontend Based on [Material Angular](https://material.angular.io/)
* when reconnect to page it will send it back all saved messages
* multiples channels



## Make it Run

## install rabitMQ on Docker run this command on terminal or Windows CMD
```
docker run -d -p 5672:5672 -p 15672:15672  --name newDocker rabbitmq:management

```

## 1) websocket server 
```
npm install
npm run build
cd dist
node index.js

```

## 2) Chatbot client 
```
cd decupledBot
npm install
npm run build
cd dist
node index.js

```

## 3) Angular client 
```
cd client
npm install
npm start

```

## TODOs
* connect it to real DB .
* more complex system of authentication .
* unit testing


# now yo can see the project on localhost:4200
