RSpec.describe AnalysesController, type: :controller do
  let(:user) { create(:user) }
  let(:workflow) { create(:workflow, user: user) }

  describe "GET new" do
    before do
      authenticate!(user)
      allow(Users::ChargesFetcher).to receive(:exceeded_charges_limit?).and_return(false)
    end

    it "returns a workflow" do
      get "new", params: { workflow_id: workflow.uid }

      expect(response).to be_successful
    end

    context "when user exceeds charges limit" do
      before do
        allow(Users::ChargesFetcher).to receive(:exceeded_charges_limit?).and_return(true)
      end

      it "redirects with an error" do
        get "new", params: { workflow_id: workflow.uid }

        expect(response).to have_http_status(:found)
        expect(flash[:error]).to include(I18n.t("api.errors.exceeded_charges_limit"))
      end
    end
  end
end
