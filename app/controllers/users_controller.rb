class UsersController < ApplicationController
  skip_before_action :require_login,     only: [:show]
  before_action :require_login_or_guest, only: [:show]

  def show
    @user = User.find_by!(dxuser: unsafe_params[:username])

    @counts = {
      notes: @user.notes.real_notes.accessible_by_public.order(id: :desc).count,
      discussions: @user.notes.accessible_by_public.discussions.order(id: :desc).count,
      answers: @user.notes.accessible_by_public.answers.order(id: :desc).count,
      files: @user.real_files.accessible_by_public.count,
      comparisons: @user.comparisons.accessible_by_public.count,
      apps: @user.app_series.accessible_by_public.count
    }

    if !unsafe_params.has_key?(:tab)
      if @counts[:notes] > 0
        unsafe_params[:tab] = 'notes'
      elsif @counts[:discussions] > 0
        unsafe_params[:tab] = 'discussions'
      elsif @counts[:answers] > 0
        unsafe_params[:tab] = 'answers'
      elsif @counts[:files] > 0
        unsafe_params[:tab] = 'files'
      elsif @counts[:comparisons] > 0
        unsafe_params[:tab] = 'comparisons'
      elsif @counts[:apps] > 0
        unsafe_params[:tab] = 'apps'
      end
    end

    if unsafe_params[:tab] == 'notes' && @counts[:notes] > 0
      @notes = @user.notes.real_notes.accessible_by_public.order(id: :desc).page unsafe_params[:notes_page]
    elsif unsafe_params[:tab] == 'discussions' && @counts[:discussions] > 0
      @discussions = @user.discussions.accessible_by_public.order(id: :desc).page unsafe_params[:discussions_page]
    elsif unsafe_params[:tab] == 'answers' && @counts[:answers] > 0
      @answers = @user.notes.accessible_by_public.answers.order(id: :desc).page unsafe_params[:answers_page]
    elsif unsafe_params[:tab] == 'files' && @counts[:files] > 0
      @files_grid = initialize_grid(@user.real_files.accessible_by_public.includes(:taggings), {
        name: 'files',
        order: 'created_at',
        order_direction: 'desc',
        per_page: 25,
        include: [:user, {user: :org}, {taggings: :tag}]
      })
    elsif unsafe_params[:tab] == 'comparisons' && @counts[:comparisons] > 0
      @comparisons_grid = initialize_grid(@user.comparisons.accessible_by_public.includes(:taggings), {
        name: 'comparisons',
        order: 'comparisons.id',
        order_direction: 'desc',
        per_page: 25,
        include: [:user, {user: :org}, {taggings: :tag}]
      })
    elsif unsafe_params[:tab] == 'apps' && @counts[:apps] > 0
      @apps_grid = initialize_grid(@user.app_series.accessible_by_public.includes(:latest_version_app, :tags), {
        name: 'apps',
        order: 'apps.created_at',
        order_direction: 'desc',
        per_page: 25,
        include: [{user: :org}, :latest_version_app, {taggings: :tag}]
      })
    end
    js(user_state: @user.user_state)
  end

end
