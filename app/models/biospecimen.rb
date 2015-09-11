# == Schema Information
#
# Table name: biospecimen
#
#  id          :integer          not null, primary key
#  name        :string
#  description :text
#  user_id     :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Biospecimen < ActiveRecord::Base
  belongs_to :user
  has_many :user_files
end
