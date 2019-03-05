class OrgsController < ApplicationController
  include ErrorProcessable
  skip_before_action :verify_authenticity_token

  def update
    org = current_user.org
    if org.update(org_params)
      render json: org.slice(:name), status: :ok
    else
      render json: org.errors, status: :unprocessable_entity
    end
  end

  private

  def check_user!
    raise ApiError.new(t('org.errors.org_admin_error')) unless current_user.id == current_user.org.admin_id
  end

  def org_params
    params.require(:org).permit(:name)
  end
end
