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

    # TODO: accepted_licenses_grid
  end

  def show
    @license = License.find(params[:id])

    @items = @license.licensed_items.includes(:licenseable)
    if @license.editable_by?(@context)
      @users = @license.licensed_users
    end

    js license: @license.slice(:id, :content, :title)
  end

  def edit
    @license = License.editable_by(@context).find_by_id(params[:id])

    if @license.nil?
      flash[:error] = "Sorry, this license does not exist or is not accessible by you"
      redirect_to licenses_path
    else
      js license: @license.slice(:id, :content, :title)
    end
  end

  def update
    @license = License.editable_by(@context).find(params[:id])

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
    license = License.editable_by(@context).find(params[:id])
    license.destroy
    flash[:success] = "License \"#{license.title}\" has been successfully deleted"
    redirect_to licenses_path
  end

  # Called from license#show, file#show, asset#show
  def accept
    license = License.find(params[:id])
    if params[:redirect_to_uid].present?
      redirect_to_item = item_from_uid(params[:redirect_to_uid])
    end

    if AcceptedLicense.find_or_create_by(license_id: license.id, user_id: @context.user_id)
      flash[:success] = "License successfully accepted"
    else
      flash[:error] = "Sorry, this license does not exist or is not accessible by you"
    end

    if redirect_to_item.nil?
      redirect_to license_path(license)
    else
      redirect_to pathify(redirect_to_item)
    end
  end

  def license_item
    license = License.find(params[:id])
    item = item_from_uid(params[:item_uid])

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
    license = License.find(params[:id])
    item = item_from_uid(params[:item_uid])
    if license.editable_by?(@context)
      LicensedItem.transaction do
        licensedItem = license.licensed_items.find_by(licenseable: item)
        if !licensedItem.nil?
          licensedItem.destroy
        end
      end
      if params[:redirect_to_uid].present?
        redirect_path = pathify(item_from_uid(params[:redirect_to_uid]))
      else
        redirect_path = pathify(item)
      end
    end
    redirect_to redirect_path
  end

  def remove_user
    license = License.find(params[:id])
    if license.editable_by?(@context)
      user = item_from_uid(params[:user_uid])
      LicensedItem.transaction do
        userLicense = license.accepted_licenses.find_by(user_id: user.id)
        if !userLicense.nil?
          userLicense.destroy
        end
      end
    end

    if params[:redirect_to_uid].present?
      redirect_path = pathify(item_from_uid(params[:redirect_to_uid]))
    else
      redirect_path = pathify(user)
    end
    redirect_to redirect_path
  end

  def remove_items
    license = License.find(params[:id])
    if license.editable_by?(@context)
      LicensedItem.transaction do
        license.licensed_items.destroy_all
      end
    end
    redirect_to license_path(license)
  end

  def remove_users
    license = License.find(params[:id])
    if license.editable_by?(@context)
      AcceptedLicense.transaction do
        license.accepted_licenses.destroy_all
      end
    end
    redirect_to license_path(license)
  end

  private
    def license_params
      params.require(:license).permit(:content, :title)
    end
end
