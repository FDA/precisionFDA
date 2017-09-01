class ChallengesController < ApplicationController
  skip_before_action :require_login, {only: [:index, :consistency, :truth, :appathons, :join, :show]}
  before_action :require_login_or_guest, only: []

  def new
    if !@context.logged_in? || !@context.user.can_administer_site?
      redirect_to challenges_path
      return
    end

    @users = User.all.map{|u| ["#{u.select_text}", u.id]}
    @challenge = Challenge.new
  end

  def assign_app
    challenge = Challenge.current
    if @context.logged_in? && challenge.app_owner == @context.user
      app = App.editable_by(@context).find_by(id: params[:app_id])
      if app
        Challenge.add_app_dev(@context, challenge.id, app.id)
        flash[:success] = "Your app '#{app.title}' was succssfully assigned to: #{challenge.name}"
      else
        flash[:error] = "The specified app was not found and could not be assigned to the current challenge: #{challenge.name}."
      end
    end
    redirect_to app_jobs_path(app.dxid)
    return
  end

  def create
    if @context.logged_in? && @context.user.can_administer_site?
      @challenge = Challenge.provision(@context, challenge_params)
      if @challenge.persisted?
        redirect_to challenge_path(@challenge)
        return
      else
        flash.now[:error] = "The challenge could not be provisioned for an unknown reason."
        render :new
      end
    else
      redirect_to challenges_path
      return
    end
  end

  def edit
    @challenge = Challenge.find(params[:id])
    if @challenge.nil?
      @challenge = Challenge.current
    end

    if !@challenge.editable_by?(@context)
      redirect_to challenge_path(@challenge)
      return
    end

    @users = User.all.map{|u| ["#{u.select_text}", u.id]}
  end

  def update
    @challenge = Challenge.find(params[:id])
    if @challenge.nil?
      @challenge = Challenge.current
    end

    if @challenge.editable_by?(@context)
      Challenge.transaction do
        if @challenge.update(challenge_params)
          flash[:success] = "The challenge was edited successfully."
        else
          flash[:error] = "The challenge could not be edited for an unknown reason."
        end
      end
    end
    redirect_to challenge_path(@challenge)
    return
  end

  def show
    @challenge = Challenge.find(params[:id])
    if @challenge.nil?
      @challenge = Challenge.current
    end

    @tab = params[:tab]
    @submissions = nil
    @my_entries = false

    case @tab
    when "submissions", "results"
      @submissions = Submission.accessible_by_public
    when "my_entries"
      @submissions = Submission.editable_by(@context)
      @my_entries = true
    else
      return
    end

    @submissions_grid = initialize_grid(@submissions, {
      name: 'submissions',
      order: 'submissions.id',
      order_direction: 'desc',
      per_page: 100
    })

    User.sync_challenge_jobs!

    js submissions: @submissions.map{|s| s.slice(:id, :name, :desc)}
  end

  def index
    @consistency_challenge = FixedChallenge.consistency(@context)
    @truth_challenge = FixedChallenge.truth(@context)
    @appathons_challenge = FixedChallenge.appathons(@context)
    @challenge = Challenge.last
    @challenges = [@appathons_challenge, @truth_challenge, @consistency_challenge]
  end

  # Challenge 1 - Consistency
  def consistency
    @discussion = Discussion.find_by(id: CONSISTENCY_DISCUSSION_ID)

    @consistency_challenge = FixedChallenge.consistency(@context)

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

    @truth_challenge = FixedChallenge.truth(@context)

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

  # TODO: may need to change this for future appathons
  # Challenge 3 - Appathon in a Box
  def appathons
    @discussion = Discussion.find_by(id: APPATHON_IN_A_BOX_DISCUSSION_ID)
    redirect_to active_meta_appathon_path
  end

  def join
    if @context.logged_in?
      challenge = Challenge.find(params[:id])
      if !challenge.followed_by?(@context.user)
        @context.user.follow(challenge)
        flash[:success] = "You are now following the challenge! If you would like to participate please submit an entry by the deadline."
      end
      redirect_to challenge_path(challenge)
    else
      flash[:alert] = "You need to log in or request access before participating in the challenge."
      redirect_to request_access_path
    end
  end

  private
  def challenge_params
    p = params.require(:challenge).permit(:name, :description, :admin_id, :app_owner_id, :start_at, :end_at)
    p.require(:name)
    p.require(:admin_id)
    p.require(:app_owner_id)
    p.require(:start_at)
    p.require(:end_at)
    return p
  end

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
