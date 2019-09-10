require "rails_helper"

RSpec.describe Admin::ParticipantsController, type: :controller do
  let(:site_admin) { create(:user, :admin, dxuser: "user_admin") }

  describe "participants actions" do
    before do
      authenticate!(site_admin)
      allow_any_instance_of(Admin::BaseController).to receive(:check_admin).and_return(true)
    end

    context "with site_admin" do
      let(:file) { create(:user_file) }
      let(:file_two) { create(:user_file) }
      let(:file_two_url) { FFaker::Internet.uri("https") }
      let(:participant) { create(:participant) }

      it "shows all participants" do
        get :index

        expect(response).to have_http_status(200)
      end

      it "edit participant" do
        post :edit, params: { id: participant.id }

        expect(response).to have_http_status(200)
      end

      it "updates participant title" do
        post :update, params: {
              id: participant.id,
              participant: {
                title: "updated_title",
                node_dxid: file.uid,
                image_url: participant.image_url,
              }
            }
        updated_participant = Participant.find(participant.id)

        expect(response).to redirect_to("/admin/participants")
        expect(response).to have_http_status(302)
        expect(updated_participant.title).to eq "updated_title"
      end

      it "updates participant image file" do
        post :update, params: {
              id: participant.id,
              participant: {
                title: participant.title,
                node_dxid: file_two.uid,
                image_url: file_two_url,
              }
            }
        updated_participant = Participant.find(participant.id)

        expect(response).to redirect_to("/admin/participants")
        expect(response).to have_http_status(302)
        expect(updated_participant.image_url).to eq file_two_url
      end
    end
  end
end
