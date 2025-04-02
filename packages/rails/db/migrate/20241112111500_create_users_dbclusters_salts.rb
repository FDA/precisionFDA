class CreateUsersDbclustersSalts < ActiveRecord::Migration[6.1]
  def change
    create_table :users_dbclusters_salts do |t|
      t.integer :user_id, null: false, required: true
      t.bigint :dbcluster_id, null: false, required: true
      t.string :salt, null: false

      t.timestamps null: false
    end
    add_foreign_key "users_dbclusters_salts", "users", column: "user_id"
    add_foreign_key "users_dbclusters_salts", "dbclusters", column: "dbcluster_id"

    add_column :dbclusters, :salt, :string
  end
end
