class CreateDbClusters < ActiveRecord::Migration[6.0]
  def change
    create_table :dbclusters do |t|
      t.string :dxid, null: false, index: { unique: true }
      t.string :name, null: false
      t.integer :status, null: false
      t.string :scope, null: false
      t.references :user, null: false, index: true, foreign_key: true, type: :integer
      t.string :project, null: false
      t.string :dx_instance_class, null: false
      t.integer :engine, null: false
      t.string :engine_version, null: false
      t.string :host
      t.string :port
      t.string :description
      t.datetime :status_as_of
      t.string :uid, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
