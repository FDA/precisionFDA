module Api
  # Participants API controller.
  class ParticipantsController < BaseController
    skip_before_action :require_api_login

    def index
      orgs = Participant.org.positioned
      orgs = orgs.each { |pnt| pnt.image_url = view_context.image_path(pnt.image_url) }
      persons = Participant.person.positioned
      persons = persons.each { |pnt| pnt.image_url = view_context.image_path(pnt.image_url) }

      render json: { "orgs": orgs, "persons": persons },
             adapter: :json
    end
  end
end
