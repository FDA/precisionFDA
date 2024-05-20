class AddApprovalRequiredToLicenses < ActiveRecord::Migration[4.2]
  def change
    add_column :licenses, :approval_required, :boolean, null: false, default: false
  end
end
