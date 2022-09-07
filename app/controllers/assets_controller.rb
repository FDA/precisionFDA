class AssetsController < ApplicationController
  skip_before_action :require_login
  before_action :require_login_or_guest
end
