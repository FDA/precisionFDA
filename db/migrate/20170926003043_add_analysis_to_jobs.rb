class AddAnalysisToJobs < ActiveRecord::Migration
  def change
    add_reference :jobs, :analysis, foreign_key: true
  end
end
