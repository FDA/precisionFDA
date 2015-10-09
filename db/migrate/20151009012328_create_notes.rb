class CreateNotes < ActiveRecord::Migration
  def change
    create_table :notes do |t|
      t.string :title, required: true
      t.string :slug, required: true, unique: true
      t.text :content
      t.boolean :public, required: true
      t.references :user, index: true, foreign_key: true, required: true

      t.timestamps null: false
    end
  end
end
