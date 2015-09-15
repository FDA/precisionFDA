class CreateBiospecimen < ActiveRecord::Migration
  def change
    create_table :biospecimen do |t|
      t.string :name, required: true
      t.text :description
      t.belongs_to :user, index: true, foreign_key: true, required: true

      t.timestamps null: false
    end
  end
end
