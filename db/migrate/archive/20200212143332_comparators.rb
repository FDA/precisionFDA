class Comparators < ActiveRecord::Migration[5.2]
  def change
    change_table :comparisons, bulk: true do |t|
      t.string :app_dxid
      t.text :run_input
    end

    reversible do |dir|
      dir.up do
        query = ActiveRecord::Base.sanitize_sql(
          ["UPDATE comparisons SET app_dxid = ?", DEFAULT_COMPARISON_APP],
        )

        ActiveRecord::Base.connection.execute(query)

        change_column_null :comparisons, :app_dxid, false
      end
    end
  end
end
