module Admin
  class ParticipantsController < BaseController
    before_action :set_participant, only: [:edit, :update, :destroy]

    def index
      participants = assign_image_urls!(Participant.positioned)

      @org_participants, @person_participants, @invisible_participants =
        participants.group_by(&:kind).fetch_values("org", "person", "invisible") { [] }

      js org_participants: @org_participants,
         person_participants: @person_participants,
         invisible_participants: @invisible_participants
    end

    def new
      @participant = Participant.new
    end

    def create
      @participant = Participant.new
      save_participant(:new)
    end

    def edit
      js_params(:edit)
    end

    def update
      save_participant(:edit)
    end

    def destroy
      @participant.destroy
      redirect_to admin_participants_path
    end

    def update_positions
      Array.wrap(unsafe_params[:org_participants]).each_with_index do |id, index|
        Participant.update(id, position: index, kind: :org)
      end

      Array.wrap(unsafe_params[:person_participants]).each_with_index do |id, index|
        Participant.update(id, position: index, kind: :person)
      end

      Array.wrap(unsafe_params[:invisible_participants]).each_with_index do |id, index|
        Participant.update(id, position: index, kind: :invisible)
      end

      head :no_content
    end

    private

    # Sets image paths for participants.
    # @param participants [Participant::ActiveRecord_Relation, Array<Participant>] Participants.
    def assign_image_urls!(participants)
      participants.each { |pnt| pnt.image_url = view_context.image_path(pnt.image_url) }
      participants
    end

    def save_participant(action)
      if ParticipantsManager.save(@context, @participant, participant_params)
        redirect_to admin_participants_path
      else
        js_params(action)
        render action
      end
    end

    def js_params(action)
      js "##{action}", imageUrl: view_context.image_path(@participant.image_url),
        fileId: @participant.file&.uid
    end

    def set_participant
      @participant = Participant.find(unsafe_params[:id])
    end

    def participant_params
      params.require(:participant).permit(:title, :node_dxid, :image_url)
    end
  end
end
