FROM node:12

WORKDIR /

COPY package.json ./
COPY yarn.lock ./
COPY .babelrc ./

COPY ./src ./src

RUN yarn install

RUN yarn build

RUN rm -rf ./src

EXPOSE 8080
CMD ["node", "./build/index.js"]