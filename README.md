
# smart attendance system API

in this project i used fastAPI for backend and that connect with postgres database

### for setup this code in your server run docker-compose file
```
cd smart-attendance-backend
sudo docker-compose up -d
```
### run database.sql file for the database setup

```
sudo docker exec -it <container-id or container-name> /bin/bash
psql -U youruser -d yourdb -f database.sql
```
### create docker images and create container 
```
sudo docker build -t smart-attendance-api:1.0 .
sudo docker run -d -p8000:8000 --env-file .env --name smart-attendance-api 
```
