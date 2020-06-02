class SpacesController < ApplicationController
  before_action :find_space_and_membership, only: %i(
    discuss feed tasks invite notes assets comparisons reports
  )

  before_action :content_counters, only: %i(
    feed tasks notes assets comparisons reports
  )

  layout "space_content", only: %i(
    feed tasks notes assets comparisons reports
  )

  def index; end

  def discuss
    @associate_with_options = ['Note', 'File', 'App', 'Job', 'Asset', 'Comparison', 'Workflow']
    @items_from_params = [@space]
    @item_path = pathify(@space)
    @item_comments_path = pathify_comments(@space)
    @comments = @space.root_comments.order(id: :desc).page unsafe_params[:comments_page]
    user_ids = @space.space_memberships.active.map(&:user_id)
    users = User.find(user_ids).map { |u| { name: u.dxuser } }
    space_id = @space.to_param
    js users: users, space_id: space_id, space_uid: @space.uid, scopes: @space.accessible_scopes_for_move
  end

  # Used in discuss only.
  def search_content
    space = Space.find(unsafe_params[:id])
    results = space.search_content(unsafe_params[:content_type], unsafe_params[:query])
    render json: results
  end

  # TODO: Move to API.
  def invite
    if @membership
      space_invite_form = SpaceInviteForm.new(space_invite_params.merge(space: @space))

      if space_invite_form.valid?
        api = @membership.persisted? ? @context.api : DNAnexusAPI.for_admin

        begin
          invited_emails = space_invite_form.invite(@membership, api)
        rescue StandardError
          flash[:error] = "An error has occurred during inviting"
        end

        if invited_emails.present?
          flash[:success] = "The invitations to the space have been sent to the following " \
                            "emails: #{invited_emails.to_sentence}"
        end
      else
        flash[:error] = space_invite_form.errors.full_messages.join(", ")
      end
    else
      flash[:error] = "You don't have permission to invite members to this space"
    end

    redirect_back(fallback_location: _space_path(@space))
  end

  # Copies an item from a current confidential space to cooperative one.
  # Used everywhere.
  def copy_to_cooperative
    space = Space.accessible_by(current_user).find(unsafe_params[:id])
    object = item_from_uid(unsafe_params[:object_id])

    if space.editable_by?(current_user) && space.member_in_cooperative?(@context.user_id)
      if object && space.shared_space
        ActiveRecord::Base.transaction do
          copy_service.copy(object, space.shared_space.uid).each do |new_object|
            SpaceEventService.call(
              space.shared_space.id,
              @context.user_id,
              nil,
              new_object,
              "copy_to_cooperative",
            )
          end
        end

        flash[:success] = "#{object.class} successfully copied"
      end
    else
      flash[:warning] = "You have no permission to copy object(s) to cooperative."
    end

    redirect_back(fallback_location: _space_path(space))
  end

  def tasks
    if unsafe_params[:filter] == "all" && !@context.review_space_admin?
      unsafe_params[:filter] = "my"
    end

    case unsafe_params[:filter]
    when "created_by_me"
      filter = { user_id: @context.user_id }
    when "all"
      filter = {}
    else
      unsafe_params[:filter] = "my"
      filter = { assignee_id: @context.user_id }
    end

    case unsafe_params[:status]
    when "completed"
      @tasks = @space.tasks.where(filter).completed
      @page_title = 'Completed Tasks'
      @dates_titles = {
        respond: 'RESPONDED ON',
        complete: 'COMPLETED ON',
      }
    when "declined"
      @tasks = @space.tasks.where(filter).declined
      @page_title = 'Declined Tasks'
      @dates_titles = {
        respond: 'RESPOND BY',
        complete: 'DECLINED ON',
      }
    when "accepted"
      @tasks = @space.tasks.where(filter).accepted_and_failed_deadline
      @page_title = 'Active Tasks'
      @dates_titles = {
        respond: 'RESPONDED BY',
        complete: 'COMPLETE BY',
      }
    else
      unsafe_params[:status] = "awaiting_response"
      @tasks = @space.tasks.where(filter).awaiting_response
      @page_title = 'Awaiting Response Tasks'
      @dates_titles = {
        respond: 'RESPOND BY',
        complete: 'COMPLETE BY',
      }
    end

    @tasks_grid = initialize_grid(@tasks, {
      name: 'tasks',
      order: 'tasks.created_at',
      order_direction: 'desc',
      per_page: 25,
      include: [{user: :org}],
    })

    users = @space.users.map { |u| { label: u.dxuser, value: u.id } }

    if @context.user.can_administer_site?
      user_ids = @space.space_memberships.where(side: @membership.side).pluck(:user_id)
      @group_tasks = @space.tasks.where(user_id: user_ids)
    end

    js(common_fields.merge(users: users))
  end

  def notes
    @notes = Note.real_notes.accessible_by_space(@space)
    @notes_list = @notes.order(title: :desc).page unsafe_params[:notes_page]
    js({ space_uid: @space.uid, scopes: @space.accessible_scopes_for_move })
  end

  def assets
    @assets = Asset.accessible_by_space(@space)
    @assets_grid = initialize_grid(Asset.unscoped.accessible_by_space(@space).includes(:taggings), {
      name: 'assets',
      order: 'nodes.name',
      order_direction: 'asc',
      per_page: 25,
      include: [:user, {user: :org}, { taggings: :tag }],
    })
    js(common_fields)
  end

  def comparisons
    @comparisons = Comparison.accessible_by_space(@space)
    @comparisons_grid = initialize_grid(@comparisons.includes(:taggings), {
      name: 'comparisons',
      order: 'comparisons.name',
      order_direction: 'desc',
      per_page: 25,
      include: [:user, { user: :org }, { taggings: :tag }],
    })
    js(common_fields)
  end

  def feed
    if (events = @space.space_events).any?
      @start_date = events.order(created_at: :asc).first.created_at.strftime("%m/%d/%Y")
      @end_date = events.order(created_at: :asc).last.created_at.strftime("%m/%d/%Y")
      @users = User.find(events.pluck(:user_id).uniq).map { |u| { name: u.full_name, value: u.id } }
    else
      @start_date = ""
      @end_date = ""
      @users = []
    end
    @duration = ((Time.now - @space.created_at) / 1.days).ceil
    @roles = SpaceEvent.roles.map { |k, v| { name: k, value: v } }
    @sides = SpaceEvent.sides.map { |k, v| { name: k, value: v } }
    @overall_users = @space.space_memberships.active.count
    object_types = SpaceEvent.object_type_counters(Date.today.beginning_of_week.to_time, Time.now, { space_id: @space.id })
    js(common_fields.merge(object_types: object_types, space_created_at: @space.created_at))
  end

  def reports
    counters = {}
    counters.merge!(@counts)
    counters[:comments] = Comment.where(commentable: @space).count
    counters[:tasks] = @space.tasks.count
    counters.except!(:feed, :open_tasks, :accepted_tasks, :declined_tasks, :completed_tasks)
    @users = @space.users.map { |user| { name: user.full_name, value: user.id } }
    js(common_fields.merge(counts: counters, space_created_at: @space.created_at))
  end

  private

  def copy_service
    @copy_service ||= CopyService.new(api: @context.api, user: @context.user)
  end

  def space_invite_params
    params.require(:space).permit(:invitees, :invitees_role)
  end

  def fetch_membership
    membership = @space.space_memberships.active.find_by(user_id: @context.user_id)

    if membership.nil? && @context.review_space_admin?
      SpaceMembership.new_by_admin(@context.user)
    else
      membership
    end
  end

  def find_space_and_membership
    @space = Space.accessible_by(current_user).find_by(id: params[:id])

    unless @space
      redirect_back(fallback_location: root_path, alert: "Space doesn't exist") && return
    end

    @membership = fetch_membership
  end

  def content_counters
    @counts ||= @space.content_counters(@context.user_id)
  end

  def common_fields
    {
      space_uid: @space.uid,
      scopes: @space.accessible_scopes_for_move,
      space_id: @space.id,
      active: @space.active?,
    }
  end
end
