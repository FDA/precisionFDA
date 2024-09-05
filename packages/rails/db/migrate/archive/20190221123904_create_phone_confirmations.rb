class CreatePhoneConfirmations < ActiveRecord::Migration[4.2]
  def change
    create_table :phone_confirmations do |t|
      t.string :number, null: false
      t.string :code, null: false
      t.datetime :expired_at, null: false
    end
  end
end
