class CreateSpaceInvitations < ActiveRecord::Migration[5.2]
  def change
    create_table :space_invitations do |t|
      t.references :space, type: :integer, null: false, foreign_key: true
      t.references :inviter, type: :integer, foreign_key: { to_table: :users }
      t.string :email, null: false
      t.string :role, null: false
      t.datetime :created_at, null: false

      t.index %i(space_id email), unique: true
    end
  end
end
