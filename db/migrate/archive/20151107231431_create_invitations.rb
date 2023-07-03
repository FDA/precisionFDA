class CreateInvitations < ActiveRecord::Migration[4.2]
  def change
    create_table :invitations do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :org
      t.boolean :singular
      t.string :address
      t.string :phone
      t.string :duns
      t.string :ip

      t.timestamps null: false
    end
  end
end
