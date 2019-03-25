class PhoneConfirmationsController < ApplicationController
  skip_before_action :require_login

  def create
    PhoneConfirmationService.send_code(params[:phone])
    render json: {}
  end

  def check_code
    result = PhoneConfirmationService.code_valid?(params[:phone], params[:code])
    status = result ? :ok : :unprocessable_entity
    render json: {}, status: status
  end
end
