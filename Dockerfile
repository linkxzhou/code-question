FROM node:16

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY lerna.json ./


COPY packages/code-question/package.json ./packages/code-question/
COPY packages/code-question-indexer/package.json ./packages/code-question-indexer/

RUN yarn

COPY packages packages

RUN yarn lerna run build
