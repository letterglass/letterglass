FROM node:22-alpine as build
RUN apk add g++ make py3-pip

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . /app

RUN yarn install
RUN yarn build

EXPOSE 5001
ENV SERVER_USE_PROXY=0
CMD ["yarn", "start"]
