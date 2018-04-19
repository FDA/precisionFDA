class UsageCollector

  class CloudResource

    StorageResult = Struct.new(:consumption, :current_storage)

    class << self

      def daily_consumption(user)
        consumption(1.day.ago, Time.zone.now, user)
      end

      def weekly_consumption(user)
        consumption(1.week.ago, Time.zone.now, user)
      end

      def monthly_consumption(user)
        consumption(1.month.ago, Time.zone.now, user)
      end

      def yearly_consumption(user)
        consumption(1.year.ago, Time.zone.now, user)
      end

      def consumption(date_from, date_to, user)
        result = StorageResult.new(0, storage_at(date_from, user))

        db_data = Event.where(type: %w(Event::FileCreated Event::FileDeleted))
                    .date_range(date_from, date_to)
                    .where(dxuser: user.dxuser)
                    .order(created_at: :asc)
                    .pluck(:created_at, :param1)

        data = [[date_from, 0]] + db_data + [[date_to, 0]]

        data.each_cons(2).each_with_object(result) do |(event1, event2), memo|
          hours = (event2.first.to_i - event1.first.to_i) / 3600.0
          memo.current_storage += event1.last.to_f
          memo.consumption += memo.current_storage * hours
        end

        result.consumption.to_i
      end

      private

      def storage_at(date, user)
        Event::FileCreated.where('created_at < ?', date).where(dxuser: user.dxuser)
          .sum(:file_size).to_i
      end

    end

  end
end
