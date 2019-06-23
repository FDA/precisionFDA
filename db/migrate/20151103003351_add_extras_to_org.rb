class AddExtrasToOrg < ActiveRecord::Migration[4.2]
  def change
    add_column :orgs, :address, :text
    add_column :orgs, :duns, :string
    add_column :orgs, :phone, :string
    add_column :orgs, :state, :string
    add_column :orgs, :singular, :boolean
  end
end
