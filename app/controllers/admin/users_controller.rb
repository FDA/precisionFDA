module Admin
  class UsersController < BaseController

    def active
      date_string = Time.now.strftime("%Y-%m-%d")
      csv_data = UsersCsvExporter.export_active_users

      send_data csv_data,
                disposition: "attachment",
                filename: "active_users_#{date_string}.csv",
                type: "text/csv"
    end

  end
end
