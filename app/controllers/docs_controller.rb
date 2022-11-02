class DocsController < ApplicationController
  skip_before_action :require_login
  layout "react"
  def index; end
end
