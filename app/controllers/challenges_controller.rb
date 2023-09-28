# Challenges controller.
# rubocop:todo Metrics/ClassLength
class ChallengesController < ApplicationController
  skip_before_action :require_login,
                     only: %i(index consistency truth appathons join show treasure_old)
  before_action :require_login_or_guest, only: []
  before_action :check_on_challenge_admin, only: %i(new create)
  before_action :find_editable_challenge, only: %i(edit update edit_page announce_result)
  before_action :check_scope_accessibility, only: %i(create update)
  layout "react", only: %i(index show)

  def index; end

  def new
    @challenge = Challenge.new
    time_zone = ActiveSupport::TimeZone.find_tzinfo(@context.user.time_zone).to_s
    js time_zone: time_zone
  end

  def create
    ActiveRecord::Base.transaction do
      @challenge = Challenge.new(challenge_params)

      if @challenge.save
        @challenge.update_card_image_url!
        @challenge.provision_space!(
          @context,
          challenge_params[:host_lead_dxuser],
          challenge_params[:guest_lead_dxuser],
        )
        redirect_to challenge_path(@challenge)
      else
        js challenge_params.to_h
        render action: :new
      end
    end
  end

  def edit
    time_zone = ActiveSupport::TimeZone.find_tzinfo(@context.user.time_zone).to_s
    js card_image_url: @challenge.card_image_url, card_image_id: @challenge.card_image_id, time_zone: time_zone
  end

  def update
    ActiveRecord::Base.transaction do
      if @challenge.update(update_challenge_params)
        @challenge.update_card_image_url!
        @challenge.update_order(challenge_params["replacement_id"])

        unless @challenge.space
          @challenge.provision_space!(
            @context,
            challenge_params[:host_lead_dxuser],
            challenge_params[:guest_lead_dxuser],
          )
        end

        flash[:success] = "The challenge was updated successfully."
        redirect_to challenge_path(@challenge)
      else
        time_zone = ActiveSupport::TimeZone.find_tzinfo(@context.user.time_zone).to_s
        js update_challenge_params.to_h, time_zone: time_zone
        render action: :edit
      end
    end
  end

  # rubocop:todo Metrics/MethodLength
  def show
    @challenge = Challenge.find(params[:id])

    unless @challenge.accessible_by?(@context)
      redirect_to challenges_path, alert: "You don't have permissions to view this challenge"
      return
    end

    @tab = unsafe_params[:tab]
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
      unless @challenge.can_show_results?(@context)
        redirect_to challenges_path
        return
      end

      @submissions = @challenge.submissions.accessible_by_public

      if @challenge.automated?
        @results = @challenge.completed_submissions
        @result_columns = @challenge.output_names
      else
        @csv = CSV.open(
          Rails.root.join("app/assets/csvs/treasure_hunt_warm_up_results.csv"),
          encoding: "bom|utf-8",
        ).read

        @vaf_spotter_ids = [8, 9, 12, 20, 21, 22, 23, 25, 32, 34, 35, 36, 37, 38, 41,
                            49, 51, 79, 81, 89, 90, 96, 97, 98, 104, 110, 116, 120,
                            122, 124, 143, 147, 149, 150, 155, 156, 157]
        @headers = @csv.shift(7)
        @keys = @headers.map(&:first)
        @csv_ids, @csv_names = @csv.map { |row| row.shift.split(" ", 2) }.
          map { |id, name| [id.to_i, name.to_s] }.transpose
        # @vaf_submissions is no longer an ActiveRecord relation,
        #   careful if you want to use wice_grid.
        @vaf_results = @submissions.select { |s| @csv_ids.include?(s.id) }.
          sort_by { |s| @csv_ids.index s.id }
      end
    when "my_entries"
      @submissions = @challenge.submissions.editable_by(@context)
      @my_entries = true
    else
      return
    end

    @submissions_grid = initialize_grid(@submissions,
                                        name: "submissions",
                                        order: "submissions.id",
                                        order_direction: "desc",
                                        per_page: 100)

    @resources_grid = initialize_grid(@challenge.challenge_resources,
                                      name: "resources",
                                      order: "challenge_resources.updated_at",
                                      order_direction: "desc",
                                      per_page: 100)

    js submissions: @submissions.map { |s| s.slice(:id, :name, :desc) }
  end

  # rubocop:todo Metrics/MethodLength
  def treasure_old
    @challenge = Challenge.find_by(name: "Hidden Treasures - Warm Up")

    if @challenge.nil?
      redirect_to challenges_path, alert: "Challenge was not found"
      return
    end

    unless @challenge.accessible_by?(@context)
      redirect_to challenges_path, alert: "You don't have permissions to view this challenge"
      return
    end

    @tab = unsafe_params[:tab]
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
      unless @challenge.can_show_results?(@context)
        redirect_to challenges_path
        return
      end

      @submissions = @challenge.submissions.accessible_by_public
      if @challenge.automated?
        @results = @challenge.completed_submissions
        @result_columns = @challenge.output_names
      else
        @csv = CSV.open(
          Rails.root.join("app/assets/csvs/treasure_hunt_warm_up_results.csv"),
          encoding: "bom|utf-8",
        ).read

        @vaf_spotter_ids = [8, 9, 12, 20, 21, 22, 23, 25, 32, 34, 35, 36, 37, 38, 41,
                            49, 51, 79, 81, 89, 90, 96, 97, 98, 104, 110, 116, 120,
                            122, 124, 143, 147, 149, 150, 155, 156, 157]
        @headers = @csv.shift(7)
        @keys = @headers.map(&:first)
        @csv_ids, @csv_names = @csv.map { |row| row.shift.split(" ", 2) }.
          map { |id, name| [id.to_i, name.to_s] }.transpose
        # @vaf_submissions is no longer an ActiveRecord relation,
        #   careful if you want to use wice_grid.
        @vaf_results = @submissions.select { |s| @csv_ids.include?(s.id) }.
          sort_by { |s| @csv_ids.index s.id }
      end
    when "my_entries"
      @submissions = @challenge.submissions.editable_by(@context)
      @my_entries = true
    else
      return
    end

    @submissions_grid = initialize_grid(@submissions,
                                        name: "submissions",
                                        order: "submissions.id",
                                        order_direction: "desc",
                                        per_page: 100)

    @resources_grid = initialize_grid(@challenge.challenge_resources,
                                      name: "resources",
                                      order: "challenge_resources.updated_at",
                                      order_direction: "desc",
                                      per_page: 100)

    js submissions: @submissions.map { |s| s.slice(:id, :name, :desc) }
  end

  def announce_result
    @challenge.jobs.find_each do |job|
      file_publisher.publish(job.output_files)
    end

    @challenge.status_result_announced!
    flash[:success] = "Result of the challenge was announced successfully."
    redirect_to challenge_path(@challenge)
  end

  def assign_app
    return unless @context.logged_in?

    challenge = Challenge.find_by!(id: unsafe_params[:id])
    app = App.editable_by(@context).find_by(id: unsafe_params[:app_id])

    unless challenge.can_assign_specific_app?(@context, app)
      flash[:error] = "This app cannot be assigned to the current challenge."
      redirect_to apps_path
      return
    end

    if app
      if Challenge.add_app_dev(@context, challenge.id, app.id)
        flash[:success] = "Your app '#{app.title}' was successfully assigned to: #{challenge.name}"
      else
        flash.now[:error] = "The specified app could not be assigned to the current challenge: " \
                            "#{challenge.name} due to an internal error."
      end
      redirect_to app_jobs_path(app)
    else
      flash[:error] = "The specified app was not found and could not be assigned " \
                      "to the current challenge: #{challenge.name}."
      redirect_to apps_path
    end
  end

  def join
    unless @context.logged_in?
      flash[:alert] = "You need to log in or request access before participating in the challenge."
      redirect_to request_access_path
      return
    end

    challenge = Challenge.find_by!(id: unsafe_params[:id])

    if !challenge.followed_by?(@context.user)
      @context.user.follow(challenge)
      Event::SignedUpForChallenge.create_for(challenge, @context.user)
      flash[:success] = "You are now following the challenge! If you would like to participate " \
                        "please submit an entry by the deadline."
    else
      flash[:success] = "You are already following the challenge! Remember to submit your " \
                        "entries by the challenge deadline!"
    end
    redirect_to challenge_path(challenge)
  end

  def edit_page
    @resources_grid = initialize_grid(@challenge.challenge_resources,
                                      name: "resources",
                                      order: "challenge_resources.created_at",
                                      order_direction: "desc",
                                      per_page: 100,
                                      include: [:user])

    js challenge: @challenge.slice(:id)
  end

  # Challenge 1 - Consistency
  def consistency
    @discussion = Discussion.find_by(id: CONSISTENCY_DISCUSSION_ID)

    @consistency_challenge = FixedChallenge.consistency(@context)

    @btn_class = if DateTime.now.in_time_zone < @consistency_challenge[:end_date].months_ago(2)
      "accessible-btn-success"
    elsif DateTime.now.in_time_zone < @consistency_challenge[:end_date].months_ago(1)
      "accessible-btn-warning"
    else
      "accessible-btn-danger"
    end
  end

  # Challenge 2 - Truth
  # rubocop:todo Metrics/MethodLength
  def truth
    @discussion = Discussion.find_by(id: TRUTH_DISCUSSION_ID)

    @truth_challenge = FixedChallenge.truth(@context)

    @btn_class = if DateTime.now.in_time_zone < @truth_challenge[:end_date].weeks_ago(2)
      "accessible-btn-success"
    elsif DateTime.now.in_time_zone < @truth_challenge[:end_date].weeks_ago(1)
      "accessible-btn-warning"
    else
      "accessible-btn-danger"
    end

    @tab = unsafe_params[:tab]

    if %w(results-peek results-explore-peek).include?(@tab) ||
       @truth_challenge[:results_announced] && %w(results results-explore).include?(@tab)

      grid_params = {
        name: "truth_results",
        order: "entry",
        order_direction: "asc",
        per_page: 50,
      }

      unless unsafe_params.key?(:truth_results)
        if unsafe_params.key?(:query_id)
          @saved_query =
            SavedQuery.find_by(id: unsafe_params[:query_id], grid_name: "truth_results")

          if !@saved_query.nil?
            unsafe_params[:truth_results] = JSON.parse(@saved_query.query)["truth_results"]
          else
            redirect_to truth_challenges_path(tab: @tab)
          end
        else
          # ?truth_results[f][type][]=SNP&truth_results[f][subtype][]=*&
          #   truth_results[f][subset][]=*&truth_results[f][genotype][]=*
          unsafe_params[:truth_results] = {
            f: {
              type: %w(SNP),
              subtype: ["*"],
              subset: ["*"],
              genotype: ["*"],
            },
          }
        end
      end

      @results_grid = initialize_grid(TruthChallengeResult, grid_params)

      if @tab == "results-explore-peek" ||
         @truth_challenge[:results_announced] && @tab == "results-explore"
        if @context.logged_in_or_guest?
          @new_saved_query = SavedQuery.new(
            query: filter_and_order_state_as_hash(@results_grid).to_json,
            grid_name: @results_grid.name,
          )
        end
        @query_list = SavedQuery.list(@results_grid.name, self)
      end
    end
  end
  # rubocop:enable Metrics/MethodLength

  # TODO: may need to change this for future appathons
  # Challenge 3 - Appathon in a Box
  def appathons
    @discussion = Discussion.find_by(id: APPATHON_IN_A_BOX_DISCUSSION_ID)
    redirect_to active_meta_appathon_path
  end

  private

  def check_scope_accessibility
    scope = challenge_params[:scope]
    space_id = scope.presence && Space.scope_id(scope)

    return if space_id.nil? ||
              action_name == "update" && @challenge.scope == scope ||
              Space.groups.editable_by(@context).exists?(ActiveRecord::Base.sanitize_sql(space_id))

    action_to_render = action_name == "create" ? :new : :edit

    flash[:error] = "The scope '#{scope}' is not assignable to the challenge."
    render action: action_to_render
  end

  def check_on_challenge_admin
    redirect_to challenges_path unless @context.challenge_admin?
  end

  def find_editable_challenge
    @challenge = Challenge.find(unsafe_params[:id])

    if @challenge.nil?
      flash[:alert] = "The challenge not found."
      redirect_to challenges_path
    elsif !@challenge.editable_by?(@context)
      flash[:alert] = "You do not have permission to edit this challenge."
      redirect_to challenges_path
    end
  end

  def challenge_params
    params.require(:challenge).
      permit(
        :name,
        :description,
        :scope,
        :app_owner_id,
        :start_at,
        :end_at,
        :status,
        :regions,
        :card_image_id,
        :card_image_url,
        :replacement_id,
        :host_lead_dxuser,
        :guest_lead_dxuser,
        :pre_registration_url,
      )
  end

  def update_challenge_params
    params.require(:challenge).
      permit(
        :name,
        :description,
        :scope,
        :app_owner_id,
        :start_at,
        :end_at,
        :status,
        :card_image_id,
        :card_image_url,
        :replacement_id,
        :pre_registration_url,
      )
  end

  def filter_and_order_state_as_hash(grid)
    {
      grid.name => {
        "f" => grid.status[:f],
        "order" => grid.status[:order],
        "order_direction" => grid.status[:order_direction],
      },
    }
  end

  def archived_challenges
    Challenge.accessible_by(@context).archived.map do |challenge|
      ChallengeCard.by_context(challenge, @context)
    end
  end

  def file_publisher
    @file_publisher ||= FilePublisher.by_challenge_bot
  end
end
# rubocop:enable Metrics/ClassLength
