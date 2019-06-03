class AddCountryAndCityAndUsStateAndPostalCodeToInvitations < ActiveRecord::Migration
  def change
    add_column :invitations, :country, :string
    add_column :invitations, :city, :string
    add_column :invitations, :us_state, :string
    add_column :invitations, :postal_code, :string
    add_column :invitations, :address1, :string
    add_column :invitations, :address2, :string
    add_column :invitations, :phone_country_code, :string
  end
end
