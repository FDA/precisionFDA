require "rails_helper"

RSpec.describe Api::AppsController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }
  let(:admin) { create(:user, :admin) }
  let(:asset) { create(:asset, dxid: "file-test", user_id: user.id) }

  let(:input) do
    [{ name: "anything", class: "string", optional: false, label: "anything", help: "anything" }]
  end

  let(:output) do
    [{ name: "my_file", class:  "file", optional: false, label: "my_file", help: "my_file" }]
  end

  describe "POST copy" do
    let(:space) { create(:space, :review, :active, host_lead_id: user.id) }
    let(:apps) { create_list(:app, 2, user: user) }
    let(:copy_service) { instance_double(CopyService, copy: []) }

    before do
      authenticate!(user)

      allow(CopyService).to receive(:new).and_return(copy_service)
    end

    it "copies apps" do
      post :copy, params: { item_ids: apps.map(&:id), scope: space.scope }, format: :json

      expect(response).to be_successful

      apps.each do |app|
        expect(copy_service).to have_received(:copy).with(app, space.scope).exactly(1).times
      end
    end
  end

  describe "PUT feature" do
    context "when user is authenticated" do
      let(:latest_version_app) { create(:app, user: admin) }
      let(:app_series) { create(:app_series, latest_version_app: latest_version_app, user: admin) }
      let(:latest_revision_app) do
        create(:app, user: admin, app_series: app_series, scope: Scopes::SCOPE_PUBLIC)
      end

      before do
        authenticate!(admin)
      end

      it "feature apps" do
        put :invert_feature, params: { item_ids: latest_revision_app.uid,
                                       featured: true }, format: :json

        expect(response).to be_successful
        expect { latest_revision_app.reload }.to change(latest_revision_app,
                                                        :featured).from(false).to(true)
        expect { app_series.reload }.to change(app_series, :featured).from(false).to(true)
      end
    end

    context "when user is not authenticated" do
      let(:latest_version_app) { create(:app, user: user) }

      it "un-feature apps" do
        put :invert_feature, params: { item_ids: latest_version_app.uid }

        expect(response).to be_unauthorized
      end
    end
  end

  describe "POST delete" do
    context "when user is authenticated" do
      let(:latest_version_app) { create(:app, user: user) }
      let(:app_series) { create(:app_series, latest_version_app: latest_version_app, user: user) }
      let(:latest_revision_app) { create(:app, user: user, app_series: app_series) }

      before do
        authenticate!(user)
      end

      it "soft-delete apps" do
        post :soft_delete, params: { item_ids: latest_revision_app.uid }, format: :json

        expect(response).to be_successful
        expect { latest_revision_app.reload }.to change(latest_revision_app,
                                                        :deleted).from(false).to(true)
        expect { app_series.reload }.to change(app_series, :deleted).from(false).to(true)
      end
    end

    context "when user is not authenticated" do
      let(:latest_version_app) { create(:app, user: user) }

      it "soft-delete apps" do
        post :soft_delete, params: { item_ids: latest_version_app.uid }

        expect(response).to be_unauthorized
      end
    end
  end
end
