class CreateOrgs < ActiveRecord::Migration
  def change
    create_table :orgs do |t|
      t.string :handle, required: true
      t.string :name
      t.references :admin, index: true, foreign_key: true, required: true

      t.timestamps null: false
    end
    add_index :orgs, :handle, unique: true
  end
end
