module Admin
  class BaseController < ApplicationController
    layout "react", only: %i(alerts index)
    before_action :check_admin

    def check_admin
      redirect_to root_path unless current_context.can_administer_site?
    end

    def index; end

    def alerts; end

  end
end
