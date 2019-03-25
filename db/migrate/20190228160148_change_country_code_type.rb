class ChangeCountryCodeType < ActiveRecord::Migration
  def change
    remove_column :profiles, :phone_country_code, :string
    add_column :profiles, :phone_country_id, :integer, index: true
    add_foreign_key :profiles, :countries, column: :phone_country_id, on_delete: :nullify
  end
end
