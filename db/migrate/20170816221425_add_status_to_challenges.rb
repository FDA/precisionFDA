class AddStatusToChallenges < ActiveRecord::Migration
  def change
    add_column :challenges, :status, :string
    add_column :challenges, :automated, :boolean, default: true
    add_index :challenges, :status

    reversible do |change|
      change.up do
        Challenge.find_each do |challenge|
          challenge.status = challenge.end_at.past? ? Challenge::STATUS_ARCHIVED : Challenge::STATUS_OPEN
          challenge.automated = false
          challenge.save(validate: false)
        end
      end
    end
  end
end
