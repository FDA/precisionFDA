class AddOrgToUser < ActiveRecord::Migration
  def change
    add_reference :users, :org, index: true, foreign_key: true
  end
end
