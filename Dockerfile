FROM library/node:9.3

RUN mkdir /catchfeeling
WORKDIR /catchfeeling

COPY package.json package-lock.json ./
RUN npm install

COPY client/* ./client/
COPY server/* ./server/

EXPOSE 9898
ENTRYPOINT [ "node", "server/index.js" ]
