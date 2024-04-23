RSpec.describe AppsController, type: :controller do
  let(:user) { create(:user, dxuser: "user", job_limit: 100, resources: CloudResourceDefaults::RESOURCES) }
  let(:app) { create(:app, user_id: user.id, input_spec: input) }
  let(:input) do
    [{ name: "anything", class: "string", optional: false, label: "anything", help: "anything" }]
  end

  describe "POST run" do
    before do
      authenticate!(user)
      allow(Users::ChargesFetcher).to receive(:exceeded_charges_limit?).and_return(false)
    end

    context "when user exceeded charges limit" do
      before do
        allow(Users::ChargesFetcher).to receive(:exceeded_charges_limit?).and_return(true)
      end

      it "responds with an error" do
        post :run, format: :json

        expect(response.status).to eq(422)
        expect(parsed_response["error"]["message"]).to \
          include(I18n.t("api.errors.exceeded_charges_limit"))
      end
    end
  end

  describe "GET batch_app" do
    before do
      authenticate!(user)
    end

    context "when user exceeded charges limit" do
      before do
        allow(Users::ChargesFetcher).to receive(:exceeded_charges_limit?).and_return(true)
      end

      it "responds with an error" do
        get :batch_app, params: { id: app.uid }

        expect(response).to have_http_status(:found)
        expect(flash[:error]).to include(I18n.t("api.errors.exceeded_charges_limit"))
      end
    end
  end
end
