class CreateOrgs < ActiveRecord::Migration
  def change
    create_table :orgs do |t|
      t.string :handle, required: true
      t.string :name
      t.references :admin, index: true, required: true

      t.timestamps null: false
    end
    add_index :orgs, :handle, unique: true
    add_foreign_key :orgs, :users, column: 'admin_id'
  end
end
