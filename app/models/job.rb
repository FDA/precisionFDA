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
  has_many :output_files, as: :parent, class_name: "UserFile"

  store :spec, {accessors: [ :input_spec, :output_spec, :internet_access, :instance_type ], coder: JSON}
  store :describe, {coder: JSON}
  store :run_data, {accessors: [ :run_inputs, :run_outputs, :run_instance_type ], coder: JSON}
  store :app_meta, {accessors: [ :app_version, :app_name, :app_title, :app_user_id, :app_dxid ], coder: JSON}
  store :provenance, {coder: JSON}

  INSTANCE_TYPES = {
    "baseline-2" => "mem1_ssd1_x2",
    "baseline-4" => "mem1_ssd1_x4",
    "baseline-8" => "mem1_ssd1_x8",
    "baseline-16" => "mem1_ssd1_x16",
    "baseline-32" => "mem1_ssd1_x32",
    "himem-2" => "mem3_ssd1_x2",
    "himem-4" => "mem3_ssd1_x4",
    "himem-8" => "mem3_ssd1_x8",
    "himem-16" => "mem3_ssd1_x16",
    "himem-32" => "mem3_ssd1_x32",
    "hidisk-2" => "mem1_ssd2_x2",
    "hidisk-4" => "mem1_ssd2_x4",
    "hidisk-8" => "mem1_ssd2_x8",
    "hidisk-16" => "mem1_ssd2_x16",
    "hidisk-32" => "mem1_ssd2_x32"
  }

  TERMINAL_STATES = ["terminated", "done", "failed"]

  def resolved_instance_type
    run_instance_type || instance_type
  end

  def terminal?
    TERMINAL_STATES.include?(state)
  end

  def done?
    state == "done"
  end

  def runtime
    if describe.has_key?("startedRunning") && describe.has_key?("stoppedRunning")
      (describe["stoppedRunning"] - describe["startedRunning"]) / 1000
    else
      0
    end
  end
end
