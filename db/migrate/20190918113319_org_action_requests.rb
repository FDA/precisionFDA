class OrgActionRequests < ActiveRecord::Migration[5.2]
  def change
    create_table :org_action_requests do |t|
      t.references :org, type: :integer, null: false, foreign_key: true
      t.references :initiator, type: :integer, null: false, foreign_key: { to_table: :users }
      t.string :action_type, null: false
      t.string :state, null: false
      t.references :member, type: :integer, foreign_key: { to_table: :users }
      t.datetime :created_at, null: false
      t.references :approver, type: :integer, foreign_key: { to_table: :users }
      t.datetime :approved_at
      t.datetime :resolved_at
      t.text :info
    end
  end
end
