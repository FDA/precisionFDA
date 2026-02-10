class AddUniqueSpaceMembershipsSpaces < ActiveRecord::Migration[6.1]
  def change
    add_index :space_memberships_spaces, [:space_id, :space_membership_id], unique: true, name: 'unique_space_membership'
  end
end
