#!/usr/bin/env bash

MYSQL_USER=root

ROLES_TRIGGER=$(cat <<-EOF
delimiter //
CREATE TRIGGER ix_core_userprof_update_roles BEFORE INSERT ON ix_core_userprof
FOR EACH ROW
BEGIN
  IF NEW.roles_json IS NULL THEN
    SET NEW.roles_json = '["Query", "Updater", "DataEntry"]';
  END IF;
END; //
delimiter ;
EOF
)

# wait for database to start
while ! mysqladmin ping -u $MYSQL_USER -h $MYSQL_HOST --silent; do
  echo "wait for db.."
  sleep 1
done

# init database
if [ ! $(mysql -u $MYSQL_USER -h $MYSQL_HOST -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE -sse "SHOW tables like 'ix_core_userprof';") ]; then
  chmod +x bin/evolutions.sh
  bin/evolutions.sh "$GSRS_CONFIG"
  mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE -e "$ROLES_TRIGGER"
fi

# run GSRS
bin/ginas -J-Xmx4G -Dconfig.file=$GSRS_CONFIG -Dhttp.port=$GSRS_PORT -Djava.awt.headless=true -Dpidfile.path=/dev/null
