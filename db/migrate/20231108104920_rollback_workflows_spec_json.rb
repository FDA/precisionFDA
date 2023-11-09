class RollbackWorkflowsSpecJson < ActiveRecord::Migration[6.1]
  def change
    change_column :workflows, :spec, :text
  end
end
