require 'rails_helper'

RSpec.describe CommentsController, type: :controller do
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:space) { create(:space, :review, :accepted, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

  describe "create comment in space" do
    before { authenticate!(host_lead) }

    context "create comment without associated obj" do

      it "creates a comment" do
        post :create, space_id: space, comment: { body: "test" }

        expect(Comment.count).to eq(1)
      end

    end

    context "create comment with associated obj" do

      it "creates a comment associated with a note" do
        note = create(:note, scope: "space-#{space.id}")
        post :create, space_id: space, comment: { body: "test" }, comments_content: { content_type: "Note", id: note.id }

        expect(Comment.last.content_object).to eq(note)
      end

      it "creates a replay to a comment associated with a note" do
        note = create(:note, scope: "space-#{space.id}")
        comment = create(:comment, commentable: space, content_object: note, user_id: host_lead.id)
        post :create, space_id: space, comment: { body: "test", parent_id: comment.id }

        expect(Comment.last.content_object).to eq(note)
      end

    end
  end

  describe "DELETE comments" do
    before { authenticate!(host_lead) }

    context "deleted comments are displayed in threads as DELETED" do

      it "destroys a comment in space" do
        post :create, space_id: space, comment: { body: "test" }
        delete :destroy, space_id: space, id: Comment.last.id

        expect(Comment.count).to eq(1)
      end

    end

  end

end
