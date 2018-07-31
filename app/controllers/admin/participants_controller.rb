module Admin
  class ParticipantsController < BaseController
    before_action :set_participant, only: [:edit, :update, :destroy]

    def index
      @org_participants = Participant.org.positioned
      @person_participants = Participant.person.positioned
      @invisible_participants = Participant.invisible.positioned
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
      set_js_params(:edit)
    end

    def update
      save_participant(:edit)
    end

    def destroy
      @participant.destroy
      redirect_to admin_participants_path
    end

    def update_positions
      Array.wrap(params['org_participants']).each_with_index do |id, index|
        Participant.update(id, position: index, kind: :org)
      end

      Array.wrap(params['person_participants']).each_with_index do |id, index|
        Participant.update(id, position: index, kind: :person)
      end

      Array.wrap(params['invisible_participants']).each_with_index do |id, index|
        Participant.update(id, position: index, kind: :invisible)
      end

      head :no_content
    end

    private

    def save_participant(action)
      if ParticipantsManager.save(@context, @participant, participant_params)
        redirect_to admin_participants_path
      else
        set_js_params(action)
        render action
      end
    end

    def set_js_params(action)
      js "##{action}", imageUrl: @participant.image_url, fileId: @participant.file_dxid
    end

    def set_participant
      @participant = Participant.find(params[:id])
    end

    def participant_params
      params.require(:participant).permit(:title, :node_dxid, :image_url)
    end

  end
end
