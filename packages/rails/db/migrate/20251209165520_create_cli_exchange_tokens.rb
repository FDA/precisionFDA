class CreateCliExchangeTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :cli_exchange_tokens do |t|
      t.string :dxid, null: true
      t.string :code, null: false
      t.datetime :expires_at, null: false
      t.string :encrypted_key, limit: 1023, null: false
      t.string :scope, null: false
      t.string :salt, null: false
    end
  end
end
