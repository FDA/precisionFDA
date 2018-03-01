class ChallengesController < ApplicationController
  skip_before_action :require_login, {only: [:index, :consistency, :truth, :appathons, :join, :show]}
  before_action :require_login_or_guest, only: []
  before_action :check_on_challenge_admin, only: %i(new create)
  before_action :find_editable_challenge, only: %i(edit update edit_page save_page announce_result)

  helper_method :app_owners_for_select

  def index
    @consistency_challenge = FixedChallenge.consistency(@context)
    @truth_challenge = FixedChallenge.truth(@context)
    @appathons_challenge = FixedChallenge.appathons(@context)
    @featured_challenges = Challenge.featured(@context)
    @challenges = [@appathons_challenge, @truth_challenge, @consistency_challenge] + challenge_cards
  end

  def new
    @challenge = Challenge.new
  end

  def create
    ActiveRecord::Base.transaction do
      @challenge = Challenge.new(challenge_params)

      if @challenge.save
        @challenge.update_card_image_url!
        redirect_to challenge_path(@challenge)
      else
        render action: :new
        js challenge_params
      end
    end
  end

  def edit
    js card_image_url: @challenge.card_image_url, card_image_id: @challenge.card_image_id
  end

  def update
    ActiveRecord::Base.transaction do
      if @challenge.update(update_challenge_params)
        @challenge.update_card_image_url!
        flash[:success] = "The challenge was updated successfully."
        redirect_to challenge_path(@challenge)
      else
        render action: :edit
        js update_challenge_params
      end
    end
  end

  def announce_result
    @challenge.jobs.find_each do |job|
      job.publish_by_user(User.challenge_bot)
      file_publisher.publish(job.output_files)
    end

    @challenge.status_result_announced!
    flash[:success] = "Result of the challenge was announced successfully."
    redirect_to challenge_path(@challenge)
  end

  def assign_app
    return unless @context.logged_in?

    challenge = Challenge.find_by!(id: params[:id])
    app = App.editable_by(@context).find_by(id: params[:app_id])

    unless challenge.can_assign_specific_app?(@context, app)
      flash[:error] = "This app cannot be assigned to the current challenge."
      redirect_to apps_path
      return
    end

    if app
      if Challenge.add_app_dev(@context, challenge.id, app.id)
        flash[:success] = "Your app '#{app.title}' was successfully assigned to: #{challenge.name}"
      else
        flash.now[:error] = "The specified app could not be assigned to the current challenge: #{challenge.name} due to an internal error."
      end
      redirect_to app_jobs_path(app.dxid)
    else
      flash[:error] = "The specified app was not found and could not be assigned to the current challenge: #{challenge.name}."
      redirect_to apps_path
    end
  end

  def join
    unless @context.logged_in?
      flash[:alert] = "You need to log in or request access before participating in the challenge."
      redirect_to request_access_path
      return
    end

    challenge = Challenge.find_by!(id: params[:id])

    if !challenge.followed_by?(@context.user)
      @context.user.follow(challenge)
      Event::SignedUpForChallenge.create(challenge, @context.user)
      flash[:success] = "You are now following the challenge! If you would like to participate please submit an entry by the deadline."
    else
      flash[:success] = "You are already following the challenge! Remember to submit your entries by the challenge deadline!"
    end
    redirect_to challenge_path(challenge)
  end

  def edit_page
    # Refresh state of resource files, if needed
    User.sync_challenge_bot_files!(@context)

    @resources_grid = initialize_grid(@challenge.challenge_resources, {
      name: 'resources',
      order: 'challenge_resources.created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [:user]
    })

    js challenge: @challenge.slice(:id)
  end

  def save_page
    return if params[:regions].blank?

    @challenge.regions = @challenge.regions.merge(params[:regions])

    if @challenge.save
      render json: { msg: "saved" }
    else
      render json: { errors: @challenge.errors.full_messages.join(", ") }
    end
  end

  def show
    @challenge = Challenge.find_by(id: params[:id])

    if @challenge.nil? || !@challenge.is_viewable?(@context)
      redirect_to challenges_path
      return
    end

    User.sync_challenge_jobs!
    @tab = params[:tab]
    @submissions = Submission.none
    @my_entries = false
    @csv = nil
    @csv_names = nil
    @csv_ids = nil
    @headers = nil
    @keys = nil

    case @tab
    when "submissions"
      @submissions = @challenge.submissions.accessible_by_public
    when "results"
      @submissions = @challenge.submissions.accessible_by_public
      if @challenge.automated?
        @results = @challenge.completed_submissions
        @result_columns = @challenge.output_names
      else
        @csv = CSV.open("#{Rails.root}/app/assets/csvs/treasure_hunt_warm_up_results.csv", encoding: 'bom|utf-8').read
        @vaf_spotter_ids = [8,9,12,20,21,22,23,25,32,34,35,36,37,38,41,49,51,79,81,89,90,96,97,98,104,110,116,120,122,124,143,147,149,150,155,156,157]
        @headers = @csv.shift(7)
        @keys = @headers.map{|c| c.first}
        @csv_ids, @csv_names = @csv.map{|row| row.shift.split(" ", 2)}.map{|id, name| [id.to_i, name.to_s]}.transpose
        # @vaf_submissions is no longer an ActiveRecord relation, careful if you want to use wice_grid
        @vaf_results = @submissions.select{|s| @csv_ids.include?(s.id)}.sort_by{ |s| @csv_ids.index s.id }
      end
    when "my_entries"
      @submissions = @challenge.submissions.editable_by(@context)
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

    @resources_grid = initialize_grid(@challenge.challenge_resources, {
      name: 'resources',
      order: 'challenge_resources.updated_at',
      order_direction: 'desc',
      per_page: 100
    })

    js submissions: @submissions.map{|s| s.slice(:id, :name, :desc)}
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

  private

  def check_on_challenge_admin
    redirect_to challenges_path unless @context.challenge_admin?
  end

  def app_owners_for_select
    @app_owners_candidates = User.not_challenge_bot.map{ |u| [u.select_text, u.id] }
  end

  def find_editable_challenge
    @challenge = Challenge.find(params[:id])

    if @challenge.nil?
      flash[:alert] = "The challenge not found."
      redirect_to challenges_path
    elsif !@challenge.editable_by?(@context)
      flash[:alert] = "You do not have permission to edit this challenge."
      redirect_to challenges_path
    end
  end

  def challenge_params
    p = params.require(:challenge).permit(:name, :description, :app_owner_id, :start_at, :end_at, :status, :regions, :card_image_id)
    p.require(:name)
    p.require(:start_at)
    p.require(:end_at)
    return p
  end

  def update_challenge_params
    p = params.require(:challenge).permit(:name, :description, :app_owner_id, :start_at, :end_at, :status, :card_image_id)
    p.require(:name)
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

  def challenge_cards
    Challenge.archived.all.map do |challenge|
      ChallengeCard.by_context(challenge, @context)
    end
  end

  def file_publisher
    @file_publisher ||= FilePublisher.by_challenge_bot
  end
end
