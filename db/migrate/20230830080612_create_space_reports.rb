class CreateSpaceReports < ActiveRecord::Migration[6.1]
  def change
    create_table :space_reports do |t|
      t.integer :space_id, required: true
      t.integer :result_file_id
      t.string :state, default: "CREATED"
      t.integer :created_by, required: true
      t.timestamps null: false
    end
    add_foreign_key "space_reports", "spaces", column: "space_id"
    add_foreign_key "space_reports", "nodes", column: "result_file_id"
    add_foreign_key "space_reports", "users", column: "created_by"
    add_index "space_reports", "created_at"

    create_table :space_report_parts do |t|
      t.bigint :space_report_id, required: true
      t.integer :source_id, required: true
      t.string :source_type, required: true
      t.json :result
      t.string :state, default: "CREATED"
      t.timestamps null: false
    end
    add_foreign_key "space_report_parts", "space_reports", column: "space_report_id", on_delete: :cascade
  end
end
