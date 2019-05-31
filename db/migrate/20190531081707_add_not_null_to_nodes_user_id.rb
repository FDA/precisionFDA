class AddNotNullToNodesUserId < ActiveRecord::Migration
  def change
    change_column_null :nodes, :user_id, false
  end
end
