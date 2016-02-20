class ChallengesController < ApplicationController
  skip_before_action :require_login, {only: [:consistency]}

  skip_before_action :require_login,     only: []
  before_action :require_login_or_guest, only: []

  def consistency
    @discussion = {
      id: 1
    }

    @challengedEndDate = DateTime.new(2016,4,25).in_time_zone.end_of_day

    @challenge = {
      active: DateTime.now.in_time_zone < @challengedEndDate,
      joined: false
    }

    if DateTime.now.in_time_zone < @challengedEndDate.months_ago(2)
      @btn_class = "accessible-btn-success"
    elsif DateTime.now.in_time_zone < @challengedEndDate.months_ago(1)
      @btn_class = "accessible-btn-warning"
    else
      @btn_class = "accessible-btn-danger"
    end
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
