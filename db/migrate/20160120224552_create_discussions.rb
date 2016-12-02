class CreateDiscussions < ActiveRecord::Migration
  def change
    create_table :discussions do |t|
      t.references :user, index: true, foreign_key: true
      t.string :title
      t.text :description
      t.string :scope

      t.timestamps null: false
    end
  end
end
