class AddCardImageUrlToChallenges < ActiveRecord::Migration[4.2]
  def change
    add_column :challenges, :card_image_url, :string
  end
end
