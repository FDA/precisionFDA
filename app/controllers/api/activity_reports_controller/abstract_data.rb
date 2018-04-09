module Api
  class ActivityReportsController
    # @abstract implement #total, #hourly_data, #daily_data, #monthly_data in a child.
    class AbstractData

      def initialize(start_date, end_date)
        @start_date = start_date
        @end_date = end_date
      end

      def total
        raise NotImplementedError, "#total is't implemented for #{self.class}"
      end

      def hourly_data
        raise NotImplementedError, "#hourly_data is't implemented for #{self.class}"
      end

      def daily_data
        raise NotImplementedError, "#daily_data is't implemented for #{self.class}"
      end

      def monthly_data
        raise NotImplementedError, "#monthly_data is't implemented for #{self.class}"
      end

      def to_hash
        {
          total: total,
          data: data
        }
      end

      private

      attr_reader :start_date, :end_date

      def data
        case grouping_type
        when :month then null_monthly_data.merge(monthly_data).to_a
        when :day   then null_daily_data.merge(daily_data).to_a
        else
          null_hourly_data.merge(hourly_data).to_a
        end
      end

      def null_hourly_data
        (start_date.beginning_of_hour.to_i..end_date.beginning_of_hour.to_i).step(1.hour).map do |timestamp|
          [timestamp * 1000, 0]
        end.to_h
      end

      def null_daily_data
        (start_date.to_date..end_date.to_date).map { |date| [date.to_time.to_i * 1000, 0] }.to_h
      end

      def null_monthly_data
        (start_date.to_date..end_date.to_date)
          .map { |date| date.beginning_of_month.to_time.to_i * 1000 }
          .map { |timestamp| [timestamp, 0] }.to_h
      end

      def grouping_type
        if (end_date.to_i - start_date.to_i) >= 3.months.seconds
          :month
        elsif (end_date.to_i - start_date.to_i) <= 48.hours.seconds
          :hour
        else
          :day
        end
      end

    end
  end
end
