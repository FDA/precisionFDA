class AddStateToComments < ActiveRecord::Migration[4.2]
  def change
    add_column :comments, :state, :integer, default: 0

    Comment.find_each { |u| u.update!(state: 0) if u.state.nil? }
  end
end
