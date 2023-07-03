class AddEntityTypeToJobs < ActiveRecord::Migration[6.0]
  def change
    add_column :jobs, :entity_type, :integer,
               null: false, default: Job.entity_types[Job::TYPE_REGULAR]
  end
end
