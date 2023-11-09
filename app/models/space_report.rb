# == Schema Information
#
# Table name: space_reports
#
#  id         :bigint           not null, primary key
#  space_id   :integer          not null
#  result_file_id :integer
#  state      :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

# Space Invitations
class SpaceReport < ApplicationRecord
  belongs_to :space
end
