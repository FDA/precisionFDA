class AdminGroup < ApplicationRecord


  has_many :admin_memberships, dependent: :destroy
  has_many :users, through: :admin_memberships

  enum role: [:site, :space, :challenge_admin, :challenge_eval]

end
