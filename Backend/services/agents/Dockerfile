FROM node

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./services/agents/package*.json ./services/agents/
RUN cd services/agents && npm install

COPY services/agents ./services/agents
COPY shared ./shared

WORKDIR /app/services/agents

EXPOSE 8003

CMD [ "npm","start" ]
