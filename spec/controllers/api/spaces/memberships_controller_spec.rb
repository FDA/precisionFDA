RSpec.shared_examples "callable" do
  before do
    allow(membership_service).to receive(:call).and_call_original

    post :update, params: {
      space_id: space.id, id: space_membership.id, role: role
    }
  end

  it "calls appropriate membership service" do
    expect(membership_service).to have_received(:call)
  end
end

RSpec.describe Api::Spaces::MembershipsController, type: :controller do
  let(:host_lead) { create(:user, dxuser: "host_lead") }
  let(:guest_lead) { create(:user, dxuser: "guest_lead") }
  let(:viewer) { create(:user, dxuser: "viewer") }

  let(:space) do
    create(:space, :review, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
  end

  let(:space_membership) do
    create(
      :space_membership,
      :host,
      :viewer,
      spaces: [space],
      user: viewer,
    )
  end

  let(:valid_role) { SpaceMembership::ROLE_CONTRIBUTOR }

  describe "PUT update" do
    # before do
    #   create(:space_membership, :lead, :host, spaces: [space], user: host_lead)
    # end

    context "when user is authenticated" do
      before do
        authenticate!(host_lead)
      end

      context "when role param is invalid" do
        it "responds with an error" do
          post :update, params: { space_id: space.id, id: space_membership.id, role: "invalid" }

          expect(response).to be_unprocessable
        end
      end

      context "when role param is valid" do
        it "responds with a success" do
          post :update, params: {
            space_id: space.id, id: space_membership.id, role: valid_role
          }

          expect(response).to be_successful
        end
      end

      context "when user is not allowed to change member role" do
        let(:another_user) { create(:user, dxuser: "another") }

        let(:space) do
          create(:space, :review, host_lead_id: another_user.id, guest_lead_id: guest_lead.id)
        end

        it "responds with an error" do
          post :update, params: {
            space_id: space.id, id: space_membership.id, role: valid_role
          }

          expect(response).to be_forbidden
        end
      end

      context "when change role to a viewer" do
        it_behaves_like "callable" do
          let(:role) { SpaceMembership::ROLE_VIEWER }
          let(:membership_service) { SpaceMembershipService::ToViewer }
        end
      end

      context "when change role to a contributor" do
        it_behaves_like "callable" do
          let(:role) { SpaceMembership::ROLE_CONTRIBUTOR }
          let(:membership_service) { SpaceMembershipService::ToContributor }
        end
      end

      context "when change role to a lead" do
        it_behaves_like "callable" do
          let(:role) { SpaceMembership::ROLE_LEAD }
          let(:membership_service) { SpaceMembershipService::ToLead }
        end
      end

      context "when change role to an admin" do
        it_behaves_like "callable" do
          let(:role) { SpaceMembership::ROLE_ADMIN }
          let(:membership_service) { SpaceMembershipService::ToAdmin }
        end
      end

      context "when disable member" do
        it_behaves_like "callable" do
          let(:role) { "disable" }
          let(:membership_service) { SpaceMembershipService::ToDisable }
        end
      end
    end

    context "when user is not authenticated" do
      it "responds with forbidden" do
        post :update, params: { space_id: 1, id: 1 }

        expect(response).to be_unauthorized
      end
    end
  end
end
