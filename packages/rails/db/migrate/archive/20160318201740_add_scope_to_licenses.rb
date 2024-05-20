class AddScopeToLicenses < ActiveRecord::Migration[4.2]
  def change
    add_column :licenses, :scope, :string
    add_index :licenses, :scope

    License.find_each do |item|
      if item.scope.nil?
        item.update!(scope: "public")
      end
    end
  end
end
