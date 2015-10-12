class AddPendingJobsCountToUser < ActiveRecord::Migration
  def change
    add_column :users, :pending_jobs_count, :int

    User.find_each { |u| u.update!(:pending_jobs_count => 0) if u.pending_jobs_count.nil? }
  end
end
