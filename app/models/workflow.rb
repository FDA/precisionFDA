  # == Schema Information
#
# Table name: workflows
#
#  id                  :integer          not null, primary key
#  title               :string
#  name                :string
#  dxid                :string
#  user_id             :integer
#  readme              :text
#  edit_version        :string
#  spec                :text
#  default_instance    :string
#  scope               :string
#  revision            :integer
#  workflow_series_id :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

class Workflow < ActiveRecord::Base
  include Permissions

  belongs_to :user
  belongs_to :workflow_series
  has_many :analyses

  store :spec, accessors: [ :input_spec, :output_spec, :internet_access, :instance_type ], coder: JSON

  def all_input_spec
    input_spec["stages"].reduce([]) { |inputs, stage| inputs + stage["inputs"] }
  end

  def all_output_spec
    input_spec["stages"].reduce([]) { |outputs, stage| outputs + stage["outputs"] }
  end

  def apps
    @apps ||= App.where(dxid: input_spec["stages"].map { |stage| stage["app_dxid"] })
  end

  def uid
    dxid
  end

  def klass
    "workflow"
  end

  def input_spec_hash
    hash = {}
    all_input_spec.each do |input_spec|
      hash[input_spec["parent_slot"]] ||= {}
      hash[input_spec["parent_slot"]][input_spec["name"]] = input_spec
    end
    hash
  end
end
