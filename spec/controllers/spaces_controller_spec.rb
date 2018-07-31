require 'rails_helper'

RSpec.describe SpacesController, type: :controller do

  let(:admin) { create(:user, :admin) }
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:user) { create(:user, dxuser: "user_3") }

  let(:space_params) do
    {
      name: "space_name",
      description: "space_description",
      host_lead_dxuser: host_lead.dxuser,
      guest_lead_dxuser: guest_lead.dxuser,
      space_type: "group"
    }
  end

  describe "POST create" do
    before { authenticate!(admin) }

    context "when data is correct" do
      it "creates a space" do
        post :create, space: space_params

        last_space = Space.last
        expect(Space.count).to eq(1)

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").with(body: {
          handle: last_space.host_dxorghandle,
          name: last_space.host_dxorghandle
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").with(body: {
          handle: last_space.guest_dxorghandle,
          name: last_space.guest_dxorghandle
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.host_dxorg}/invite").with(body: {
          invitee: host_lead.dxid,
          level: "ADMIN",
          suppressEmailNotification: true
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.guest_dxorg}/invite").with(body: {
          invitee: guest_lead.dxid,
          level: "ADMIN",
          suppressEmailNotification: true
        })
      end
    end
  end

  describe "POST accept" do
    let(:space) { create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

    context "by host_admin" do
      before { authenticate!(host_lead) }

      it "creates a dnanexus project" do
        post :accept, id: space.id

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").with(body: {
          name: "precisionfda-space-#{space.id}-HOST",
          billTo: host_lead.billto
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-HOST/invite").with(body: {
          invitee: space.host_dxorg,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-HOST/invite").with(body: {
          invitee: space.guest_dxorg,
          level: "VIEW",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        })
      end
    end

    context "by guest_admin" do
      before { authenticate!(guest_lead) }

      it "creates a dnanexus project" do
        post :accept, id: space.id

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").with(body: {
          name: "precisionfda-space-#{space.id}-GUEST",
          billTo: guest_lead.billto
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-GUEST/invite").with(body: {
          invitee: space.guest_dxorg,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-GUEST/invite").with(body: {
          invitee: space.host_dxorg,
          level: "VIEW",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        })
      end
    end
  end

  describe "POST invite" do
    let(:space) { create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

    context "by host_admin" do
      before { authenticate!(host_lead) }
      it "invites an user as a member" do
        post :invite, id: space.id, space: { invitees: user.dxuser, invitees_role: "MEMBER" }

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "MEMBER",
          suppressEmailNotification: true
        })
      end

      it "invites an user as an admin" do
        post :invite, id: space.id, space: { invitees: user.dxuser, invitees_role: "ADMIN" }

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "ADMIN",
          suppressEmailNotification: true
        })
      end
    end
  end

end
