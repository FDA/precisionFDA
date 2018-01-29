class AddCardImageIdToChallenge < ActiveRecord::Migration
  def change
    add_column :challenges, :card_image_id, :string
  end
end
