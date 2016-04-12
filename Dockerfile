FROM node:5.10-wheezy

RUN mkdir /src

RUN npm install nodemon -g
RUN apt-get install curl


WORKDIR /src
CMD npm rabbit
#RUN rabbitmq-plugins enable rabbitmq_management
#RUN npm install

EXPOSE 3000

CMD npm start
