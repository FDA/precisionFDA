class CreateExperts < ActiveRecord::Migration[4.2]
  def change
    create_table :experts do |t|
      t.references :user, index: true, foreign_key: true
      t.string :image, index: true
      t.string :state, index: true
      t.string :scope, index: true
      t.text :meta

      t.timestamps null: false
    end
  end
end
