# == Schema Information
#
# Table name: properties
#
#  target_id               :integer          not null, primary key
#  target_type             :string(255)      not null, primary key
#  property_name           :string(255)      not null, primary key
#  property_value          :string(255)      not null
#

class Property < ApplicationRecord
  # There likely is a much better 'ruby' way how to do this - If only I knew.
  belongs_to :job, foreign_key: "target_id", primary_key: "id"
  belongs_to :node, foreign_key: "target_id", primary_key: "id"
  belongs_to :asset, foreign_key: "target_id", primary_key: "id"
  belongs_to :dbcluster, foreign_key: "target_id", primary_key: "id"
  belongs_to :app_series, foreign_key: "target_id", primary_key: "id"
  belongs_to :workflow_series, foreign_key: "target_id", primary_key: "id"
end
