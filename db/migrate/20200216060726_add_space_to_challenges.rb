class AddSpaceToChallenges < ActiveRecord::Migration[5.2]
  def change
    add_reference :challenges, :space, type: :integer
  end
end

