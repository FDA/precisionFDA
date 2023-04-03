include_recipe("nodejs::nodejs_from_binary")

# Install Yarn and pm2 globally.
npm_package "yarn"
npm_package "pm2"
