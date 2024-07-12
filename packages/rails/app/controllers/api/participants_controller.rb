module Api
  # Participants API controller.
  class ParticipantsController < BaseController
    skip_before_action :require_api_login

    def index
      orgs = Participant.org.positioned
      orgs = orgs.each { |pnt| pnt.image_url = view_context.image_path(pnt.image_url) }

      render json: { "orgs": orgs },
             adapter: :json
    end
  end
end
