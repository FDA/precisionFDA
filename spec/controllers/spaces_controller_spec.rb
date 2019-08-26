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

    context "if type is review" do
      it "creates a space" do
        post :create, space: review_space_params

        expect_valid(:space)
        cooperative_space = Space.first
        confidential_space = Space.confidential.first
        expect(Space.count).to eq(2)

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{cooperative_space.host_dxorg}/describe")
        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").with(body: {
          handle: Org.handle_by_id(cooperative_space.host_dxorg),
          name: Org.handle_by_id(cooperative_space.host_dxorg),
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{cooperative_space.guest_dxorg}/describe")
        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").with(body: {
          handle: Org.handle_by_id(cooperative_space.guest_dxorg),
          name: Org.handle_by_id(cooperative_space.guest_dxorg),
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{cooperative_space.host_dxorg}/invite").with(body: {
          invitee: host_lead.dxid,
          level: "ADMIN",
          suppressEmailNotification: true
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{cooperative_space.guest_dxorg}/invite").with(body: {
          invitee: guest_lead.dxid,
          level: "ADMIN",
          suppressEmailNotification: true
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").with(body: {
          name: "precisionfda-space-#{confidential_space.id}-REVIEWER-PRIVATE",
          billTo: review_space_admin.billto,
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{confidential_space.host_project}/invite").with(body: {
          invitee: confidential_space.host_dxorg,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{confidential_space.host_project}/invite").with(body: {
          invitee: Setting.review_app_developers_org,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        })

        expect(cooperative_space.space_memberships.lead.host.count).to eq(1)
        expect(cooperative_space.space_memberships.lead.guest.count).to eq(1)
      end
    end

    context "if type is review and template" do
      let(:app) { create(:app) }
      let(:file) { create(:user_file) }
      let(:template) { create(:space_template, nodes: [app, file]) }

      it "creates a space" do

        post :create, space: review_space_params.merge(space_template_id: template.id)

        last_space = Space.last

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}/clone").with(body: {
          objects: [file.dxid],
          project: last_space.host_project,
        })

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{app.dxid}/addAuthorizedUsers").with(body: {
          authorizedUsers: [last_space.host_dxorg],
        })

        expect_valid(:space)
        cooperative_space = Space.first
        expect(Space.count).to eq(2)
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
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        })
      end

      context "if review space" do

        let(:space) { create(:space, :review, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

        it "adds user to the membership" do
          post :accept, id: space.id

          expect(WebMock).not_to have_requested(:any, /.*/)

          private_space = space.confidential_spaces.reviewer.first
          expect(private_space.space_memberships.count).to eq(1)
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
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true
        })
      end

      context "if review space" do
        let(:space) { create(:space, :review, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

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
            level: "CONTRIBUTE",
            suppressEmailNotification: true,
            suppressAllNotifications: true
          })

          private_space = space.confidential_spaces.sponsor.first

          expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").with(body: {
            name: "precisionfda-space-#{private_space.id}-GUEST-PRIVATE",
            billTo: guest_lead.billto
          })

          expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{private_space.id}-GUEST-PRIVATE/invite").with(body: {
            invitee: private_space.guest_dxorg,
            level: "CONTRIBUTE",
            suppressEmailNotification: true,
            suppressAllNotifications: true
          })

          expect(private_space.space_memberships.count).to eq(1)

          expect(private_space.guest_project).to be_present
          expect(private_space.guest_dxorg).to be_present
        end

      end
    end
  end

  describe "POST invite" do
    let(:space) { create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
    let(:review_space) { create(:space, :review, :accepted, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

    context "by host_admin" do
      before { authenticate!(host_lead) }
      it "invites a user as a contributor" do
        post :invite, id: space.id, space: { invitees: user.dxuser, invitees_role: "contributor" }

        expect(SpaceMembership.where(user_id: user.id).count).to eq(1)
        expect(SpaceMembership.where(user_id: user.id).first.contributor?).to be_truthy

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "MEMBER",
          suppressEmailNotification: true,
          projectAccess: "CONTRIBUTE",
          appAccess: true,
          allowBillableActivities: false,
        })
      end

      it "invites a user as a viewer" do
        post :invite, id: space.id, space: { invitees: user.dxuser, invitees_role: "viewer" }

        expect(SpaceMembership.where(user_id: user.id).count).to eq(1)
        expect(SpaceMembership.where(user_id: user.id).first.viewer?).to be_truthy

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "MEMBER",
          suppressEmailNotification: true,
          projectAccess: "VIEW",
          appAccess: false,
          allowBillableActivities: false,
        })
      end

      it "invites a user as an admin" do
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

      it "invites an user as a contributor" do
        post :invite, id: review_space.id, space: { invitees: user.dxuser, invitees_role: "contributor" }

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{review_space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "MEMBER",
          suppressEmailNotification: true,
          projectAccess: "CONTRIBUTE",
          appAccess: true,
          allowBillableActivities: false,
        })

        expect(review_space.confidential_reviewer_space.space_memberships.count).to eq(2)
      end

      it "invites an user as a viewer" do
        post :invite, id: review_space.id, space: { invitees: user.dxuser, invitees_role: "viewer" }

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{review_space.host_dxorg}/invite").with(body: {
          invitee: user.dxid,
          level: "MEMBER",
          suppressEmailNotification: true,
          projectAccess: "VIEW",
          appAccess: false,
          allowBillableActivities: false,
        })

        expect(review_space.confidential_reviewer_space.space_memberships.count).to eq(2)
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

  describe "jobs" do
    let(:space) { create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
    let(:app) { create(:app, scope: space.id, user_id: host_lead.id) }
    let(:job_one) do
      create(:job, scope: space.id, user_id: host_lead.id, app_id: app.id, state: "running")
    end
    let(:job_two) do
      create(:job, scope: space.id, user_id: host_lead.id, app_id: app.id, state: "done")
    end

    before { authenticate!(host_lead) }
    it "lists jobs" do
      get :jobs, id: space
      expect(response.content_type).to eq "text/html"
      expect(response).to be_successful
    end
  end
end
