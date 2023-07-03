class AddCardImageIdToChallenge < ActiveRecord::Migration[4.2]
  def change
    add_column :challenges, :card_image_id, :string
  end
end
