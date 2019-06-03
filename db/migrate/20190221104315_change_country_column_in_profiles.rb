class ChangeCountryColumnInProfiles < ActiveRecord::Migration
  def change
    remove_column :profiles, :country, :string
    add_reference :profiles, :country, index: true, foreign_key: { on_delete: :nullify }
  end
end
