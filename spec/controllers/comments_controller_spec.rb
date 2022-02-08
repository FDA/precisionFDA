require 'rails_helper'

RSpec.describe CommentsController, type: :controller do
  let(:user) { create(:user, dxuser: "user_1") }
  let(:space) { create(:space, :review, :active, host_lead_id: user.id) }
  let(:node_client) { instance_double(HttpsAppsClient) }

  before do
    authenticate!(user)
    allow(HttpsAppsClient).to receive(:new).and_return(node_client)
    allow(node_client).to receive(:email_send).and_return({})
  end

  describe "create comment" do
    it "triggers notification email" do
      note = create(:note, scope: "space-#{space.id}")
      post :create, params: { note_id: note.id, comment: { body: "test" } }
      space_events = SpaceEvent.all
      expect(space_events.count).to eq(1)
      email_type_id = NotificationPreference.email_types[:notification_comment]
      expect(node_client).to have_received(:email_send).with(email_type_id, {
        spaceEventId: space_events.first.id,
      })
    end

    context "create comment with associated obj" do
      it "creates a comment associated with a note" do
        note = create(:note, scope: "space-#{space.id}")
        post :create, params: { note_id: note.id, comment: { body: "test" } }
        expect(Comment.last.content_object).to eq(note)
      end
    end
  end

  describe "DELETE comments" do
    it "destroys a comment" do
      file = create(:user_file, user: user)
      comment = create(:comment, commentable: file, user: user)
      expect { delete :destroy, params: { file_id: file.uid, id: comment.id } }.to \
        change(Comment, :count).from(1).to(0)
    end
  end
end
