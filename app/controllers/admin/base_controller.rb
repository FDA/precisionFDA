module Admin
  class BaseController < ApplicationController
    before_action :check_admin

    def check_admin
      return if current_context.can_administer_site?

      redirect_to root_path
    end
  end
end
