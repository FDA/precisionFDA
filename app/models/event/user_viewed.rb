class Event::UserViewed < Event

  event_attribute :identifier, db_column: :param1
  event_attribute :guest, db_column: :param2
  event_attribute :number, db_column: :param3
  event_attribute :dxuser
  event_attribute :org_handle

  class << self

    def create(context)
      return if !context.guest? && !context.logged_in?

      update_result = where(param1: identifier_for(context)).where("created_at > ?", 1.hour.ago )
        .update_all("param3 = param3 + 1")

      super(data_for(context)) if update_result.zero?
    end

    private

    def data_for(context)
      if context.guest?
        {
          identifier: identifier_for(context),
          guest: true,
          number: 0
        }
      else
        {
          identifier: identifier_for(context),
          guest: false,
          dxuser: context.user.dxuser,
          org_handle: context.user.org.handle,
          number: 0
        }
      end
    end

    def identifier_for(context)
      if context.guest?
        context.username
      else
        context.user.dxuser
      end
    end

  end

end
