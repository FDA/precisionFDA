class AddExtraProjectsToUsers < ActiveRecord::Migration[6.0]
  def change
    change_table :users, bulk: true do |t|
      t.string :jupyter_project
      t.string :ttyd_project
      t.string :cloud_workstation_project
      t.string :https_project
    end
  end
end
