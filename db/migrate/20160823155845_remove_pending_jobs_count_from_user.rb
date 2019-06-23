class RemovePendingJobsCountFromUser < ActiveRecord::Migration[4.2]
  def change
    remove_column :users, :pending_jobs_count, :int
  end
end
