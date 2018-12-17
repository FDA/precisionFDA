class SpaceFeedController
  class SpaceEvents

    def initialize(start_date, end_date, filter_params)
      @start_date = start_date
      @end_date = end_date
      @filter_params = filter_params
    end

    def to_hash
      {
        data: data
      }
    end

    private

    attr_reader :start_date, :end_date, :filter_params

    def collection
      @collection ||= SpaceEvent.collection(start_date, end_date, filter_params)
    end

    def objects_list
      collection.pluck(:object_type).uniq.sort
    end

    def data
      objects_list.map do |type|
        object_type = SpaceEvent::OBJECT_TYPES[type]
        {
          name: object_type,
          data: object_type_dates(object_type)
        }
      end
    end

    def object_type_dates(object_type)
      case grouping_type
      when :month
        null_monthly_data.merge(monthly_data(object_type)).to_a
      when :day
        null_daily_data.merge(daily_data(object_type)).to_a
      else
        null_hourly_data.merge(hourly_data(object_type)).to_a
      end
    end

    def hourly_data(object_type)
      collection.send(object_type).select_count.group_by_hour.map do |event|
        [event.date.in_time_zone("UTC").to_i * 1000, event.count.to_i]
      end.to_h
    end

    def daily_data(object_type)
      collection.send(object_type).select_count.group_by_day.map do |event|
        [event.date.to_time.to_i * 1000, event.count.to_i]
      end.to_h
    end

    def monthly_data(object_type)
      collection.send(object_type).select_count.group_by_month.map do |event|
        [event.date.to_time.to_i * 1000, event.count.to_i]
      end.to_h
    end

    def null_hourly_data
      (find_start_date.beginning_of_hour.to_i..end_date.beginning_of_hour.to_i).step(1.hour).map do |timestamp|
        [timestamp * 1000, 0]
      end.to_h
    end

    def null_daily_data
      (find_start_date.to_date..end_date.to_date).map { |date| [date.to_time.to_i * 1000, 0] }.to_h
    end

    def null_monthly_data
      (find_start_date.to_date..end_date.to_date)
        .map { |date| date.beginning_of_month.to_time.to_i * 1000 }
        .map { |timestamp| [timestamp, 0] }.to_h
    end

    def grouping_type
      if (end_date.to_i - find_start_date.to_i) >= 3.months.seconds
        :month
      elsif (end_date.to_i - find_start_date.to_i) <= 24.hours.seconds
        :hour
      else
        :day
      end
    end

    def find_start_date
      if start_date
        start_date
      else
        collection.order(created_at: :asc).first.created_at
      end
    end
  end
end
