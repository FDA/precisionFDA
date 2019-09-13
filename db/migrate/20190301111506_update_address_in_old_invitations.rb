class UpdateAddressInOldInvitations < ActiveRecord::Migration[4.2]
  def change
    Invitation.find_each do |item|
      if item.address1.nil? && item.address.present?
        item.address1 = item.address
        item.save(validate: false)
      end
    end
  end
end
