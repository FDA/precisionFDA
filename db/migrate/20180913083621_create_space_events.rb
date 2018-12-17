class CreateSpaceEvents < ActiveRecord::Migration
  def change
    create_table :space_events do |t|
      t.references :user, null: false, index: true, foreign_key: true
      t.references :space, null: false, index: true, foreign_key: true
      t.references :entity, polymorphic: true, null: false, index: true
      t.integer    :activity_type, null: false
      t.integer    :side, null: false
      t.datetime   :created_at, null: false
    end
  end
end
