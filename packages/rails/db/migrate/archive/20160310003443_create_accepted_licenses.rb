class CreateAcceptedLicenses < ActiveRecord::Migration[4.2]
  def change
    create_table :accepted_licenses do |t|
      t.references :license, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
