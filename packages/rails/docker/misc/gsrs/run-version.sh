rm -rf /gsrs-to-deploy
mkdir /gsrs-to-deploy
cd /gsrs-to-deploy

echo "Paste the name of branch from gsrs-play-dist repo you wish to run:"
read branch_name

git clone -b $branch_name https://github.com/dnanexus/gsrs-play-dist.git

cd gsrs-play-dist
cp -rf /gsrs-conf/substances_application.conf substances/WEB-INF/classes/application.conf
cp -rf /gsrs-conf/gateway_application.yml ROOT/WEB-INF/classes/application.yml
cp -rf /gsrs-conf/frontend_application.conf frontend/WEB-INF/classes/static/assets/data/config.json

/usr/local/tomcat/bin/catalina.sh stop && rm -rf /usr/local/tomcat/work

rm -rf /usr/local/tomcat/webapps/*
cp -rf /gsrs-to-deploy/gsrs-play-dist/* /usr/local/tomcat/webapps/

/usr/local/tomcat/bin/catalina.sh start

echo -e "\nGSRS version updated, tomcat restarted\n"
