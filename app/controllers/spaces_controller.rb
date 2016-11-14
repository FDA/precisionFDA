class SpacesController < ApplicationController
  def index
    if @context.user.can_administer_site?
      spaces = Space.all
    else
      spaces = Space.accessible_by(@context)
    end
    @spaces_grid = initialize_grid(spaces, {
      name: 'spaces',
      order: 'spaces.id',
      order_direction: 'desc',
      per_page: 100
    })
  end

  def show
    redirect_to content_space_path(params[:id])
  end

  def content
    @space = Space.accessible_by(@context).find(params[:id])
    @membership = @space.space_memberships.find_by!(user_id: @context.user_id)

    @notes = Note.real_notes.accessible_by_space(@space)
    @files = UserFile.real_files.accessible_by_space(@space)
    @comparisons = Comparison.accessible_by_space(@space)
    @apps = AppSeries.accessible_by_space(@space)
    @assets = Asset.accessible_by_space(@space)
    @jobs = Job.accessible_by_space(@space)

    @counts = {
      notes: @notes.count,
      files: @files.count,
      comparisons: @comparisons.count,
      apps: @apps.count,
      assets: @assets.count,
      jobs: @jobs.count
    }

    @total_count = @counts.values.sum

    if @counts[:notes] > 0
      @notes_list = @notes.order(title: :desc).page params[:notes_page]
    end
    if @counts[:files] > 0
      @files_grid = initialize_grid(@files.includes(:taggings), {
        name: 'files',
        order: 'user_files.name',
        order_direction: 'desc',
        per_page: 25,
        include: [:user, {user: :org}, {taggings: :tag}]
      })
    end
    if @counts[:comparisons] > 0
      @comparisons_grid = initialize_grid(@comparisons.includes(:taggings), {
        name: 'comparisons',
        order: 'comparisons.name',
        order_direction: 'desc',
        per_page: 25,
        include: [:user, {user: :org}, {taggings: :tag}]
      })
    end
    if @counts[:apps] > 0
      @apps_grid = initialize_grid(@apps.includes(:latest_version_app, :taggings), {
        name: 'apps',
        order: 'apps.title',
        order_direction: 'desc',
        per_page: 25,
        include: [{user: :org}, :latest_version_app, {taggings: :tag}]
      })
    end
    if @counts[:assets] > 0
      @assets_grid = initialize_grid(Asset.unscoped.accessible_by_space(@space).includes(:taggings), {
        name: 'assets',
        order: 'user_files.name',
        order_direction: 'asc',
        per_page: 25,
        include: [:user, {user: :org}, {taggings: :tag}]
      })
    end
    if @counts[:jobs] > 0
      @jobs_grid = initialize_grid(@jobs.includes(:taggings), {
        name: 'jobs',
        order: 'jobs.created_at',
        order_direction: 'desc',
        per_page: 25,
        include: [{user: :org}, {taggings: :tag}]
      })
    end

    js space_uid: @space.uid
  end

  def discuss
    @space = Space.accessible_by(@context).find(params[:id])
    @membership = @space.space_memberships.find_by!(user_id: @context.user_id)

    @items_from_params = [@space]
    @item_path = pathify(@space)
    @item_comments_path = pathify_comments(@space)
    @comments = @space.root_comments.order(id: :desc).page params[:comments_page]
  end

  def members
    @space = Space.accessible_by(@context).find(params[:id])
    @membership = @space.space_memberships.find_by!(user_id: @context.user_id)

    @members_grid = initialize_grid(@space.space_memberships, {
      order: 'created_at',
      order_direction: 'asc',
      per_page: 100
    })
  end

  def new
    redirect_to spaces_path unless @context.user.can_administer_site?
    @space = Space.new
  end

  def edit
    @space = Space.editable_by(@context).find(params[:id])
  end

  def create
    redirect_to spaces_path unless @context.user.can_administer_site?
    if space_params[:host_lead_dxuser] == space_params[:guest_lead_dxuser]
      flash[:error] = "The host and guest lead cannot be the same user"
    end

    host_lead_user = User.find_by(dxuser: space_params[:host_lead_dxuser])
    guest_lead_user = User.find_by(dxuser: space_params[:guest_lead_dxuser])

    if host_lead_user.nil?
      flash[:error] = "Host lead username #{space_params[:host_lead_dxuser]} not found"
    elsif guest_lead_user.nil?
      flash[:error] = "Guest lead username #{space_params[:guest_lead_dxuser]} not found"
    end

    if flash[:error].blank?
      @space = Space.provision(@context, space_params)
      if @space
        NotificationsMailer.space_activation_email(@space, @space.host_lead_member).deliver_now!
        NotificationsMailer.space_activation_email(@space, @space.guest_lead_member).deliver_now!
        if @space.accessible_by?(@context)
          flash[:success] = "The space was created successfully, and will be activated once both admin's accept it."
          redirect_to space_path(@space)
        else
          flash[:success] = "The space was created successfully, but is not currently accessible by you."
          redirect_to spaces_path
        end
        return
      else
        flash[:error] = "The space could not be provisioned for an unknown reason."
      end
    end
    @space = Space.new(space_params)
    render :new
  end

  def update
    @space = Space.editable_by(@context).find(params[:id])
    Space.transaction do
      if @space.update(update_space_params)
        # Handle a successful update.
        flash[:success] = "Space updated"
        redirect_to space_path(@space)
      else
        flash[:error] = "Could not update the space. Please try again."
        render :edit
      end
    end
  end

  def destroy
    # TODO: figure out if and how spaces should be deleted
  end

  def accept
    space = Space.accessible_by(@context).find(params[:id])
    admin = space.space_memberships.find_by(user_id: @context.user_id, role: 'ADMIN')
    if admin
      Space.transaction do
        if admin.side == 'HOST'
          space.host_project = space.create_space_project(@context, space.host_dxorg, space.guest_dxorg, admin) unless space.host_project?
        elsif admin.side == 'GUEST'
          space.guest_project = space.create_space_project(@context, space.guest_dxorg, space.host_dxorg, admin) unless space.guest_project?
        else
          flash[:error] = "Your admin 'side' is not correctly defined"
          redirect_to space
          return
        end
        if space.host_project? && space.guest_project?
          space.state = "ACTIVE"
          NotificationsMailer.space_activated_email(space, space.host_lead_member).deliver_now!
          NotificationsMailer.space_activated_email(space, space.guest_lead_member).deliver_now!
        end
        space.save
      end
    else
      flash[:error] = "You don't have permission to edit this space"
    end
    redirect_to space
  end

  def invite
    space = Space.accessible_by(@context).find(params[:id])
    admin = space.space_memberships.find_by(user_id: @context.user_id, role: 'ADMIN')
    if admin
      invitees = params[:space][:invitees].split(',').map(&:strip)
      invitees_role = params[:space][:invitees_role]

      if invitees.count > 0 && params[:space][:invitees] != "" && invitees_role.is_a?(String) && ["ADMIN", "MEMBER"].include?(invitees_role)
        api = DNAnexusAPI.new(@context.token)
        notAdded = []
        invitees.each do |username|
          if admin.side == 'HOST'
            member = space.add_or_update_member(api, space.host_dxorg, username, invitees_role, admin.side)
          elsif admin.side == 'GUEST'
            member = space.add_or_update_member(api, space.guest_dxorg, username, invitees_role, admin.side)
          else
            raise "The admin 'side' is not correctly defined"
          end

          # If the username didn't return a member
          if !member
            notAdded.push(username)
          else
            NotificationsMailer.space_invitation_email(space, member, admin).deliver_now!
          end
        end

        if notAdded.count > 0
          flash[:error] = "The follow username's could not be invited because they do not exist: #{notAdded.to_sentence}"
        end
      else
        flash[:error] = "Invitees and role are both required"
      end
    else
      flash[:error] = "You don't have permission to edit this space"
    end
    redirect_to members_space_path(space)
  end

  def rename
    @space = Space.editable_by(@context).find(params[:id])
    name = params[:space][:name]
    if name.is_a?(String) && name != ""
      if @space.rename(name, @context)
        @space.reload
        flash[:success] = "Space renamed to \"#{@space.name}\""
      else
        flash[:error] = "Space \"#{@space.name}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to space_path(@space)
  end

  private
    def space_params
      p = params.require(:space).permit(:name, :description, :host_lead_dxuser, :guest_lead_dxuser, :space_type, :cts)
      p.require(:name)
      p.require(:host_lead_dxuser)
      p.require(:guest_lead_dxuser)
      p.require(:space_type)
      return p
    end

    def update_space_params
      p = params.require(:space).permit(:name, :description, :space_type, :cts)
      p.require(:name)
      p.require(:space_type)
      return p
    end
end
