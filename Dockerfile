FROM node:5.10-wheezy

RUN mkdir /src

RUN npm install nodemon -g
RUN apt-get install curl

COPY ./ /src
CMD npm rabbit
RUN npm install

EXPOSE 3000

CMD npm start
