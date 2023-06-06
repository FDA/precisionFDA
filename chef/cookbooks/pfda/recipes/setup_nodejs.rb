include_recipe("nodejs")

# Install Yarn,pm2 and bower globally.
npm_package "yarn"
npm_package "pm2"
npm_package "bower"
