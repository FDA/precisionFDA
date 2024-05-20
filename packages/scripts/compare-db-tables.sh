error_found=0

# Database 1 connection details
DB1_USER="admin"
DB1_PASSWORD="!"
DB1_HOST="0.0.0.0"
DB1_PORT="3306"
DB1_NAME="precision_fda"

# Database 2 connection details
DB2_USER="admin"
DB2_PASSWORD="!"
DB2_HOST="0.0.0.0"
DB2_PORT="3306"
DB2_NAME="precision_fda"

# Get list of tables from both databases, excluding views and skipping the header row
TABLES_DB1=$(mysql -u"$DB1_USER" -p"$DB1_PASSWORD" -h"$DB1_HOST" -P"$DB1_PORT" -D"$DB1_NAME" -e "SELECT table_name FROM information_schema.tables WHERE table_schema = '$DB1_NAME' AND table_type = 'BASE TABLE';" 2>&1 | grep -v "Using a password on the command line interface can be insecure." | tail -n +2)
TABLES_DB2=$(mysql -u"$DB2_USER" -p"$DB2_PASSWORD" -h"$DB2_HOST" -P"$DB2_PORT" -D"$DB2_NAME" -e "SELECT table_name FROM information_schema.tables WHERE table_schema = '$DB2_NAME' AND table_type = 'BASE TABLE';" 2>&1 | grep -v "Using a password on the command line interface can be insecure." | tail -n +2)
# Compare tables and row counts
for TABLE in $TABLES_DB1; do
    if echo "$TABLES_DB2" | grep -wq "$TABLE"; then
        COUNT_DB1=$(mysql -u"$DB1_USER" -p"$DB1_PASSWORD" -h"$DB1_HOST" -P"$DB1_PORT" -D"$DB1_NAME" -e "SELECT COUNT(*) FROM \`$TABLE\`;" 2>&1 | grep -v "Using a password on the command line interface can be insecure." | tail -n +2 | awk '{print $1}')
        COUNT_DB2=$(mysql -u"$DB2_USER" -p"$DB2_PASSWORD" -h"$DB2_HOST" -P"$DB2_PORT" -D"$DB2_NAME" -e "SELECT COUNT(*) FROM \`$TABLE\`;" 2>&1 | grep -v "Using a password on the command line interface can be insecure." | tail -n +2 | awk '{print $1}')
        if [ "$COUNT_DB1" == "$COUNT_DB2" ]; then
            echo "Table $TABLE matches: $COUNT_DB1 rows."
        else
            printf "\033[0;31mTable %s does not match: %s has %s rows, %s has %s rows.\033[0m\n" "$TABLE" "$DB1_HOST" "$COUNT_DB1" "$DB2_HOST" "$COUNT_DB2"
            error_found=1
        fi
    else
        printf "\033[0;31mTable %s exists in %s but not in %s.\033[0m\n" "$TABLE" "$DB1_HOST" "$DB2_HOST"
        error_found=1
    fi
done

# Check for tables in DB2 that are not in DB1
for TABLE in $TABLES_DB2; do
    if ! echo "$TABLES_DB1" | grep -wq "$TABLE"; then
        printf "\033[0;31mTable %s exists in %s but not in %s.\033[0m\n" "$TABLE" "$DB2_HOST" "$DB1_HOST"
        error_found=1
    fi
done

# Result message
if [ $error_found -eq 0 ]; then
    echo "Success - everything matches."
else
    echo -e "\033[0;31mError - see details above.\033[0m"
fi
