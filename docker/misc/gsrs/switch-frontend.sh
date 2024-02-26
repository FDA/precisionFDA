echo "Enter [1] to use frontend from your local source code (instant rebuilt on code change)"
echo "Enter [2] to use pre-built frontend"

read choice

if [[ $choice -eq 1 ]]
then
  oldPwd=$(pwd)
  cd /usr/local/GSRSFrontend
  bash /usr/local/GSRSFrontend/build.sh
  npm install webpack
  sed -i 's$http://localhost:8080/frontend/ginas/app/beta$http://localhost:4200/ginas/app/beta$g' /usr/local/tomcat/webapps/ROOT/WEB-INF/classes/application.yml
  /usr/local/tomcat/bin/catalina.sh stop && rm -rf /usr/local/tomcat/work
  /usr/local/tomcat/bin/catalina.sh start
  npm run start:fda:local &
  cd $oldPwd
elif [[ $choice -eq 2 ]]
then
  sed -i 's$http://localhost:4200/ginas/app/beta$http://localhost:8080/frontend/ginas/app/beta$g' /usr/local/tomcat/webapps/ROOT/WEB-INF/classes/application.yml
  /usr/local/tomcat/bin/catalina.sh stop && rm -rf /usr/local/tomcat/work
  /usr/local/tomcat/bin/catalina.sh start
else
  echo "Invalid option. Not doing anything."
fi


