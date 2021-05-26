require "rails_helper"

RSpec.describe SpacesController, type: :controller do
  let(:admin) { create(:user, :admin) }
  let(:review_space_admin) { create(:user, :review_admin) }
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:user) { create(:user, dxuser: "user_3") }
  let(:sponsor_lead) { create(:user, dxuser: "user_4") }
  let(:org) { create(:org, admin_id: guest_lead.id) }

  let(:space_params) do
    {
      name: "space_name",
      description: "space_description",
      host_lead_dxuser: host_lead.dxuser,
      guest_lead_dxuser: guest_lead.dxuser,
      space_type: "groups",
    }
  end

  let(:review_space_params) do
    {
      name: "space_name",
      description: "space_description",
      host_lead_dxuser: host_lead.dxuser,
      guest_lead_dxuser: guest_lead.dxuser,
      space_type: "review",
      sponsor_lead_dxuser: sponsor_lead.dxuser,
    }
  end

  let(:node_client) { instance_double(HttpsAppsClient) }

  describe "POST invite" do
    let(:space) do
      create(:space, :group, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
    end

    let(:review_space) do
      create(:space, :review, :accepted, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
    end

    let(:member_contribute_invite) do
      {
        invitee: user.dxid,
        level: "MEMBER",
        suppressEmailNotification: true,
        projectAccess: "CONTRIBUTE",
        appAccess: true,
        allowBillableActivities: false,
      }
    end

    let(:member_view_invite) do
      {
        invitee: user.dxid,
        level: "MEMBER",
        suppressEmailNotification: true,
        projectAccess: "VIEW",
        appAccess: false,
        allowBillableActivities: false,
      }
    end

    context "with host_admin" do
      before do
        authenticate!(host_lead)
        allow(HttpsAppsClient).to receive(:new).and_return(node_client)
        allow(node_client).to receive(:email_send).and_return({})
      end

      it "invites a user as a contributor" do
        post :invite, params: {
          id: space.id,
          space: {
            invitees: user.dxuser,
            invitees_role: "contributor",
            side: SpaceMembership::SIDE_HOST,
          },
        }
        be_contributor = SpaceMembership.where(user_id: user.id).first.contributor?

        expect(SpaceMembership.where(user_id: user.id).count).to eq(1)
        expect(be_contributor).to be_truthy

        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").
          with(body: member_contribute_invite)
      end

      it "invites a user as a viewer" do
        post :invite, params: {
          id: space.id,
          space: {
            invitees: user.dxuser,
            invitees_role: "viewer",
            side: SpaceMembership::SIDE_HOST,
          },
        }
        be_viewer = SpaceMembership.where(user_id: user.id).first.viewer?

        expect(SpaceMembership.where(user_id: user.id).count).to eq(1)
        expect(be_viewer).to be_truthy

        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").
          with(body: member_view_invite)
      end

      it "invites a user as an admin" do
        post :invite, params: {
          id: space.id,
          space: {
            invitees: user.dxuser,
            invitees_role: "admin",
            side: SpaceMembership::SIDE_HOST,
          },
        }

        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").
          with(
            body: {
              invitee: user.dxid,
              level: "ADMIN",
              suppressEmailNotification: true,
            },
          )
      end

      it "triggers email notification" do
        post :invite, params: {
          id: space.id,
          space: { invitees: user.dxuser, invitees_role: "admin" },
        }

        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").
          with(
            body: {
              invitee: user.dxid,
              level: "ADMIN",
              suppressEmailNotification: true,
            },
          )
        expect(node_client).to have_received(:email_send)
      end
    end

    context "when review space" do
      before do
        authenticate!(host_lead)
        allow(HttpsAppsClient).to receive(:new).and_return(node_client)
        allow(node_client).to receive(:email_send).and_return({})
      end

      it "invites an user as a contributor" do
        post :invite, params: {
          id: review_space.id,
          space: {
            invitees: user.dxuser,
            invitees_role: "contributor",
            side: SpaceMembership::SIDE_HOST,
          },
        }

        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{review_space.host_dxorg}/invite").
          with(body: member_contribute_invite)

        expect(review_space.confidential_reviewer_space.space_memberships.count).to eq(2)
      end

      it "invites an user as a viewer" do
        post :invite, params: {
          id: review_space.id,
          space: {
            invitees: user.dxuser,
            invitees_role: "viewer",
            side: SpaceMembership::SIDE_HOST,
          },
        }

        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{review_space.host_dxorg}/invite").
          with(body: member_view_invite)

        expect(review_space.confidential_reviewer_space.space_memberships.count).to eq(2)
      end

      it "triggers email notification" do
        post :invite, params: {
          id: review_space.id,
          space: { invitees: user.dxuser, invitees_role: "viewer" },
        }

        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{review_space.host_dxorg}/invite").
          with(body: member_view_invite)

        expect(node_client).to have_received(:email_send)
      end
    end
  end

  describe "tasks" do
    let(:space) do
      create(:space, :group, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
    end

    context "when host_admin" do
      before { authenticate!(host_lead) }

      it "lists tasks" do
        get :tasks, params: { id: space }

        expect(response).to be_successful
      end
    end
  end
end
