class LicensesController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show]
  before_action :require_login_or_guest, only: [:index, :show]

  def index
    @owned_licenses_grid = initialize_grid(License.editable_by(@context), {
      name: 'licenses',
      order: 'licenses.id',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}]
    })
  end

  def show
    @license = License.find(unsafe_params[:id])

    @items_count = @license.licensed_items.size
    if @license.editable_by?(@context)
      @users_count = @license.licensed_users.size
    end

    js license: @license.slice(:id, :content, :title)
  end

  def items
    @license = License.find(unsafe_params[:id])

    @items = @license.licensed_items.includes(:licenseable)
    @items_count = @license.licensed_items.size
    if @license.editable_by?(@context)
      @users_count = @license.licensed_users.size
    end
  end

  def users
    @license = License.find(unsafe_params[:id])
    redirect_to license_path(@license) unless @license.editable_by?(@context)

    @items_count = @license.licensed_items.size
    @users = @license.licensed_users
    @users_count = @users.size
  end

  def edit
    @license = License.editable_by(@context).find_by_id(unsafe_params[:id])

    if @license.nil?
      flash[:error] = "Sorry, this license does not exist or is not accessible by you"
      redirect_to licenses_path
    else
      js license: @license.slice(:id, :content, :title)
    end
  end

  def update
    @license = License.editable_by(@context).find(unsafe_params[:id])

    License.transaction do
      if @license.update(license_params)
        # Handle a successful update.
        flash[:success] = "License updated"
        redirect_to license_path(@license)
      else
        flash[:error] = "Error: Could not update the license. Please try again."
        render 'edit'
      end
    end
  end

  def create
    if request.post?
      @license = License.create!(
        title: "#{@context.user.org.name} License (#{DateTime.now.strftime("%Y-%m-%d %H:%M:%S")})",
        user_id: @context.user_id,
        scope: "public"
      )
      redirect_to edit_license_path(@license)
    else
      redirect_to licenses_path
    end
  end

  def destroy
    license = License.editable_by(@context).find(unsafe_params[:id])
    license.destroy
    flash[:success] = "License \"#{license.title}\" has been successfully deleted"
    redirect_to licenses_path
  end

  def request_approval
    @license = License.accessible_by(@context).find(unsafe_params[:id])
    if @license.nil?
      flash[:error] = "Sorry, this license does not exist or is not accessible by you"
      redirect_to license_path(@license)
      return
    end

    message = !unsafe_params[:accepted_license].nil? ? unsafe_params[:accepted_license][:message] : nil

    if request.post? && !message.nil? && message.is_a?(String)
      accepted_license = AcceptedLicense.create!({
        license_id: @license.id,
        user_id: @context.user_id,
        state: 'pending',
        message: message
      })
      if accepted_license.persisted?
        NotificationsMailer.license_request_email(@license, @context.user, message).deliver_now!
        flash[:success] = "License approval requested"
      end
      redirect_to license_path(@license)
    else
      @acceptedLicense = AcceptedLicense.new({
        user_id: @context.user_id,
        license_id: @license.id,
        state: 'pending',
        message: message
      })
    end
  end

  # Called from license#show, file#show, asset#show
  def accept
    license = License.accessible_by(@context).find(unsafe_params[:id])
    if unsafe_params[:redirect_to_uid].present?
      redirect_to_item = item_from_uid(unsafe_params[:redirect_to_uid])
    end

    if license.approval_required
      redirect_to request_approval_path(license)
    else
      if AcceptedLicense.find_or_create_by(license_id: license.id, user_id: @context.user_id)
        flash[:success] = "License accepted"
      else
        flash[:error] = "Sorry, this license does not exist or is not accessible by you"
      end
      if redirect_to_item.nil?
        redirect_to license_path(license)
      else
        redirect_to pathify(redirect_to_item)
      end
    end
  end

  def license_item
    license = License.find(unsafe_params[:id])
    item = item_from_uid(unsafe_params[:item_uid])

    if license.editable_by?(@context) && item.editable_by?(@context)
      LicensedItem.transaction do
        licensedItem = LicensedItem.find_by(licenseable: item)
        if !licensedItem.nil?
          licensedItem.destroy
        end
        if LicensedItem.create!(license_id: license.id, licenseable: item)
          flash[:success] = "This item now requires the license: #{license.title}"
        else
          flash[:error] = "Sorry, this license does not exist or is not accessible by you"
        end
      end
    end
    redirect_to pathify(item)
  end

  def remove_item
    license = License.find(unsafe_params[:id])
    item = item_from_uid(unsafe_params[:item_uid])
    if license.editable_by?(@context)
      LicensedItem.transaction do
        licensedItem = license.licensed_items.find_by(licenseable: item)
        if !licensedItem.nil?
          licensedItem.destroy
        end
      end
      if unsafe_params[:redirect_to_uid].present?
        redirect_path = pathify(item_from_uid(unsafe_params[:redirect_to_uid]))
      else
        redirect_path = items_license_path(license)
      end
    end
    redirect_to redirect_path
  end

  def remove_user
    license = License.find(unsafe_params[:id])
    if license.editable_by?(@context)
      user = item_from_uid(unsafe_params[:user_uid], User)
      LicensedItem.transaction do
        userLicense = license.accepted_licenses.find_by(user_id: user.id)
        if !userLicense.nil?
          userLicense.destroy
          NotificationsMailer.license_revoked_email(license, user).deliver_now!
        end
      end
    end

    if unsafe_params[:redirect_to_uid].present?
      redirect_path = pathify(item_from_uid(unsafe_params[:redirect_to_uid]))
    else
      redirect_path = users_license_path(license)
    end
    redirect_to redirect_path
  end

  def approve_user
    license = License.find(unsafe_params[:id])
    if license.editable_by?(@context)
      user = item_from_uid(unsafe_params[:user_uid], User)
      AcceptedLicense.transaction do
        accepted_license = license.accepted_licenses.find_by(user_id: user.id)
        if !accepted_license.nil?
          accepted_license.update_attributes(state: 'active')
          accepted_license.reload
          NotificationsMailer.license_approved_email(license, user).deliver_now!
        end
      end
    end

    if unsafe_params[:redirect_to_uid].present?
      redirect_path = pathify(item_from_uid(unsafe_params[:redirect_to_uid]))
    else
      redirect_path = users_license_path(license)
    end
    redirect_to redirect_path
  end

  def remove_items
    license = License.find(unsafe_params[:id])
    if license.editable_by?(@context)
      LicensedItem.transaction do
        license.licensed_items.destroy_all
      end
    end
    redirect_to items_license_path(license)
  end

  def remove_users
    license = License.find(unsafe_params[:id])
    if license.editable_by?(@context)
      AcceptedLicense.transaction do
        license.accepted_licenses.destroy_all
      end
    end
    redirect_to users_license_path(license)
  end

  def approve_users
    license = License.find(unsafe_params[:id])
    if license.editable_by?(@context)
      AcceptedLicense.transaction do
        license.accepted_licenses.update_all(state: 'active')
      end
    end
    redirect_to users_license_path(license)
  end

  def rename
    @license = License.editable_by(@context).find_by!(id: unsafe_params[:id])
    title = license_params[:title]
    if title.is_a?(String) && title != ""
      if @license.rename(title, @context)
        @license.reload
        flash[:success] = "License renamed to \"#{@license.title}\""
      else
        flash[:error] = "License \"#{@license.title}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to license_path(@license)
  end

  private
    def license_params
      params.require(:license).permit(:content, :title, :approval_required)
    end
end
