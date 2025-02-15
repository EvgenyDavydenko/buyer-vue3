# vue3-project for laravel buyer

## Фронтенд для тестирования работы приватного канала веб сокетов

перейти в домашнюю директорию веб сервера nginx

``` cd /var/www ```

склонировать проект

``` git clone https://github.com/EvgenyDavydenko/buyer-vue3 ```

назначить nodejs владельцем директории проекта

``` chown -R 1000:1000 buyer-vue3/ ```

дать разрешение гиту для обновления проект через git pull

``` git config --global --add safe.directory /var/www/buyer-vue3 ```

зайдем в корневую директорию проекта

``` cd buyer-vue3/ ```

создать файл с переменными окружения

``` cp .env.example .env ```

скомпилировать проект через запуск контейнера

``` docker compose up -d ```

после компиляции проекта контейнер можно остановить

``` docker compose down ```

настроить веб сервер что бы он смотрел на фронт контроллер скомпилированного проекта
```
server {
    server_name foreign-buyer.ru;
    root /var/www/buyer-vue3/dist;
    index index.html;
}
```