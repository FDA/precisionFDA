#!/bin/sh

if [ "$RAILS_ENV" = "staging" ] || [ "$RAILS_ENV" = "dev" ] || [ "$RAILS_ENV" = "development" ]; then
  cat > public/robots.txt << 'EOF'
# See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file

User-agent: *
Disallow: /
EOF
else
  cat > public/robots.txt << 'EOF'
# See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file
#
# To ban all spiders from the entire site uncomment the next two lines:
# User-agent: *
# Disallow: /
EOF
fi
