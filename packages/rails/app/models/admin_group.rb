# == Schema Information
#
# Table name: admin_groups
#
#  id         :bigint           not null, primary key
#  role       :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

# Responsible for admin groups.
class AdminGroup < ApplicationRecord
  has_many :admin_memberships, dependent: :destroy
  has_many :users, through: :admin_memberships

  ROLE_SITE_ADMIN = "site".freeze
  ROLE_REVIEW_SPACE_ADMIN = "space".freeze
  ROLE_CHALLENGE_ADMIN = "challenge_admin".freeze
  ROLE_CHALLENGE_EVALUATOR = "challenge_eval".freeze

  ROLES = [
    ROLE_SITE_ADMIN,
    ROLE_REVIEW_SPACE_ADMIN,
    ROLE_CHALLENGE_ADMIN,
    ROLE_CHALLENGE_EVALUATOR,
  ].freeze

  enum role: {
    ROLE_SITE_ADMIN => 0,
    ROLE_REVIEW_SPACE_ADMIN => 1,
    ROLE_CHALLENGE_ADMIN => 2,
    ROLE_CHALLENGE_EVALUATOR => 3,
  }
end
