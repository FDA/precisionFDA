require "rails_helper"
# rubocop:disable RSpec/AnyInstance

RSpec.describe FilesController, type: :controller do
  let!(:user) { create(:user, dxuser: "test") }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:file_one) { create(:user_file, :private) }
  let(:test_host_url) { "http://test.host" }

  describe "POST download" do
    let(:params) { { id: file_one.uid, inline: true } }
    let(:api_params) do
      {
        project: file_one.project,
        preauthenticated: true,
        filename: file_one.name,
        duration: 86_400,
      }
    end

    before do
      authenticate!(user)
      allow(UserFile).to receive(:exist_refresh_state).and_return(file_one)
      allow_any_instance_of(UserFile).to receive(:file_url).and_return("url")
    end

    it "does not raise an exception" do
      post :download, params: params
    end

    it "redirects to url and show a file" do
      post :download, params: params
      expect(response).to redirect_to "url"
    end

    context "when file is not 'closed'" do
      before { file_one.update(state: "open") }

      it "raise an exception" do
        post :download, params: params
        expect(request.flash[:error]).
          to eq "Files can only be downloaded if they are in the 'closed' state"
      end

      it "redirects to file url" do
        post :download, params: params
        expect(response).to redirect_to test_host_url.concat "/files/#{file_one.uid}"
      end
    end
  end

  describe "POST link" do
    let(:params) { { id: file_one.uid, inline: true } }
    let(:api_params) do
      {
        project: file_one.project,
        preauthenticated: true,
        filename: file_one.name,
        duration: 86_400,
      }
    end

    before do
      authenticate!(user)
      allow(UserFile).to receive(:exist_refresh_state).and_return(file_one)
      allow_any_instance_of(UserFile).to receive(:file_url).and_return("url")
    end

    it "does not raise an exception" do
      post :link, params: params
    end

    it "does not redirects to url" do
      post :link, params: params
      expect(response).not_to redirect_to "url"
    end

    it "returns a http_status 200" do
      post :link, params: params
      expect(response).to have_http_status(200)
    end

    context "when file is not 'closed'" do
      before { file_one.update(state: "open") }

      it "raise an exception" do
        post :link, params: params
        expect(request.flash[:error]).
          to eq "Files can only be downloaded if they are in the 'closed' state"
      end

      it "redirects to file url" do
        post :link, params: params
        expect(response).to redirect_to test_host_url.concat "/files/#{file_one.uid}"
      end
    end
  end
  # rubocop:enable RSpec/AnyInstance
end
