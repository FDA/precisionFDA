class CreateWorkflowSeries < ActiveRecord::Migration
  def change
    create_table :workflow_series do |t|
      t.string :dxid
      t.string :name
      t.integer :latest_revision_workflow_id
      t.integer :user_id
      t.string :scope

      t.timestamps null: false
    end
    add_index :workflow_series, :latest_revision_workflow_id
    add_index :workflow_series, :user_id
  end
end
