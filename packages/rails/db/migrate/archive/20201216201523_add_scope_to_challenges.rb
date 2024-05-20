class AddScopeToChallenges < ActiveRecord::Migration[6.0]
  def change
    add_column :challenges, :scope, :string, null: false, default: Scopes::SCOPE_PUBLIC
  end
end
