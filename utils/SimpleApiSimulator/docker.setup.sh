#!/bin/bash

CONF_NAME="allow-override"
echo "$(cat << 'EOF'
<Directory "/var/www/html">
  AllowOverride all
</Directory>
EOF
)" > /etc/apache2/conf-available/$CONF_NAME.conf

ln -sf /dev/stdout /var/log/apache2/access.log
ln -sf /dev/stderr /var/log/apache2/error.log

a2enmod rewrite
a2enconf $CONF_NAME

echo "error_log = /dev/stderr" >> /etc/php/*.*/apache2/php.ini

rm /var/www/html/docker.setup.sh