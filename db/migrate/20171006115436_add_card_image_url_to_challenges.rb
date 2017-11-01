class AddCardImageUrlToChallenges < ActiveRecord::Migration
  def change
    add_column :challenges, :card_image_url, :string
  end
end
