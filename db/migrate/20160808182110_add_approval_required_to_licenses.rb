class AddApprovalRequiredToLicenses < ActiveRecord::Migration
  def change
    add_column :licenses, :approval_required, :boolean, null: false, default: false
  end
end
