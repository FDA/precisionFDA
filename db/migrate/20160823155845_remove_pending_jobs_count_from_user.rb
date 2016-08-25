class RemovePendingJobsCountFromUser < ActiveRecord::Migration
  def change
    remove_column :users, :pending_jobs_count, :int
  end
end
