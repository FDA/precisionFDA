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
GSRS_INDEXES_BUCKET="gsrs-indexes-dev"

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

GINAS_CONF=$(cat <<-EOF
include "substances-core.conf"

application.host="http://localhost:8080"
ix.home="ginas.ix"

spring.application.name="substances"

gsrs.sessions.sessionSecure=false
management.health.rabbit.enabled: false
server.port=8080
server.tomcat.max-threads=2000
ix.ginas.approvalIdGenerator.generatorClass="ix.ginas.utils.UNIIGenerator"
spring.main.allow-bean-definition-overriding=true
eureka.client.enabled=false
gsrs.renderers.selected="USP"


spring.jpa.hibernate.ddl-auto=none  #### THIS IS VERY IMPORTANT, OTHERWISE Hibernate will WIPE OUT our database
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
eureka.client.enabled=false

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

gsrs.entityProcessors +={
               "entityClassName" = "ix.ginas.models.v1.Substance",
               "processor" = "gsrs.module.substance.processors.UniqueCodeGenerator",
               "with"=  {
                        "codesystem"="BDNUM",
                       "suffix"="AB",
                       "length"=9,
                       "padding"=true
               }
        }
gsrs.entityProcessors +=
        {
        "entityClassName" = "ix.ginas.models.v1.Substance",
        "processor" = "gsrs.module.substance.processors.ApprovalIdProcessor",
        "parameters" = {
            "codeSystem" = "FDA UNII"
        }
        }
gsrs.entityProcessors+=
      {
           "entityClassName":"ix.ginas.models.v1.Substance",
           "processor":"gsrs.module.substance.processors.CodeProcessor",
           "with":{
               "class":"gsrs.module.substance.datasource.DefaultCodeSystemUrlGenerator",
               "json":{
                  "filename": "codeSystem.json"
               }
           }
      }

ix.ginas.approvalIdGenerator.generatorClass=ix.ginas.utils.UNIIGenerator
gsrs.validators.substances +=
    {
        "validatorClass" = "fda.gsrs.substance.validators.BdNumModificationValidator",
        "newObjClass" = "ix.ginas.models.v1.Substance"
    }
gsrs.validators.substances +=
    {
        "validatorClass" = "ix.ginas.utils.validation.validators.CodeUniquenessValidator",
                           "newObjClass" = "ix.ginas.models.v1.Substance",
        "configClass" = "SubstanceValidatorConfig",
        "parameters"= {"singletonCodeSystems" =["BDNUM", "CAS", "FDA UNII", "PUBCHEM", "DRUG BANK", "EPA CompTox", "RS_ITEM_NUM", "STARI", "INN", "NCI_THESAURUS", "WIKIPEDIA", "EVMPD", "RXCUI", "ECHA (EC/EINECS)", "FDA ORPHAN DRUG", "EU-Orphan Drug", "NSC", "NCBI TAXONOMY", "ITIS", "ALANWOOD", "EPA PESTICIDE CODE", "CAYMAN", "USDA PLANTS", "PFAF", "MPNS", "GRIN", "DARS", "BIOLOGIC SUBSTANCE CLASSIFICATION CODE", "CERES"]}
    }

# Standardize substance name entries
# Inherited from the long-used Name Standardizer bookmarklet
# Implemented by Mitch Miller
gsrs.validators.substances += {
          "validatorClass" = "ix.ginas.utils.validation.validators.StandardNameValidator",
          "newObjClass" = "ix.ginas.models.v1.Substance",
          "parameters" = {
             "warningOnMismatch" = true
          }
        }
gsrs.scheduled-tasks.list+=
    {
        "scheduledTaskClass" : "gsrs.module.substance.tasks.ScheduledExportTaskInitializer",
        "parameters" :
        {
            "username":"admin",
            "cron":"0 9 2 * * ?", #2:09 AM every day
           #"cron":"0 0/6 * * * ?" #every 6 mins
            "autorun":false,
            "name":"Full GSRS export"
        }
    }
## START MySQL
#spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
spring.jpa.hibernate.use-new-id-generator-mappings=false
spring.datasource.driverClassName="org.mariadb.jdbc.Driver"
spring.datasource.url="jdbc:mariadb://$NEW_DB_HOST:$NEW_DB_PORT/$NEW_DB_NAME"
spring.datasource.username="$NEW_DB_USER"
spring.datasource.password="$NEW_DB_PASS"
spring.datasource.hikari.maximum-pool-size= 500 #maximum pool size
spring.datasource.maximumPoolSize=500
EOF
)

CODE_SYSTEM=$(cat <<-EOF
[
    {"codeSystem":"JMPR-PESTICIDE RESIDUE","url":"http://www.codexalimentarius.net/pestres/data/pesticides/details.html?id=$CODE$"},
    {"codeSystem":"CODEX ALIMENTARIUS (GSFA)","url":"http://www.fao.org/gsfaonline/additives/details.html?id=$CODE$"},
    {"codeSystem":"Food Contact Substance Notif, (FCN No.)","url":"http://www.accessdata.fda.gov/scripts/fcn/fcnDetailNavigation.cfm?rpt=fcslisting&id=$CODE$"},
    {"codeSystem":"JECFA EVALUATION","url":"http://apps.who.int/food-additives-contaminants-jecfa-database/chemical.aspx?chemINS=$CODE$"},
    {"codeSystem":"IUPHAR","url":"http://www.guidetopharmacology.org/GRAC/LigandDisplayForward?ligandId=$CODE$"},
    {"codeSystem":"ALANWOOD","url":"http://www.alanwood.net/pesticides/$CODE$"},
    {"codeSystem":"MERCK INDEX","url":"https://www-rsc-org.fda.idm.oclc.org/Merck-Index/monograph/$CODE$"},
    {"codeSystem":"INN","url":"https://extranet.who.int/soinn/mod/page/view.php?id=137&inn_n=$CODE$"},
    {"codeSystem":"GRIN","url":"https://npgsweb.ars-grin.gov/gringlobal/taxonomydetail.aspx?id=$CODE$"},
    {"codeSystem":"DEA NO.","url":"http://forendex.southernforensic.org/index.php/detail/index/$CODE$"},
    {"codeSystem":"DRUG BANK","url":"http://www.drugbank.ca/drugs/$CODE$"},
    {"codeSystem":"PHAROS","url":"https://pharos.nih.gov/idg/targets/$CODE$"},
    {"codeSystem":"PFAF","url":"http://www.pfaf.org/user/Plant.aspx?LatinName=$CODE$"},
    {"codeSystem":"CAS","url":"https://chem.nlm.nih.gov/chemidplus/rn/$CODE$"},
    {"codeSystem":"ChEMBL","url":"https://www.ebi.ac.uk/chembl/compound/inspect/$CODE$"},
    {"codeSystem":"NDF-RT","url":"https://nciterms.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=VA_NDFRT&code=$CODE$"},
    {"codeSystem":"RXCUI","url":"https://rxnav.nlm.nih.gov/REST/rxcui/$CODE$/allProperties.xml?prop=all"},
    {"codeSystem":"WHO-ATC","url":"http://www.whocc.no/atc_ddd_index/?code=$CODE$&showdescription=yes"},
    {"codeSystem":"CLINICAL_TRIALS.GOV","url":"https://clinicaltrials.gov/ct2/show/$CODE$"},
    {"codeSystem":"ITIS","url":"https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=$CODE$"},
    {"codeSystem":"NCBI TAXONOMY","url":"https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=$CODE$"},
    {"codeSystem":"USDA PLANTS","url":"https://plants.sc.egov.usda.gov/home/plantProfile?symbol=$CODE$"},
    {"codeSystem":"PUBCHEM","url":"https://pubchem.ncbi.nlm.nih.gov/compound/$CODE$"},
    {"codeSystem":"CFR","url":"https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfCFR/CFRSearch.cfm?fr=$CODE$"},
    {"codeSystem":"NCI_THESAURUS","url":"https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI%20Thesaurus&code=$CODE$"},
    {"codeSystem":"MESH","url":"https://www.ncbi.nlm.nih.gov/mesh/$CODE$"},
    {"codeSystem":"UNIPROT","url":"http://www.uniprot.org/uniprot/$CODE$"},
    {"codeSystem":"USP-RS ITEM","url":"https://store.usp.org/product/$CODE$"}
]
EOF
)

GSRS_BRANCH="main"
GSRS_URL="https://github.com/ncats/gsrs3-main-deployment.git"
GSRS_PORT=8080
GSRS_PATH=./gsrs3-main-deployment

install_deps() {
  sudo snap install jq
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
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS --ssl-mode=DISABLED --execute="CREATE DATABASE $NEW_DB_NAME;"
  zcat $1 | mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS --ssl-mode=DISABLED $NEW_DB_NAME
}

dump_users_and_roles() {
  mysqldump -h $OLD_DB_HOST -u $OLD_DB_USER -p$OLD_DB_PASS -P $OLD_DB_PORT --skip-opt \
            --ssl-mode=DISABLED  --column-statistics=0 \
            --skip-tz-utc --no-create-info --extended-insert=FALSE --set-gtid-purged=OFF $OLD_DB_NAME ix_core_principal \
            --where="ID > 10000" > ix_core_principal.sql
  mysqldump -h $OLD_DB_HOST -u $OLD_DB_USER -p$OLD_DB_PASS -P $OLD_DB_PORT --skip-opt \
            --ssl-mode=DISABLED  --column-statistics=0 \
            --skip-triggers --skip-tz-utc --no-create-info --extended-insert=FALSE --set-gtid-purged=OFF $OLD_DB_NAME ix_core_userprof \
            --where="ID > 10000" > ix_core_userprof.sql
  mysqldump -h $OLD_DB_HOST -u $OLD_DB_USER -p$OLD_DB_PASS -P $OLD_DB_PORT --skip-opt \
            --ssl-mode=DISABLED  --column-statistics=0 \
            --add-drop-table --skip-tz-utc --set-gtid-purged=OFF $OLD_DB_NAME \
            ix_core_group_principal > ix_core_group_principal.sql
  mysqldump -h $OLD_DB_HOST -u $OLD_DB_USER -p$OLD_DB_PASS -P $OLD_DB_PORT --skip-opt \
            --ssl-mode=DISABLED  --column-statistics=0 \
            --add-drop-table --skip-tz-utc --set-gtid-purged=OFF $OLD_DB_NAME ix_core_group > ix_core_group.sql
}

# this will fail if the dump has anyone else rather than admin.
restore_users_and_roles() {
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER \
        -p$NEW_DB_PASS --ssl-mode=DISABLED $NEW_DB_NAME < ix_core_principal.sql
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER \
        -p$NEW_DB_PASS --ssl-mode=DISABLED $NEW_DB_NAME < ix_core_userprof.sql
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER \
        -p$NEW_DB_PASS --ssl-mode=DISABLED $NEW_DB_NAME < ix_core_group.sql
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER \
        -p$NEW_DB_PASS --ssl-mode=DISABLED $NEW_DB_NAME < ix_core_group_principal.sql
}

create_roles_trigger() {
  mysql -h $NEW_DB_HOST -P $NEW_DB_PORT -u $NEW_DB_USER -p$NEW_DB_PASS --ssl-mode=DISABLED $NEW_DB_NAME \
        -e "$ROLES_TRIGGER"
}

run_gsrs() {
  if [ ! -d "$GSRS_PATH" ] ; then
    git clone --depth 1 -b $GSRS_BRANCH $GSRS_URL $GSRS_PATH
  fi

  cd $GSRS_PATH/substances
  echo "$GINAS_CONF" > src/main/resources/application.conf
  echo "$CODE_SYSTEM" > src/main/resources/codeSystem.json
  sed -i '' "/\<\/configuration/ i \\
  \                    <jvmArguments>-Xmx25400m-Xms12000m</jvmArguments>\\
  " pom.xml

  chmod +x mvnw
  # N.B. need 32GB heap for GSRS jobs can be VERY memory intensive (16GB might be ok but 8GB fails)
  ./mvnw clean spring-boot:run -DskipTests > gsrs.out 2>&1 &
  cd -

  echo "Wait until GSRS runs.."
  while true ; do
    if curl localhost:$GSRS_PORT/api/v1/whoami > /dev/null 2>&1  ; then
      break
    fi
    sleep 2
  done
}

shutdown_gsrs() {
  kill `ps -eaf | \
        grep 'substances' | \
        grep -v grep | \
        awk '{print $2}'` \
  > /dev/null 2>&1 \
  || true
}

# Reindex all core entities from backup tables
run_job() {
  echo $1

  local job=$(
    curl -s localhost:$GSRS_PORT/api/v1/scheduledjobs -H "AUTHENTICATION_HEADER_NAME: admin" |
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
  if [[ -d "$GSRS_PATH/substances/ginas.ix" ]]; then
    aws s3 rm s3://$GSRS_INDEXES_BUCKET/ginas.ix --recursive
    aws s3 cp $GSRS_PATH/substances/ginas.ix s3://$GSRS_INDEXES_BUCKET/ginas.ix --recursive
  fi
}

cleanup() {
  rm -rf $GSRS_PATH/substances/ginas.ix # remove gsrs
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
  run_job "Regenerate standardized names, force inconsistent standardized names to be regenerated"
  sleep 10
  echo
  run_job "Regenerate structure properties collection for all chemicals in the database"
  sleep 10
  echo
  run_job "Re-backup all Substance entities"
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
