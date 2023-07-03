class FixPermissionsInJobs < ActiveRecord::Migration[4.2]
  def change
    Job.where(scope: nil).find_each do |job|
      job.update!(scope: "private")
    end
  end
end
