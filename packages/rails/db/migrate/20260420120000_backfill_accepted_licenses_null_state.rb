class BackfillAcceptedLicensesNullState < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL.squish
      UPDATE accepted_licenses
      SET state = 'active'
      WHERE state IS NULL
    SQL
  end

  def down
    # Not reversible: we cannot distinguish which rows were originally NULL
  end
end
