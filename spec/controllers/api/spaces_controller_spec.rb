RSpec.describe Api::SpacesController, type: :controller do
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

  describe "POST add_data" do
    let(:space) { create(:space, :review, :active, host_lead_id: user.id) }
    let(:copy_service) { instance_double(CopyService, copy: []) }

    before do
      authenticate!(user)

      allow(CopyService).to receive(:new).and_return(copy_service)
    end

    it "copies files" do
      file = create(:user_file, :private, user: user)
      folder = create(:folder, scope: space.scope, scoped_parent_folder_id: nil)

      allow(FileCopyWorker).to receive(:perform_async)

      post :add_data, params: { id: space.id, uids: [file.uid], folder_id: folder.id }, as: :json

      expect(FileCopyWorker).to have_received(:perform_async).
        with(space.scope, [file.id], folder.id, anything)
      expect(response).to be_successful
    end

    it "copies apps" do
      apps = create_list(:app, 2, user: user)

      post :add_data, params: { id: space.id, uids: apps.map(&:uid) }

      expect(response).to be_successful

      apps.each do |app|
        expect(copy_service).to have_received(:copy).with(app, space.scope).exactly(1).times
      end
    end

    it "copies workflows" do
      workflows = create_list(:workflow, 2, user: user)

      post :add_data, params: { id: space.id, uids: workflows.map(&:uid) }

      expect(response).to be_successful

      workflows.each do |workflow|
        expect(copy_service).to have_received(:copy).with(workflow, space.scope).exactly(1).times
      end
    end
  end

  describe "POST create" do
    before do
      authenticate!(review_space_admin)
      sponsor_lead.org.update(admin_id: sponsor_lead.id)
    end

    context "when data is correct" do
      before { post :create, params: { space: space_params } }

      let(:last_space) { Space.last }

      it "creates a space" do
        expect(Space.count).to eq(1)
      end

      it "creates a host org" do
        expect(WebMock).to have_requested(
          :post,
          "#{DNANEXUS_APISERVER_URI}#{last_space.host_dxorg}/describe",
        )
        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").
          with(
            body: {
              handle: Org.handle_by_id(last_space.host_dxorg),
              name: Org.handle_by_id(last_space.host_dxorg),
            },
          )
      end

      it "creates a guest org" do
        expect(WebMock).to have_requested(
          :post,
          "#{DNANEXUS_APISERVER_URI}#{last_space.guest_dxorg}/describe",
        )
        expect(WebMock).
          to have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}org/new",
          ).
          with(
            body: {
              handle: Org.handle_by_id(last_space.guest_dxorg),
              name: Org.handle_by_id(last_space.guest_dxorg),
            },
          )
      end

      it "invites admins" do
        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.host_dxorg}/invite").
          with(
            body: {
              invitee: host_lead.dxid,
              level: "ADMIN",
              suppressEmailNotification: true,
            },
          )

        expect(WebMock).
          to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{last_space.guest_dxorg}/invite").
          with(
            body: {
              invitee: guest_lead.dxid,
              level: "ADMIN",
              suppressEmailNotification: true,
            },
          )
      end

      it "removes members from orgs" do
        expect(WebMock).
          to have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}#{last_space.host_dxorg}/removeMember",
          ).
          with(body: { user: ADMIN_USER })

        expect(WebMock).
          to have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}#{last_space.guest_dxorg}/removeMember",
          ).
          with(body: { user: ADMIN_USER })
      end

      it "creates a space_memberships" do
        expect(last_space.space_memberships.lead.host.count).to eq(1)
        expect(last_space.space_memberships.lead.guest.count).to eq(1)
      end
    end

    context "when type is review" do
      before { post :create, params: { space: review_space_params } }

      let(:cooperative_space) { Space.first }
      let(:confidential_space) { Space.confidential.first }

      it "creates a space" do
        expect_valid(:space)
        expect(Space.count).to eq(2)
      end

      context "with cooperative space" do
        it "creates a new host org" do
          expect(WebMock).to have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}#{cooperative_space.host_dxorg}/describe",
          )
          expect(WebMock).
            to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").
            with(
              body: {
                handle: Org.handle_by_id(cooperative_space.host_dxorg),
                name: Org.handle_by_id(cooperative_space.host_dxorg),
              },
            )
        end

        it "creates a new guest org" do
          expect(WebMock).to have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}#{cooperative_space.guest_dxorg}/describe",
          )
          expect(WebMock).
            to have_requested(:post, "#{DNANEXUS_APISERVER_URI}org/new").
            with(
              body: {
                handle: Org.handle_by_id(cooperative_space.guest_dxorg),
                name: Org.handle_by_id(cooperative_space.guest_dxorg),
              },
            )
        end

        it "invites host admin" do
          expect(WebMock).
            to have_requested(
              :post,
              "#{DNANEXUS_APISERVER_URI}#{cooperative_space.host_dxorg}/invite",
            ).
            with(
              body: {
                invitee: host_lead.dxid,
                level: "ADMIN",
                suppressEmailNotification: true,
              },
            )
        end

        it "invites guest admin" do
          expect(WebMock).
            to have_requested(
              :post,
              "#{DNANEXUS_APISERVER_URI}#{cooperative_space.guest_dxorg}/invite",
            ).
            with(
              body: {
                invitee: sponsor_lead.dxid,
                level: "ADMIN",
                suppressEmailNotification: true,
              },
            )
        end
      end

      context "with confidential space" do
        it "creates a new project" do
          expect(WebMock).
            to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").
            with(
              body: {
                name: "precisionfda-space-#{confidential_space.id}-REVIEWER-PRIVATE",
                billTo: review_space_admin.billto,
              },
            )
        end

        it "invites host contributor" do
          expect(WebMock).
            to have_requested(
              :post,
              "#{DNANEXUS_APISERVER_URI}#{confidential_space.host_project}/invite",
            ).
            with(
              body: {
                invitee: confidential_space.host_dxorg,
                level: "CONTRIBUTE",
                suppressEmailNotification: true,
                suppressAllNotifications: true,
              },
            )
        end

        it "invites a developer contributor" do
          expect(WebMock).
            to have_requested(
              :post,
              "#{DNANEXUS_APISERVER_URI}#{confidential_space.host_project}/invite",
            ).
            with(
              body: {
                invitee: Setting.review_app_developers_org,
                level: "CONTRIBUTE",
                suppressEmailNotification: true,
                suppressAllNotifications: true,
              },
            )
        end
      end

      it "creates a space_memberships" do
        expect(cooperative_space.space_memberships.lead.host.count).to eq(1)
        expect(cooperative_space.space_memberships.lead.guest.count).to eq(1)
      end
    end
  end

  describe "POST accept" do
    let(:space) do
      create(:space, :group, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
    end

    let(:guest_contribute_invite) do
      {
        invitee: space.guest_dxorg,
        level: "CONTRIBUTE",
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      }
    end

    let(:host_contribute_invite) do
      {
        invitee: space.host_dxorg,
        level: "CONTRIBUTE",
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      }
    end

    context "with host_admin" do
      before do
        authenticate!(host_lead)
        post :accept, params: { id: space.id }
        space.reload
      end

      it "creates a dnanexus project" do
        expect(space.host_project).to be_present

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").
          with(
            body: {
              name: "precisionfda-space-#{space.id}-HOST",
              billTo: host_lead.billto,
            },
          )
      end

      it "invites hosts" do
        expect(WebMock).to have_requested(
          :post,
          "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-HOST/invite",
        ).with(body: host_contribute_invite)

        expect(WebMock).to have_requested(
          :post,
          "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-HOST/invite",
        ).with(body: guest_contribute_invite)
      end

      context "when review space" do
        let(:space) do
          create(:space, :review, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
        end

        it "adds user to the membership" do
          expect(WebMock).not_to have_requested(:any, /.*/)

          private_space = space.confidential_spaces.reviewer.first
          expect(private_space.space_memberships.count).to eq(1)
        end
      end
    end

    context "with guest_admin" do
      before do
        authenticate!(guest_lead)
        post :accept, params: { id: space.id }

        space.reload
      end

      it "creates a dnanexus project" do
        expect(space.guest_project).to be_present

        expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").
          with(
            body: {
              name: "precisionfda-space-#{space.id}-GUEST",
              billTo: guest_lead.billto,
            },
          )
      end

      it "invites guests" do
        expect(WebMock).to(
          have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-GUEST/invite",
          ).with(body: guest_contribute_invite),
        )

        expect(WebMock).to(
          have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-GUEST/invite",
          ).with(body: host_contribute_invite),
        )
      end

      context "when review space" do
        before do
          post :accept, params: { id: space.id }

          space.reload
        end

        let(:space) do
          create(:space, :review, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
        end

        it "creates a dnanexus project" do
          expect(space.guest_project).to be_present

          expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").
            with(
              body: {
                name: "precisionfda-space-#{space.id}-GUEST",
                billTo: guest_lead.billto,
              },
            )
        end

        it "invites guests" do
          expect(WebMock).to have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-GUEST/invite",
          ).with(body: guest_contribute_invite)

          expect(WebMock).to have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}project-precisionfda-space-#{space.id}-GUEST/invite",
          ).with(body: host_contribute_invite)
        end
      end

      context "when private review space" do
        before do
          post :accept, params: { id: space.id }

          space.reload
        end

        let(:space) do
          create(:space, :review, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
        end
        let(:private_space) { space.confidential_spaces.sponsor.first }

        it "creates a dnanexus project" do
          expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}project/new").
            with(
              body: {
                name: "precisionfda-space-#{private_space.id}-GUEST-PRIVATE",
                billTo: guest_lead.billto,
              },
            )
          expect(private_space.guest_project).to be_present
          expect(private_space.guest_dxorg).to be_present
        end

        it "invites a guest" do
          call_string = "project-precisionfda-space-#{private_space.id}-GUEST-PRIVATE/invite"
          expect(WebMock).to have_requested(
            :post,
            "#{DNANEXUS_APISERVER_URI}#{call_string}",
          ).with(
            body: {
              invitee: private_space.guest_dxorg,
              level: "CONTRIBUTE",
              suppressEmailNotification: true,
              suppressAllNotifications: true,
            },
          )
        end

        it "creates a membership" do
          expect(private_space.space_memberships.count).to eq(1)
        end
      end
    end
  end

  describe "jobs" do
    let(:space) do
      create(:space, :group, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
    end

    let(:app) { create(:app, scope: space.uid, user_id: host_lead.id) }
    let(:jobs_size) { 2 }

    before do
      authenticate!(host_lead)

      create_list(:job, jobs_size, scope: space.uid, app_id: app.id, user: host_lead)
    end

    it "renders jobs" do
      get :jobs, params: { id: space }

      expect(response).to be_successful
      expect(parsed_response["jobs"].size).to eq(jobs_size)
    end
  end
end
