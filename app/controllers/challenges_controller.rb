class ChallengesController < ApplicationController
  skip_before_action :require_login, {only: [:consistency]}

  skip_before_action :require_login,     only: []
  before_action :require_login_or_guest, only: []

  def consistency
    @discussion = {
      id: 1
    }

    @challenge = {
      active: DateTime.now.in_time_zone < DateTime.new(2016,4,25).in_time_zone.end_of_day,
      joined: false
    }
  end

  def join
    discussion_id = params[:id]

    if @context.logged_in?
      # if not following discussion_id
        # follow discussion_id
      # redirect_to discussion
      redirect_to request_access_path
    else
      redirect_to request_access_path
    end
  end
end
