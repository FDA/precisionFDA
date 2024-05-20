class CreateAdminMemberships < ActiveRecord::Migration[5.2]
  def change
    create_table :admin_memberships do |t|
      t.references :user, null: false, index: true, foreign_key: true, type: :integer
      t.references :admin_group, null: false, index: true, foreign_key: true

      t.index %i(user_id admin_group_id), unique: true

      t.timestamps
    end
  end
end
