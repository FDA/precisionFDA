class AddWorkflowToAnalysis < ActiveRecord::Migration[4.2]
  def change
    add_reference :analyses, :workflow, foreign_key: true
  end
end
