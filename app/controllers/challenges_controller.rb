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

    @consistency_challenge = Challenge.consistency(@context)

    if DateTime.now.in_time_zone < @consistency_challenge[:end_date].months_ago(2)
      @btn_class = "accessible-btn-success"
    elsif DateTime.now.in_time_zone < @consistency_challenge[:end_date].months_ago(1)
      @btn_class = "accessible-btn-warning"
    else
      @btn_class = "accessible-btn-danger"
    end
  end

  # Challenge 2 - Truth
  def truth
    @discussion = Discussion.find_by(id: TRUTH_DISCUSSION_ID)

    @truth_challenge = Challenge.truth(@context)

    if DateTime.now.in_time_zone < @truth_challenge[:end_date].weeks_ago(2)
      @btn_class = "accessible-btn-success"
    elsif DateTime.now.in_time_zone < @truth_challenge[:end_date].weeks_ago(1)
      @btn_class = "accessible-btn-warning"
    else
      @btn_class = "accessible-btn-danger"
    end

    @tab = params[:tab]
    if @tab == "results-peek"
      if !params.has_key?(:truth_results)
        # "?truth_results[f][type][]=SNP&truth_results[f][subtype][]=*&truth_results[f][subset][]=*&truth_results[f][genotype][]=*"
        params[:truth_results] = {
          f: {
            type: ["SNP"],
            subtype: ["*"],
            subset: ["*"],
            genotype: ["*"]
          }
        }
      end
      @results_grid = initialize_grid(TruthChallengeResult, {
        name: 'truth_results',
        order: 'entry',
        order_direction: 'asc',
        per_page: 50
      })
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
