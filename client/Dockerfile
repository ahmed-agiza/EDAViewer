FROM node:12
LABEL maintainer="Ahmed Agiza"

WORKDIR /usr/src/app

COPY client/package*.json ./
RUN yarn install

COPY client ./

ENV NODE_ENV production

RUN yarn run build

CMD [ "yarn", "start" ]