require 'rails_helper'

RSpec.describe SpacesController, type: :controller do

  let(:admin) { create(:user, :admin) }
  let(:user1) { create(:user, dxuser: "user_1") }
  let(:user2) { create(:user, dxuser: "user_2") }

  let!(:space_params) do
    {
      name: "space_name",
      description: "space_description",
      host_lead_dxuser: host_lead_dxuser,
      guest_lead_dxuser: user2.dxuser,
      space_type: "group"
    }
  end

  describe "POST create" do
    before { authenticate!(admin) }

    context "when data is correct" do
      let(:host_lead_dxuser) { user1.dxuser }

      it "creates a space" do
        post :create, space: space_params
        expect(Space.count).to eq(1)
      end
    end
  end
end
