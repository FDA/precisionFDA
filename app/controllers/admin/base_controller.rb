module Admin
  class BaseController < ApplicationController
    before_action :check_admin

    def check_admin
      return if current_context.can_administer_site?

      head :forbidden
    end
  end
end
