class AddFormatAndOptionsColumnsToSpaceReports < ActiveRecord::Migration[6.1]
  def change
    add_column :space_reports, :options, :json
    add_column :space_reports, :format, :string, default: "HTML"
  end
end
