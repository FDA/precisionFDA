require 'rails_helper'

RSpec.describe ChallengesController, type: :controller do

  let(:admin) { create(:user, :admin) }
  let(:user1) { create(:user, dxuser: "user_1") }
  let(:user2) { create(:user, dxuser: "user_2") }
  let(:challenge) { create(:challenge, :open, :skip_validate) }

  before { create(:challenge, :archived, :skip_validate) }

  describe "GET index" do
    context "by a guest" do
      before { authenticate_as_guest! }
      it "doesn't raise a exception" do
        get :index
      end
    end
  end

  describe "GET consistency" do
    context "by a guest" do
      before { authenticate_as_guest! }
      it "doesn't raise a exception" do
        get :consistency
      end
    end
  end

  describe "GET truth" do
    context "by a guest" do
      before { authenticate_as_guest! }
      it "doesn't raise a exception" do
        get :truth
      end
    end
  end

  describe "GET join" do
    context "by a guest" do
      before { authenticate_as_guest! }
      it "doesn't raise a exception" do
        get :join, id: challenge.id
        expect(response).to redirect_to request_access_path
      end
    end
  end

  describe "GET show" do
    context "by a guest" do
      before { authenticate_as_guest! }
      it "doesn't raise a exception" do
        get :show, id: challenge.id
      end
    end
  end

end
