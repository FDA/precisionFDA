# == Schema Information
#
# Table name: space_template_spaces
#
#  id                :integer          not null, primary key
#  space_id          :string(255)
#  space_template_id :string(255)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  space_name        :string(255)
#

class SpaceTemplateSpace < ApplicationRecord
  belongs_to :space
  belongs_to :space_template
end
