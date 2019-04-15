module Admin
  class DashboardController < BaseController

    def index
      @users = User.all
      @users_grid = initialize_grid(@users, per_page: 100)
    end

  end
end

