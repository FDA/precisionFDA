class AddAnalysisToJobs < ActiveRecord::Migration[4.2]
  def change
    add_reference :jobs, :analysis, foreign_key: true
  end
end
