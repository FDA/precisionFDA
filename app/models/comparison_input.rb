# == Schema Information
#
# Table name: comparison_inputs
#
#  id            :integer          not null, primary key
#  comparison_id :integer
#  user_file_id  :integer
#  role          :string
#

class ComparisonInput < ActiveRecord::Base
  include Auditor

  belongs_to :comparison
  belongs_to :user_file
end
