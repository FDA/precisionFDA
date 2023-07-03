class CreateProfiles < ActiveRecord::Migration[4.2]
  def change
    create_table :profiles do |t|
      t.string :address1
      t.string :address2
      t.string :city
      t.string :country
      t.string :email
      t.boolean :email_confirmed, default: false
      t.string :postal_code
      t.string :phone
      t.boolean :phone_confirmed, default: false
      t.string :phone_country_code
      t.string :us_state
      t.references :user, index: true, foreign_key: true
    end

    reversible do |dir|
      dir.up { copy_users_contacts_to_profile }
    end
  end

  def copy_users_contacts_to_profile
    User.includes(:invitation).find_each do |user|
     invitation = user.invitation
     attributes = { user_id: user.id }
     attributes[:email] = user.normalized_email unless Profile.exists?(email: user.normalized_email)
     if invitation
       attributes[:address1] = invitation.address
       attributes[:phone] = invitation.phone
     end
     next if user.profile.present?
     profile = Profile.new(attributes)
     profile.save(validate: false)
    end
  end
end
