class CreateAdminMemberships < ActiveRecord::Migration[5.2]
  def change
    create_table :admin_memberships do |t|
      t.references :user, index: true, foreign_key: true
      t.references :admin_group, index: true, foreign_key: true

      t.timestamps
    end
  end
end
