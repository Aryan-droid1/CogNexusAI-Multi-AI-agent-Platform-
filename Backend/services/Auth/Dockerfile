FROM node

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./services/Auth/package*.json ./services/Auth/
RUN cd services/Auth && npm install

COPY services/Auth ./services/Auth
COPY shared ./shared

WORKDIR /app/services/Auth

EXPOSE 8001

CMD [ "npm","start" ]
