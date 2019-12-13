require "rails_helper"

RSpec.describe ProfileController, type: :controller do
  # rubocop:disable RSpec/AnyInstance
  before do
    authenticate!(site_admin)
    allow_any_instance_of(User).to receive(:can_administer_site?).and_return(true)
    allow(DNAnexusAPI).to receive(:email_exists?).and_return(false)
  end
  # rubocop:enable RSpec/AnyInstance

  let(:controller) { instance_double(described_class) }
  let(:site_admin) { create(:user, :admin, dxuser: "user_site_admin") }
  let!(:invitation) { create(:invitation, org: nil) }
  let(:last_name) { invitation.last_name }
  let(:first_name) { invitation.first_name }
  let!(:constructed_username) do
    "#{first_name.downcase.gsub(/[^a-z]/, '')}.#{last_name.downcase.gsub(/[^a-z]/, '')}"
  end
  let(:view_path) { "profile/provision_new_user" }
  let(:view_step2_path) { "profile/provision_new_user/_step_2" }

  describe "new user provisioning" do
    context "when Step 1 starts" do
      before { get :provision_new_user }

      let(:view_step1_path) { "profile/provision_new_user/_step_1" }

      it "a new invitation created" do
        expect(Invitation.count).to eq 1
      end

      it "renders Step 1 with success" do
        expect(response).to have_http_status(200)
        expect(controller).to render_template(view_path)
        expect(controller).to render_template(view_step1_path)
      end
    end

    context "when Step 2 starts" do
      let(:step2_params) { { state: "step2", inv: invitation.id } }

      before { post :provision_new_user, params: step2_params }

      it "a new invitation created" do
        expect(Invitation.count).to eq 1
      end

      it "renders Step 2 with success" do
        expect(response).to have_http_status(200)
        expect(controller).to render_template(view_path)
        expect(controller).to render_template(view_step2_path)
      end
    end

    context "when Step 3 starts" do
      let(:view_step3_path) { "profile/provision_new_user/_step_3" }
      let(:step3_params) { { state: "step3", inv: invitation.id } }
      let(:dna_instance) { instance_double(DNAnexusAPI) }

      context "when user and email are not exists" do
        before do
          invitation.update(user_id: nil)
          allow(dna_instance).
            to receive(:user_exists?).with(constructed_username).and_return(false)
          allow(DNAnexusAPI).
            to receive(:email_exists?).with(invitation.email).and_return(false)

          post :provision_new_user, params: step3_params
        end

        it "renders Step 3 with success" do
          expect(response).to have_http_status(200)
          expect(controller).to render_template(view_path)
          expect(controller).to render_template(view_step3_path)
        end
      end

      context "when email already exists" do
        let(:editable_params) { User.provision_params(invitation.user_id) }

        before do
          allow(dna_instance).
            to receive(:user_exists?).with(constructed_username).and_return(false)

          allow(DNAnexusAPI).
            to receive(:email_exists?).with(editable_params[:email]).and_return(true)

          post :provision_new_user, params: step3_params
        end

        it "renders back to Step 2" do
          expect(response).to have_http_status(200)
          expect(controller).to render_template(view_path)
          expect(controller).to render_template(view_step2_path)
        end
      end
    end
  end
end
