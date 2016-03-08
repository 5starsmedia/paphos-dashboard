# paphos-forms

Dashboard - панели, в которую можно добавлять сервисы, дашборды может создавать только владелец сервера через консоль на сервере
Service - Сторонний сервис, который можно подключить на дашборды

# CLI
## Create dashboard
node api/cli.js add-dashboard http://test.bs

## Install nginx config
ln -fv nginx/development.conf /usr/local/etc/nginx/servers

## Run nginx when login (MacOS)
ln -sfv /usr/local/opt/nginx/*.plist ~/Library/LaunchAgents