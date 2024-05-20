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
class SpaceReport < ApplicationRecord
  include Permissions

  # Class methods
  module ClassMethods
    def editable_by?(context)
      return false if context.guest? || in_locked_verification_space?

      return created_by == context.user_id unless in_space?

      space_object.editable_by?(context.user)
    end
  end
end
