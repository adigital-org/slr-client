# Dockerfile for a SimpleApiSimulator container listening at port 80.
# Check Readme for usage.
FROM ubuntu:latest

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends apache2 php && \
apt-get -yq autoremove && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY SimpleApiSimulator.php .htaccess docker.setup.sh /var/www/html/
RUN chmod 500 /var/www/html/docker.setup.sh && /var/www/html/docker.setup.sh

EXPOSE 80

CMD ["/usr/sbin/apachectl", "-D", "FOREGROUND"]