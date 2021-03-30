require "rails_helper"

RSpec.shared_examples "not_public_app" do
  context "when app scope is not public" do
    let(:app) { create(:app, user: user, scope: App::SCOPE_PRIVATE) }
    let(:back_path) { "http://test.host/apps/#{app.uid}" }

    before do
      post client_method, params: { dxid: app.dxid }
    end

    it "redirects back" do
      expect(response).to redirect_to(back_path)
    end
  end
end

RSpec.shared_examples "not_admin_user" do
  context "when user is not admin" do
    before do
      authenticate!(user)
      post client_method, params: { dxid: app.dxid }
    end

    it "returns 403 status code" do
      expect(response).to redirect_to(root_path)
    end
  end
end

RSpec.describe Admin::AppsController, type: :controller do
  let(:admin) { create(:user, :admin) }
  let(:user) { create(:user) }
  let(:wrong_app) { create(:app, user: user, scope: App::SCOPE_PUBLIC, spec: { input_spec: {} }) }
  let(:app) { create(:app, user: user, scope: App::SCOPE_PUBLIC, spec: app_spec) }
  let(:comparison_key) { Setting::COMPARISON_APP }

  let(:app_spec) do
    {
      input_spec: [
        { class: "file", name: "test_file" },
        { class: "file", name: "benchmark_file" },
      ],
      output_spec: [
        { class: "file", name: "some_html_report" },
      ],
    }
  end

  describe "POST add_to_comparators" do
    let(:client_method) { :add_to_comparators }

    it_behaves_like "not_admin_user"

    context "when user is admin" do
      # rubocop:disable RSpec/AnyInstance
      before do
        authenticate!(admin)
        allow_any_instance_of(User).to receive(:can_administer_site?).and_return(true)
      end
      # rubocop:enable RSpec/AnyInstance

      context "when app has no test input" do
        it "fails to add app to list" do
          expect(Setting.comparator_apps).to be_empty

          post client_method, params: { dxid: wrong_app.dxid }

          expect(response).not_to be_successful
          expect(Setting.comparator_apps).to be_empty
        end
      end

      context "when app has no html output" do
        it "fails to add app to list" do
          expect(Setting.comparator_apps).to be_empty

          post client_method, params: { dxid: wrong_app.dxid }

          expect(response).not_to be_successful
          expect(Setting.comparator_apps).to be_empty
        end
      end

      context "when app has test and benchmark inputs and html output" do
        it "adds app to comparators list" do
          expect(Setting.comparator_apps).to be_empty

          post client_method, params: { dxid: app.dxid }

          expect(response).to be_successful
          expect(Setting.comparator_apps).to eq([app.dxid])
        end
      end

      context "when comparators list already includes apps" do
        let(:comparator_app) { "app-1" }

        before do
          Setting[Setting::COMPARATOR_APPS] = [comparator_app]
        end

        it "adds app to comparators list" do
          post client_method, params: { dxid: app.dxid }

          expect(response).to be_successful
          expect(Setting.comparator_apps).to eq([comparator_app, app.dxid])
        end
      end

      it_behaves_like "not_public_app"
    end
  end

  describe "POST remove_from_comparators" do
    let(:client_method) { :remove_from_comparators }

    it_behaves_like "not_admin_user"

    context "when user is admin" do
      let(:comparator_app) { "app-1" }

      # rubocop:disable RSpec/AnyInstance
      before do
        authenticate!(admin)
        allow_any_instance_of(User).to receive(:can_administer_site?).and_return(true)

        Setting[Setting::COMPARATOR_APPS] = [comparator_app, app.dxid]
      end
      # rubocop:enable RSpec/AnyInstance

      it "removes app from comparators list" do
        expect(Setting.comparator_apps).to eq([comparator_app, app.dxid])

        post client_method, params: { dxid: app.dxid }

        expect(response).to be_successful
        expect(Setting.comparator_apps).to eq([comparator_app])
      end

      context "when app is a default comparator" do
        before do
          Setting[comparison_key] = app.dxid
        end

        it "remove app from the default comparator" do
          expect(Setting.comparator_apps).to eq([comparator_app, app.dxid])

          post client_method, params: { dxid: app.dxid }

          expect(Setting.comparator_apps).to eq([comparator_app])
          expect(Setting[comparison_key]).to be_nil
        end
      end

      it_behaves_like "not_public_app"
    end
  end

  describe "POST set_comparison_app" do
    let(:client_method) { :set_comparison_app }

    it_behaves_like "not_admin_user"

    context "when user is admin" do
      # rubocop:disable RSpec/AnyInstance
      before do
        authenticate!(admin)
        allow_any_instance_of(User).to receive(:can_administer_site?).and_return(true)
      end
      # rubocop:enable RSpec/AnyInstance

      context "when app is in the comparators list" do
        before do
          Setting[Setting::COMPARATOR_APPS] = [app.dxid]
        end

        it "sets default comparison app" do
          expect(Setting[comparison_key]).to be_nil

          post client_method, params: { dxid: app.dxid }

          expect(Setting[comparison_key]).to eq(app.dxid)
        end
      end

      context "when app is not in the comparators list" do
        before do
          Setting[Setting::COMPARATOR_APPS] = []
        end

        it "doesn't set a default comparison app" do
          expect(Setting[comparison_key]).to be_nil

          post client_method, params: { dxid: app.dxid }

          expect(Setting[comparison_key]).to be_nil
        end
      end

      context "when app is a global default comparator" do
        before do
          Setting[comparison_key] = "app-999"
        end

        it "removes a default comparator app" do
          expect(Setting[comparison_key]).to eq("app-999")

          stub_const("DEFAULT_COMPARISON_APP", app.dxid)

          post client_method, params: { dxid: app.dxid }

          expect(Setting[comparison_key]).to be_nil
        end
      end

      it_behaves_like "not_public_app"
    end
  end
end
