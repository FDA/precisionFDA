# encoding: utf-8
class CreateSavedQueries < ::ActiveRecord::Migration #:nodoc:
  def change #:nodoc:
    create_table :saved_queries do |t|
      t.string :name
      t.string :grid_name
      t.text :query
      t.text :description
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
    add_index :saved_queries, :grid_name
    add_index :saved_queries, [:grid_name, :id]
  end

  def self.down
    drop_table :saved_queries
  end
end
