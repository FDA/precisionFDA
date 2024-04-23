class AddOrgToUser < ActiveRecord::Migration[4.2]
  def change
    add_reference :users, :org, index: true, foreign_key: true
  end
end
