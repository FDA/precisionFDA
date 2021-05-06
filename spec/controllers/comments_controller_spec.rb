require 'rails_helper'

RSpec.describe CommentsController, type: :controller do
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:space) { create(:space, :review, :accepted, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
  let(:node_client) { instance_double(HttpsAppsClient) }

  describe "create comment in space" do
    before do
      authenticate!(host_lead)
      allow(HttpsAppsClient).to receive(:new).and_return(node_client)
      allow(node_client).to receive(:email_send).and_return({})
    end

    context "create comment without associated obj" do

      it "creates a comment" do
        post :create, params: { space_id: space, comment: { body: "test" } }

        expect(Comment.count).to eq(1)
      end

    end

    context "create comment and trigger notification" do
      it "triggers notification email" do
        post :create, params: { space_id: space, comment: { body: "test" } }

        space_events = SpaceEvent.all
        expect(space_events.count).to eq(1)
        email_type_id = NotificationPreference.email_types[:notification_comment]
        expect(node_client).to have_received(:email_send).with(email_type_id, { spaceEventId: space_events.first.id })
      end
    end

    context "create comment with associated obj" do

      it "creates a comment associated with a note" do
        note = create(:note, scope: "space-#{space.id}")
        post :create, params: { space_id: space, comment: { body: "test" }, comments_content: { content_type: "Note", id: note.id } }

        expect(Comment.last.content_object).to eq(note)
      end

      it "creates a replay to a comment associated with a note" do
        note = create(:note, scope: "space-#{space.id}")
        comment = create(:comment, commentable: space, content_object: note, user_id: host_lead.id)
        post :create, params: { space_id: space, comment: { body: "test", parent_id: comment.id } }

        expect(Comment.last.content_object).to eq(note)
      end

    end
  end

  describe "DELETE comments" do
    before do
      authenticate!(host_lead)
      allow(HttpsAppsClient).to receive(:new).and_return(node_client)
      allow(node_client).to receive(:email_send).and_return({})
    end

    context "deleted comments are displayed in threads as DELETED" do

      it "destroys a comment in space" do
        post :create, params: { space_id: space, comment: { body: "test" } }
        delete :destroy, params: { space_id: space, id: Comment.last.id }

        expect(Comment.count).to eq(1)
      end

    end

  end

end
