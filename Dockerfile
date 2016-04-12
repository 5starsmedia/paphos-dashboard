FROM node:5.9.1-wheezy

# Create app directory
RUN mkdir -p /var/www
WORKDIR /var/www

# Install app dependencies
COPY package.json /var/www/
RUN npm install

# Bundle app source
COPY . /var/www


EXPOSE 4900
CMD [ "npm", "start" ]