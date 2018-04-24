module Admin
  class ActivityReportsController
    class AppsRun < AbstractData

      def total
        collection.first.count
      end

      def hourly_data
        collection.group_by_hour.map do |event|
          [event.date.in_time_zone("UTC").to_i * 1000, event.count.to_i]
        end.to_h
      end

      def daily_data
        collection.group_by_day.map do |event|
          [event.date.to_time.to_i * 1000, event.count.to_i]
        end.to_h
      end

      def monthly_data
        collection.group_by_month.map do |event|
          [event.date.to_time.to_i * 1000, event.count.to_i]
        end.to_h
      end

      private

      def collection
        Event::JobRun.date_range(start_date, end_date).select_count_uniq_by(:app_dxid)
      end

    end
  end
end
