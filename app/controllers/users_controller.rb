class UsersController < ApplicationController
  def index
    @users_grid = initialize_grid(User,
      order: 'dxuser',
      order_direction: 'asc',
      per_page: 100
    )
  end

  def show
    @user = User.find_by("dxuser = ?", params[:username])
  end
end
