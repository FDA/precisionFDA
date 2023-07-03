class AddPreRegistrationUrlToChallenges < ActiveRecord::Migration[6.0]
  def change
    add_column :challenges, :pre_registration_url, :string
  end
end
