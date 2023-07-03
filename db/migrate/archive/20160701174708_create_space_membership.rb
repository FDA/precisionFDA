class CreateSpaceMembership < ActiveRecord::Migration[4.2]
  def change
    create_table :space_memberships do |t|
      t.references :user, index: true, foreign_key: true
      t.references :space, index: true, foreign_key: true
      t.string :role
      t.string :side
      t.text :meta

      t.timestamps null: false
    end
  end
end
