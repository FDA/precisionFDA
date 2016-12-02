class ChallengesController < ApplicationController
  skip_before_action :require_login, {only: [:index, :consistency, :truth, :appathons, :join]}
  before_action :require_login_or_guest, only: []

  def index
    @consistency_challenge = Challenge.consistency(@context)
    @truth_challenge = Challenge.truth(@context)
    @appathons_challenge = Challenge.appathons(@context)

    @challenges = [@appathons_challenge, @truth_challenge, @consistency_challenge]
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

    if @tab == "results-peek" || @tab == "results-explore-peek" || (@truth_challenge[:results_announced] && (@tab == "results" || @tab == "results-explore"))

      grid_params = {
        name: 'truth_results',
        order: 'entry',
        order_direction: 'asc',
        per_page: 50
      }

      if !params.has_key?(:truth_results)
        if params.has_key?(:query_id)
          @saved_query = SavedQuery.find_by_id_and_grid_name(params[:query_id], 'truth_results')
          if !@saved_query.nil?
            params[:truth_results] = JSON.parse(@saved_query.query)["truth_results"]
          else
            redirect_to truth_challenges_path({tab: @tab})
          end
        else
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
      end

      @results_grid = initialize_grid(TruthChallengeResult, grid_params)

      if @tab == "results-explore-peek" || (@truth_challenge[:results_announced] && (@tab == "results-explore"))
        if @context.logged_in_or_guest?
          @new_saved_query = SavedQuery.new({
            query: filter_and_order_state_as_hash(@results_grid).to_json,
            grid_name: @results_grid.name
          })
        end
        @query_list = SavedQuery.list(@results_grid.name, self)
      end
    end
  end

  # Challenge 3 - Appathon in a Box
  def appathons
    redirect_to active_meta_appathon_path
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

  private
  def filter_and_order_state_as_hash(grid)
    {
      grid.name => {
        'f'               => grid.status[:f],
        'order'           => grid.status[:order],
        'order_direction' => grid.status[:order_direction]
      }
    }
  end
end
