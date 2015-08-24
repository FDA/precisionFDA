#!/bin/bash -el

echo "++++ Setting up RVM"
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -sSL https://get.rvm.io | bash -s stable

echo "++++ Installing ruby 2.2.1"
rvm install ruby-2.2.1
rvm use 2.2.1 --default

# Gem version should be 2.4.6
echo "++++ Installing Bundler 1.10.6"
gem install bundler --version 1.10.6
bundle install
