class ModifyWorkflowsSpecJson < ActiveRecord::Migration[6.1]
  def change
    change_column :workflows, :spec, :json
  end
end
