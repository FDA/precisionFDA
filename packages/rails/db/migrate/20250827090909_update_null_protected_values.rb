class UpdateNullProtectedValues < ActiveRecord::Migration[6.1]
  def up
    Space.where(protected: nil).find_each do |space|
      space.update!(protected: false)
    end
  end

  def down
    # No need to revert this change
  end
end
