#!/usr/bin/env bash
#
# GSRS Database Update Script
# v0.6
#
# Currently, one must edit and insert the appropriate variables below before running
# as well as making sure the AWS CLI is configured:
#    export AWS_ACCESS_KEY_ID=ABCDEF123456
#    export AWS_SECRET_ACCESS_KEY=ABCDEF123456

# Flow:
# Download the latest dump from S3
# Restore dump to a new database
# Create a trigger for user roles assignment

set -o errexit -o pipefail

DUMP_BUCKET="gsrs-database-dumps"

# NEW_DB_HOST="pfda-dev-gsrs-db-mysql.cyy6pahwar0b.us-west-2.rds.amazonaws.com"
# NEW_DB_PORT=3306
# NEW_DB_NAME="ixginas"
# NEW_DB_USER="admin"
# NEW_DB_PASS="INSERT_PASSWORD"

NEW_DB_HOST="127.0.0.1"
NEW_DB_PORT=32900
NEW_DB_NAME="ixginas20231218"
NEW_DB_USER="root"
NEW_DB_PASS="password"

ROLES_TRIGGER=$(cat <<-EOF
delimiter //
CREATE TRIGGER ix_core_userprof_update_roles BEFORE UPDATE ON ix_core_userprof
FOR EACH ROW
BEGIN
  IF NEW.roles_json IS NULL THEN
    SET NEW.roles_json = '["Query","Updater","SuperUpdate","DataEntry","SuperDataEntry"]';
  END IF;
END; //
delimiter ;
EOF
)

# Search the last created dump on S3.
# Replace '&Key' by '&LastModified' if you need to sort by modified time.
search_dump() {
    echo $(aws s3api list-objects-v2 --bucket "$DUMP_BUCKET" \
        --query 'sort_by(Contents, &Key)[-1].Key' --output=text)
}

# Download the last dump from S3.
download_dump() {
    aws s3 cp s3://$DUMP_BUCKET/"$1" "$2"
}

restore_dump() {
    mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS --ssl-mode=DISABLED --execute="CREATE DATABASE $NEW_DB_NAME;"
    # If getting an error here while running on mac, just change "zcat $1" to "zcat < $1"
    zcat "$1" | mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS --ssl-mode=DISABLED $NEW_DB_NAME
}

create_roles_trigger() {
    mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS --ssl-mode=DISABLED $NEW_DB_NAME \
        -e "$ROLES_TRIGGER"
}

cleanup() {
    rm -f "$1" # remove dump archive
    rm -f ix_core_group.sql ix_core_group_principal.sql ix_core_principal.sql ix_core_userprof.sql
}

main() {
    local dump_name=$(search_dump)
    if [ -z "$dump_name" ]; then
        echo "Error obtaining latest dump file name from S3"
        exit 1
    fi

    # local dump_name="gsrsDump2023-12-18_3.1_cdk_src2023-12-14.sql.gz"
    local dump_path="./$dump_name"

    echo
    echo "Latest dump name: $dump_name"
    download_dump "$dump_name" "$dump_path"
    if [ ! -f "$dump_path" ]; then
        echo "Error downloading database dump file"
        exit 1
    fi

    echo
    echo "Restore dump to the new database..."
    restore_dump "$dump_path"

    echo
    echo "Create roles trigger... (may already exist)"
    create_roles_trigger

    # Better to explicitly uncomment this when needing to clean up, because if something went wrong during
    # the upload to s3 step, the following will wipe the ginas.ix folder preventing us from trying again
    # echo
    # echo "Cleanup..."
    # cleanup $dump_path
}

main
