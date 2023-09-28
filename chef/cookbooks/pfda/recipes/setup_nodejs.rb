include_recipe("nodejs")

# Install Yarn and pm2 globally.
npm_package "yarn"
npm_package "pm2"
