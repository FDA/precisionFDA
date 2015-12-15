class UsersController < ApplicationController
  skip_before_action :require_login,     only: [:show]
  before_action :require_login_or_guest, only: [:show]

  def show
    @user = User.find_by!(dxuser: params[:username])

    @counts = {
      notes: @user.notes.accessible_by_public.order(id: :desc).count,
      files: @user.real_files.accessible_by_public.count,
      comparisons: @user.comparisons.accessible_by_public.count,
      apps: @user.app_series.accessible_by_public.count
    }

    if !params.has_key?(:tab)
      if @counts[:notes] > 0
        params[:tab] = 'notes'
      elsif @counts[:files] > 0
        params[:tab] = 'files'
      elsif @counts[:comparisons] > 0
        params[:tab] = 'comparisons'
      elsif @counts[:apps] > 0
        params[:tab] = 'apps'
      end
    end

    if params[:tab] == 'notes' && @counts[:notes] > 0
      @notes = @user.notes.accessible_by_public.order(id: :desc)
    elsif params[:tab] == 'files' && @counts[:files] > 0
      @files_grid = initialize_grid(@user.real_files.accessible_by_public, {
        name: 'files',
        order: 'user_files.created_at',
        order_direction: 'desc',
        per_page: 25,
        include: [:user, {user: :org}]
      })
    elsif params[:tab] == 'comparisons' && @counts[:comparisons] > 0
      @comparisons_grid = initialize_grid(@user.comparisons.accessible_by_public, {
        name: 'comparisons',
        order: 'comparisons.id',
        order_direction: 'desc',
        per_page: 25,
        include: [:user, {user: :org}]
      })
    elsif params[:tab] == 'apps' && @counts[:apps] > 0
      @apps_grid = initialize_grid(@user.app_series.accessible_by_public.joins(:latest_version_app), {
        name: 'apps',
        order: 'apps.created_at',
        order_direction: 'desc',
        per_page: 25,
        include: [{user: :org}, :latest_version_app]
      })
    end
  end

end
