class RemoveHttpsAppsProjectsFromUsers < ActiveRecord::Migration[6.0]
  def up
    change_table :users, bulk: true do |t|
      t.remove :jupyter_project
      t.remove :ttyd_project
    end
  end

  def down
    change_table :users, bulk: true do |t|
      t.string :jupyter_project
      t.string :ttyd_project
    end
  end
end
