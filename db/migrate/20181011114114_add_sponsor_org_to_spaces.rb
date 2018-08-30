class AddSponsorOrgToSpaces < ActiveRecord::Migration
  def change
    add_column :spaces, :sponsor_org_id, :integer
  end
end
