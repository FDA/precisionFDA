module Admin
  class BaseController < ApplicationController
    before_action :check_admin

    def check_admin
      redirect_to root_path unless current_context.can_administer_site?
    end
  end
end
