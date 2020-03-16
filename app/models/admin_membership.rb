class AdminMembership < ApplicationRecord
  belongs_to :user
  belongs_to :admin_group
end
