module Admin
  class ActivityReportsController
    class FilesGenerated < AbstractData

      def total
        collection.sum_by(:file_size).to_i
      end

      def hourly_data
        collection.select_sum(:file_size).group_by_hour.map do |event|
          [event.date.in_time_zone("UTC").to_i * 1000, event.file_size.to_i]
        end.to_h
      end

      def daily_data
        collection.select_sum(:file_size).group_by_day.map do |event|
          [event.date.to_time.to_i * 1000, event.file_size.to_i]
        end.to_h
      end

      def monthly_data
        collection.select_sum(:file_size).group_by_month.map do |event|
          [event.date.to_time.to_i * 1000, event.file_size.to_i]
        end.to_h
      end

      private

      def collection
        Event::FileCreated.with_parent_type_job.date_range(start_date, end_date)
      end

    end
  end
end
