class AddStateAndMessageToAcceptedLicenses < ActiveRecord::Migration[4.2]
  def change
    add_column :accepted_licenses, :state, :string
    add_column :accepted_licenses, :message, :text
  end
end
