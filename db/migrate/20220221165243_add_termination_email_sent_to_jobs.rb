class AddTerminationEmailSentToJobs < ActiveRecord::Migration[6.1]
  def change
    add_column :jobs, :termination_email_sent, :boolean, default: false
  end
end
