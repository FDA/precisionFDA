#!/usr/bin/env bash
#
# GSRS Database Update Script 
# v0.5
#
# This should be run on an instance such as m5.4xlarge to have sufficient memory
# Currently, one must edit and insert the appropriate variables below before running
# as well as making sure the AWS CLI is configured:
#    export AWS_ACCESS_KEY_ID=ABCDEF123456
#    export AWS_SECRET_ACCESS_KEY=ABCDEF123456
#    export AWS_DEFAULT_REGION=us-west-2


# Flow:
# Download the latest dump from S3
# Restore dump to a new database
# Migrate users, roles and groups
# Create a trigger for user roles assignment
# Run GSRS locally
# Run GSRS Jobs:
#  - Regenerate structure properties
#  - Resave all backups
#  - Create indexes for substances
# Upload indexes to S3
# Re-deploy GSRS with the new database connection (manual step)

set -o errexit -o pipefail

DUMP_BUCKET="gsrs-database-dumps"

# gsrs-indexes-dev
# gsrs-indexes-staging
# gsrs-indexes-production
GSRS_INDEXES_BUCKET="gsrs-indexes-staging"

# If OLD_DB_HOST is not set, the new database will still receive the database
# dump but user roles will not be transferred
# OLD_DB_HOST="pfda-dev-gsrs-db.cyy6pahwar0b.us-west-2.rds.amazonaws.com"
# OLD_DB_PORT=3306
# OLD_DB_NAME="ixginas"
# OLD_DB_USER="admin"
# OLD_DB_PASS="INSERT_PASSWORD"

# NEW_DB_HOST="pfda-dev-gsrs-db-mysql.cyy6pahwar0b.us-west-2.rds.amazonaws.com"
# NEW_DB_PORT=3306
# NEW_DB_NAME="ixginas"
# NEW_DB_USER="admin"
# NEW_DB_PASS="INSERT_PASSWORD"
NEW_DB_HOST="pfda-staging-gsrs-db-mysql.cyy6pahwar0b.us-west-2.rds.amazonaws.com"
NEW_DB_PORT=3306
NEW_DB_NAME="ixginas"
NEW_DB_USER="admin"
NEW_DB_PASS="INSERT_PASSWORD"

ROLES_TRIGGER=$(cat <<-EOF
delimiter //
CREATE TRIGGER ix_core_userprof_update_roles BEFORE INSERT ON ix_core_userprof
FOR EACH ROW
BEGIN
  IF NEW.roles_json IS NULL THEN
    SET NEW.roles_json = '["Query","Updater","SuperUpdate","DataEntry","SuperDataEntry"]';
  END IF;
END; //
delimiter ;
EOF
)

GINAS_CONF=$(cat <<-EOF
include "ginas.conf"

## START AUTHENTICATION
# SSO HTTP proxy authentication settings - right now this is only used by FDA
ix.authentication.trustheader=true
ix.authentication.usernameheader="AUTHENTICATION_HEADER_NAME"
ix.authentication.useremailheader="AUTHENTICATION_HEADER_NAME_EMAIL"

# set this "false" to only allow authenticated users to see the application
ix.authentication.allownonauthenticated=true

# set this "true" to allow any user that authenticates to be registered
# as a user automatically
ix.authentication.autoregister=true

#Set this to "true" to allow autoregistered users to be active as well
ix.authentication.autoregisteractive=true
## END AUTHENTICATION

## START MySQL
db.default.driver="com.mysql.jdbc.Driver"
db.default.url="jdbc:mysql://$NEW_DB_HOST:$NEW_DB_PORT/$NEW_DB_NAME"
db.default.user="$NEW_DB_USER"
db.default.password="$NEW_DB_PASS"
## END MySQL
EOF
)

GSRS_BRANCH="precisionFDA_PROD"
GSRS_URL="https://github.com/dnanexus/gsrs-play-dist.git"
GSRS_PORT=9001
GSRS_PATH=./gsrs-play-dist

install_deps() {
  sudo apt -y install jq
}

# Search the last created dump on S3.
# Replace '&Key' by '&LastModified' if you need to sort by modified time.
search_dump() {
  echo `aws s3api list-objects-v2 --bucket "$DUMP_BUCKET" \
        --query 'sort_by(Contents, &Key)[-1].Key' --output=text`
}

# Download the last dump from S3.
download_dump() {
  aws s3 cp s3://$DUMP_BUCKET/$1 $2
}

restore_dump() {
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS --execute="CREATE DATABASE $NEW_DB_NAME;"
  zcat $1 | mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS $NEW_DB_NAME
}

dump_users_and_roles() {
  mysqldump -h $OLD_DB_HOST -u $OLD_DB_USER -p$OLD_DB_PASS -P $OLD_DB_PORT --skip-opt \
            --skip-tz-utc --no-create-info --extended-insert=FALSE --set-gtid-purged=OFF $OLD_DB_NAME ix_core_principal \
            --where="ID > 10000" > ix_core_principal.sql
  mysqldump -h $OLD_DB_HOST -u $OLD_DB_USER -p$OLD_DB_PASS -P $OLD_DB_PORT --skip-opt \
            --skip-triggers --skip-tz-utc --no-create-info --extended-insert=FALSE --set-gtid-purged=OFF $OLD_DB_NAME ix_core_userprof \
            --where="ID > 10000" > ix_core_userprof.sql
  mysqldump -h $OLD_DB_HOST -u $OLD_DB_USER -p$OLD_DB_PASS -P $OLD_DB_PORT --skip-opt \
            --add-drop-table --skip-tz-utc --set-gtid-purged=OFF $OLD_DB_NAME \
            ix_core_group_principal > ix_core_group_principal.sql
  mysqldump -h $OLD_DB_HOST -u $OLD_DB_USER -p$OLD_DB_PASS -P $OLD_DB_PORT --skip-opt \
            --add-drop-table --skip-tz-utc --set-gtid-purged=OFF $OLD_DB_NAME ix_core_group > ix_core_group.sql
}

# this will fail if the dump has anyone else rather than admin.
restore_users_and_roles() {
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER \
        -p$NEW_DB_PASS $NEW_DB_NAME < ix_core_principal.sql
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER \
        -p$NEW_DB_PASS $NEW_DB_NAME < ix_core_userprof.sql
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER \
        -p$NEW_DB_PASS $NEW_DB_NAME < ix_core_group.sql
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER \
        -p$NEW_DB_PASS $NEW_DB_NAME < ix_core_group_principal.sql
}

create_roles_trigger() {
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS $NEW_DB_NAME \
        -e "$ROLES_TRIGGER"
}

run_gsrs() {
  if [ ! -d "$GSRS_PATH" ] ; then
    git clone --depth 1 -b $GSRS_BRANCH $GSRS_URL $GSRS_PATH
  fi

  cd $GSRS_PATH
  echo "$GINAS_CONF" > conf/ginas-dev.conf
  chmod +x bin/ginas
  # N.B. need 32GB heap for GSRS jobs can be VERY memory intensive (16GB might be ok but 8GB fails)
  bin/ginas -J-Xmx32G -Dconfig.file=conf/ginas-dev.conf -Dhttp.port=$GSRS_PORT \
            -Djava.awt.headless=true -Dpidfile.path=/dev/null > gsrs.out 2>&1 &
  cd -

  echo "Wait until GSRS runs.."
  while true ; do
    if curl localhost:$GSRS_PORT/ginas/app/api/v1/whoami > /dev/null 2>&1  ; then
      break
    fi
    sleep 2
  done
}

shutdown_gsrs() {
  kill `ps -eaf | \
        grep 'gsrs-play-dist' | \
        grep -v grep | \
        awk '{print $2}'` \
  > /dev/null 2>&1 \
  || true
}

# Reindex all core entities from backup tables
run_job() {
  echo $1

  local job=$(
    curl -s localhost:$GSRS_PORT/ginas/app/api/v1/scheduledjobs -H "AUTHENTICATION_HEADER_NAME: admin" |
    jq ".content[] | select(.description==\"$1\")"
  )

  if [ -z "$job" ]; then
    echo "ERROR: can't find the job with description: $1"
    exit 1
  fi

  local job_url=`echo $job | jq '.url' | sed 's/\(http:\/\/\|"\)//g'`
  local job_execute_url=`echo $job | jq '.["@execute"]' | sed 's/\(http:\/\/\|"\)//g'`

  echo "Run the job via $job_execute_url"
  local run_result=$(curl -s "$job_execute_url" -H "AUTHENTICATION_HEADER_NAME: admin")

  echo "Waiting for the job to be finished..."
  local is_running
  local task_message

  sleep 3

  while true ; do
    job=$(curl -s -H "AUTHENTICATION_HEADER_NAME: admin" $job_url)
    is_running=`echo $job | jq '.running'`

    if [[ $is_running == "false" ]] ; then
      break
    fi

    task_message=`echo $job | jq '.taskDetails.message'`
    echo "$task_message"

    sleep 5
  done
}

upload_indexes() {
  if [[ -d "$GSRS_PATH/ginas.ix" ]]; then
    aws s3 rm s3://$GSRS_INDEXES_BUCKET/ginas.ix --recursive
    aws s3 cp $GSRS_PATH/ginas.ix s3://$GSRS_INDEXES_BUCKET/ginas.ix --recursive
  fi
}

cleanup() {
  rm -rf $GSRS_PATH/ginas.ix # remove gsrs
  rm -f $1 # remove dump archive
  rm -f ix_core_group.sql ix_core_group_principal.sql ix_core_principal.sql ix_core_userprof.sql
}

main() {
  install_deps

  local dump_name=$(search_dump)
  if [ -z $dump_name ]; then
    echo "Error obtaining latest dump file name from S3"
    exit 1
  fi

  local dump_path="./$dump_name"
  echo
  echo "Latest dump name: $dump_name"
  download_dump $dump_name $dump_path
  if [ ! -f $dump_path ]; then
    echo "Error downloading database dump file"
    exit 1
  fi

  echo
  echo "Restore dump to the new database..."
  restore_dump $dump_path
  if [ ! -z $OLD_DB_HOST ]
  then
    echo "Dump users, roles and groups..."
    dump_users_and_roles
    echo "Restore users, roles and groups to the new database..."
    restore_users_and_roles
  else
    echo "\$OLD_DB_HOST not set, skipping user roles transfer"
  fi

  echo
  echo "Create roles trigger..."
  create_roles_trigger

  echo
  echo "Run GSRS..."
  run_gsrs

  echo
  run_job "Regenerate structure properties collection for all chemicals in the database"
  sleep 10
  echo
  run_job "Resave all backups of type ix.ginas.models.v1.Substance to the database backups."
  sleep 10
  echo
  run_job "Reindex all core entities from backup tables"
  sleep 10 # we should wait some time until the indexes creation process will be completely finished
  echo
  upload_indexes
  sleep 5 # wait before starting shutdown and cleanup
  echo
  echo "Shutdown GSRS..."
  shutdown_gsrs
  sleep 5

  # Better to explicitly uncomment this when needing to clean up, because if something went wrong during
  # the upload to s3 step, the following will wipe the ginas.ix folder preventing us from trying again
  # echo
  # echo "Cleanup..."
  # cleanup $dump_path
}

main
