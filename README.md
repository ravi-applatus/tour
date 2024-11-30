## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# Migration

```bash
$ yarn migration:run
```

```bash
$ yarn migration:generate init
```

# Seed

```bash
$ yarn seed:run
```

## Applying tables to entities

```bash
$ npx typeorm-model-generator -h localhost -d tourism -u root -e mysql -x
```

## Installing Redis on CentOS 7

```bash
$ sudo yum install epel-release yum-utils
$ sudo yum install http://rpms.remirepo.net/enterprise/remi-release-7.rpm
$ sudo yum-config-manager --enable remi
$ sudo yum install redis
$ sudo systemctl start redis
$ sudo systemctl enable redis
$ sudo systemctl status redis
```

## Issues

### 1. Problem

```
ReplyError: READONLY You can't write against a read only replica. script: 8f55ae4a3be429c6d38c5d5db3e80edf89197b64, on @user_script:41.
```

### 1. Solution

```
$ redis-cli -h 127.0.0.1 -p 6379 slaveof no one
```

## Apache configuration

```apache
<VirtualHost example.com:80>
        ServerName example.com
        Redirect / https://example.com/
</VirtualHost>

<VirtualHost example.com:443>
    ServerName example.com
    SSLEngine on
    SSLCertificateFile /home/example/ssl/certs/example_...7c53.crt
    SSLCertificateKeyFile /home/example/ssl/keys/a4511_...bde.key
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## Nginx configuration

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  example.com;

		location / {
			proxy_pass http://localhost:3000;
		}
    }


    # SSL
    server {
        listen       443 ssl;
        server_name  example.com;

		ssl_certificate      /home/example/ssl/certs/example_...7c53.crt;
        ssl_certificate_key  /home/example/ssl/keys/a4511_...bde.key;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;

		location / {
			proxy_pass http://localhost:3000;
        }
    }
}
```
