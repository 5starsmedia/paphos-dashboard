FROM node:5.10

COPY docker/crontab /etc/cron.d/paphos-dashboard

RUN mkdir /src && npm install nodemon bower -g && apt-get update && apt-get install cron -y && chmod 0644 /etc/cron.d/paphos-dashboard

COPY ./ /src
WORKDIR /src
RUN npm install && bower install --allow-root

EXPOSE 3000

CMD cron && npm start
