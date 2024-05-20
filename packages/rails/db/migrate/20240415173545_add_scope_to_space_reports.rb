class AddScopeToSpaceReports < ActiveRecord::Migration[6.1]
  def up
    add_column :space_reports, :scope, :string

    SpaceReport.update_all("scope = CONCAT('space-', space_id)")  # rubocop:disable Rails/SkipsModelValidations

    remove_foreign_key :space_reports, column: :space_id

    remove_column :space_reports, :space_id

    change_column :space_reports, :scope, :string, null: false
  end

  def down
    add_column :space_reports, :space_id, :integer

    execute <<-SQL.squish
      UPDATE space_reports
      SET space_id = CAST(SUBSTRING_INDEX(scope, '-', -1) AS UNSIGNED INTEGER)
    SQL

    add_foreign_key "space_reports", "spaces", column: "space_id"

    remove_column :space_reports, :scope
  end
end
