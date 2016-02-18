class ChallengesController < ApplicationController
  skip_before_action :require_login, {only: [:consistency]}

  skip_before_action :require_login,     only: []
  before_action :require_login_or_guest, only: []

  def consistency
  end
end
