class ChallengesController < ApplicationController
  skip_before_action :require_login, {only: [:reproducibility_and_accuracy]}

  skip_before_action :require_login,     only: []
  before_action :require_login_or_guest, only: []

  def reproducibility_and_accuracy
  end
end
