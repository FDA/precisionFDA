class AddSponsorOrgToSpaces < ActiveRecord::Migration[4.2]
  def change
    add_column :spaces, :sponsor_org_id, :integer
  end
end
