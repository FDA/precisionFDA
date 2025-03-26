STAGE ?= staging
RESOURCES_HOME:="./resources/home/dnanexus"
ENCRYPTION_KEY:="${RESOURCES_HOME}/encryption_password"

get-encryption-key:
	aws ssm get-parameter --name /pfda/${STAGE}/app/environment/DBCLUSTER_SYNCHRONIZATION_APP_ENCRYPTION_KEY --with-decryption --region us-east-1 | jq -r '.Parameter.Value' > ${ENCRYPTION_KEY}

applet: get-encryption-key
applet:
	dx build -f .

app-staging: get-encryption-key
app-staging:
	dx build . --app --publish --bill-to org-pfda_https_app

app-production: STAGE = production
app-production: get-encryption-key
app-production:
	dx build . --app --publish --bill-to org-pfda_apps