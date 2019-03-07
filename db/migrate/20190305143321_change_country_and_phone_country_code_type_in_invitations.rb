class ChangeCountryAndPhoneCountryCodeTypeInInvitations < ActiveRecord::Migration
  def change
    remove_column :invitations, :country, :string
    add_reference :invitations, :country, index: true, foreign_key: { on_delete: :nullify }

    remove_column :invitations, :phone_country_code, :string
    add_column :invitations, :phone_country_id, :integer, index: true
    add_foreign_key :invitations, :countries, column: :phone_country_id, on_delete: :nullify
  end
end
