class CreateAdminGroups < ActiveRecord::Migration[5.2]
  def change
    create_table :admin_groups do |t|
      t.integer :role, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
