class DiscussionsController < ApplicationController
  skip_before_action :require_login, only: %i(index)
  layout "react", only: %i(index)

  def index; end

end
