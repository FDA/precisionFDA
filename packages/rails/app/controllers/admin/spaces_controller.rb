module Admin
  class SpacesController < BaseController
    before_action :check_admin

    layout "react", only: %i(index)

    def index; end
  end
end