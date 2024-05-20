class AddNotNullToNodesUserId < ActiveRecord::Migration[4.2]
  def change
    change_column_null :nodes, :user_id, false
  end
end
