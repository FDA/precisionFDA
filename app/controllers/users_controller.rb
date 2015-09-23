class UsersController < ApplicationController
  def index
    myself = User.find(@context.user_id)
    if myself.org_id.present?
      users = User.where(org_id: myself.org_id)
    else
      users = User.where(id: @context.user_id)
    end
    @users_grid = initialize_grid(users,{
      order: 'dxuser',
      order_direction: 'asc',
      include: :org,
      per_page: 100
    })
  end

  def show
    @user = User.find_by!(dxuser: params[:username])
  end
end
