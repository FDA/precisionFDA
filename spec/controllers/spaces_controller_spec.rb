require 'rails_helper'

RSpec.describe SpacesController, type: :controller do
  let(:admin) { create(:user, :admin) }
  let(:review_space_admin) { create(:user, :review_admin) }
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:user) { create(:user, dxuser: "user_3") }
  let(:org) { create(:org, admin_id: guest_lead.id) }

  let(:space_params) do
    {
      name: "space_name",
      description: "space_description",
      host_lead_dxuser: host_lead.dxuser,
      guest_lead_dxuser: guest_lead.dxuser,
      space_type: "groups"
    }
  end

  let(:review_space_params) do
    {
      name: "space_name",
      description: "space_description",
      host_lead_dxuser: host_lead.dxuser,
      guest_lead_dxuser: guest_lead.dxuser,
      space_type: "review",
      sponsor_org_handle: org.handle,
    }
  end

  describe "POST create" do
    before { authenticate!(review_space_admin) }

    context "when data is correct" do
      it "creates a space" do
        post :create, space: space_params

        last_space = Space.last
        expect(Space.count).to eq(1)

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.host_dxorg}/describe")
        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").with(body: {
          handle: Org.handle_by_id(last_space.host_dxorg),
          name: Org.handle_by_id(last_space.host_dxorg),
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.guest_dxorg}/describe")
        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").with(body: {
          handle: Org.handle_by_id(last_space.guest_dxorg),
          name: Org.handle_by_id(last_space.guest_dxorg),
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

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.host_dxorg}/removeMember").with(body: {
          user: ADMIN_USER
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.guest_dxorg}/removeMember").with(body: {
          user: ADMIN_USER
        })

        expect(last_space.space_memberships.lead.host.count).to eq(1)
        expect(last_space.space_memberships.lead.guest.count).to eq(1)
      end
    end

    context "if review space" do

      it "creates a space" do
        post :create, space: review_space_params

        expect_valid(:space)
        last_space = Space.last
        expect(Space.count).to eq(1)

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.host_dxorg}/describe")
        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").with(body: {
          handle: Org.handle_by_id(last_space.host_dxorg),
          name: Org.handle_by_id(last_space.host_dxorg),
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.guest_dxorg}/describe")
        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").with(body: {
          handle: Org.handle_by_id(last_space.guest_dxorg),
          name: Org.handle_by_id(last_space.guest_dxorg),
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

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.guest_dxorg}/removeMember").with(body: {
          user: ADMIN_USER
        })

        expect(last_space.space_memberships.lead.host.count).to eq(1)
        expect(last_space.space_memberships.lead.guest.count).to eq(1)
      end

    end
  end

  describe "POST accept" do
    let(:space) { create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

    context "by host_admin" do
      before { authenticate!(host_lead) }

      it "creates a dnanexus project" do
        post :accept, id: space.id

        space.reload
        expect(space.host_project).to be_present

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

      context "if review space" do

        let(:space) { create(:space, :review, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

        it "creates a dnanexus project" do
          post :accept, id: space.id

          space.reload
          expect(space.host_project).to be_present

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

          private_space = space.confidential_spaces.first

          expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").with(body: {
            name: "precisionfda-space-#{private_space.id}-HOST-PRIVATE",
            billTo: host_lead.billto
          })

          expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{private_space.id}-HOST-PRIVATE/invite").with(body: {
            invitee: private_space.host_dxorg,
            level: "CONTRIBUTE",
            suppressEmailNotification: true,
            suppressAllNotifications: true
          })

          expect(private_space.space_memberships.count).to eq(1)

          expect(private_space.host_project).to be_present
          expect(private_space.host_dxorg).to be_present
        end

      end
    end

    context "by guest_admin" do
      before { authenticate!(guest_lead) }

      it "creates a dnanexus project" do
        post :accept, id: space.id

        space.reload
        expect(space.guest_project).to be_present

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
    let(:review_space) { create(:space, :review, :accepted, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

    context "by host_admin" do
      before { authenticate!(host_lead) }
      it "invites an user as a member" do
        post :invite, id: space.id, space: { invitees: user.dxuser, invitees_role: "member" }
        post :invite, id: space.id, space: { invitees: user.dxuser, invitees_role: "admin" }
        post :invite, id: space.id, space: { invitees: user.dxuser, invitees_role: "member" }

        expect(SpaceMembership.where(user_id: user.id).count).to eq(1)
        expect(SpaceMembership.where(user_id: user.id).first.member?).to be_truthy

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "MEMBER",
          suppressEmailNotification: true
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/setMemberAccess").with(body: {
          user.dxid => { level: "ADMIN" }
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/setMemberAccess").with(body: {
          user.dxid => { level: "MEMBER", allowBillableActivities: false, appAccess: true, projectAccess: "CONTRIBUTE" }
        })
      end

      it "invites an user as an admin" do
        post :invite, id: space.id, space: { invitees: user.dxuser, invitees_role: "admin" }

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "ADMIN",
          suppressEmailNotification: true
        })
      end
    end

    context "if review space" do
      before { authenticate!(host_lead) }

      it "invites an user as a member" do
        post :invite, id: review_space.id, space: { invitees: user.dxuser, invitees_role: "member" }

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{review_space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "MEMBER",
          suppressEmailNotification: true
        })

        expect(review_space.confidential_reviewer_space.space_memberships.count ).to eq(2)
      end
    end
  end

  describe "tasks" do
    let(:space) { create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

    context "by host_admin" do
      before { authenticate!(host_lead) }
      it "lists tasks" do
        get :tasks, id: space

        expect(response).to be_successful
      end
    end
  end
end
