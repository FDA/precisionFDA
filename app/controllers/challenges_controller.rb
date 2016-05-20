class ChallengesController < ApplicationController
  skip_before_action :require_login, {only: [:index, :consistency, :truth, :join]}
  before_action :require_login_or_guest, only: []

  def index
    # TODO: Update when we have a challenge index page
    redirect_to truth_challenges_path
  end

  # Challenge 1 - Consistency
  def consistency
    @discussion = Discussion.find_by(id: CONSISTENCY_DISCUSSION_ID)

    @challengedEndDate = CONSISTENCY_CHALLENGE_END_DATE

    @challenge = {
      launched: !@discussion.nil? && @discussion.public?,
      active: DateTime.now.in_time_zone < CONSISTENCY_CHALLENGE_END_DATE,
      joined: @context.logged_in? && !@discussion.nil? && @discussion.followed_by?(@context.user)
    }

    if DateTime.now.in_time_zone < @challengedEndDate.months_ago(2)
      @btn_class = "accessible-btn-success"
    elsif DateTime.now.in_time_zone < @challengedEndDate.months_ago(1)
      @btn_class = "accessible-btn-warning"
    else
      @btn_class = "accessible-btn-danger"
    end

    @entries, @repro1_order, @repro2_order, @recall_order, @precision_order, @f_measure_order = Challenge.consistency_results
  end

  # Challenge 2 - Truth
  def truth
    @discussion = Discussion.find_by(id: TRUTH_DISCUSSION_ID)

    @challengedEndDate = TRUTH_CHALLENGE_END_DATE

    @challenge = {
      launched: !@discussion.nil? && @discussion.public?,
      active: DateTime.now.in_time_zone < TRUTH_CHALLENGE_END_DATE,
      joined: @context.logged_in? && !@discussion.nil? && @discussion.followed_by?(@context.user)
    }

    if DateTime.now.in_time_zone < @challengedEndDate.weeks_ago(2)
      @btn_class = "accessible-btn-success"
    elsif DateTime.now.in_time_zone < @challengedEndDate.weeks_ago(1)
      @btn_class = "accessible-btn-warning"
    else
      @btn_class = "accessible-btn-danger"
    end
  end

  def join
    if @context.logged_in?
      discussion = Discussion.accessible_by(@context).find(params[:id])
      if !discussion.followed_by?(@context.user)
        @context.user.follow(discussion)
        flash[:success] = "You have joined the challenge! Fill in and publish your response by the deadline."
      end
      redirect_to discussion_path(discussion)
    else
      flash[:alert] = "You need to log in or request access before participating in the challenge."
      redirect_to request_access_path
    end
  end
end
