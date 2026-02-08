FROM node:alpine

WORKDIR /app/common
COPY common/package.json common/package-lock.json ./
RUN npm install
COPY common ./
RUN npm run build

WORKDIR /app/expiration
COPY expiration ./
RUN npm install --omit=dev

CMD ["npm", "start"]
