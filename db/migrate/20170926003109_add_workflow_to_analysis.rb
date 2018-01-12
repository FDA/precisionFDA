class AddWorkflowToAnalysis < ActiveRecord::Migration
  def change
    add_reference :analyses, :workflow, foreign_key: true
  end
end
