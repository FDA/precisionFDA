class AddSpecifiedOrderToChallenges < ActiveRecord::Migration[5.2]
  def change
    add_column :challenges, :specified_order, :integer

    reversible do |ch|
      ch.up do
        ActiveRecord::Base.connection.execute "UPDATE `challenges` SET `specified_order` = id"
      end
    end
  end
end
