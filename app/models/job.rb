# == Schema Information
#
# Table name: jobs
#
#  id         :integer          not null, primary key
#  dxid       :string
#  series     :string
#  app_id     :integer
#  project    :string
#  spec       :text
#  run_data   :text
#  describe   :text
#  provenance :text
#  app_meta   :text
#  state      :string
#  name       :string
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Job < ActiveRecord::Base
  belongs_to :app
  belongs_to :user

  has_and_belongs_to_many :input_files, {join_table: "job_inputs", class_name: "UserFile"}

  store :spec, {accessors: [ :input_spec, :output_spec, :internet_access, :instance_type ], coder: JSON}
  store :describe, {coder: JSON}
  store :run_data, {accessors: [ :run_inputs, :run_outputs, :run_instance_type ], coder: JSON}
  store :app_meta, {coder: JSON}
  store :provenance, {coder: JSON}
end
