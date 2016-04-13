FROM node:5.10-wheezy

RUN mkdir /src

RUN npm install nodemon -g
RUN npm install bower -g
RUN apt-get install curl

COPY ./ /src
WORKDIR /src
RUN npm install
RUN bower install --allow-root

EXPOSE 3000

CMD npm start
