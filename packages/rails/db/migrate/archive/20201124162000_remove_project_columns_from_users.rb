class RemoveProjectColumnsFromUsers < ActiveRecord::Migration[6.0]
  def up
    change_table :users, bulk: true do |t|
      t.remove :cloud_workstation_project
      t.remove :https_project
    end
  end

  def down
    change_table :users, bulk: true do |t|
      t.string :cloud_workstation_project
      t.string :https_project
    end
  end
end
