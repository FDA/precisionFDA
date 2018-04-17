class Event::UserViewed < Event
  alias_attribute :request_path, :param1
  alias_attribute :guest, :param2

  class << self
    def create_for(context, request_path)
      return if !context.guest? && !context.logged_in?

      create(
        guest: context.guest?,
        dxuser: identifier_for(context),
        org_handle: context.guest? ? nil : context.user.org.handle,
        request_path: request_path,
      )
    end

    private

    def identifier_for(context)
      if context.guest?
        context.username
      else
        context.user.dxuser
      end
    end
  end
end
