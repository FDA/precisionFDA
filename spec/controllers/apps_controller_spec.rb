RSpec.describe AppsController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }
  let(:app) { create(:app, user_id: user.id, input_spec: input) }
  let(:input) do
    [{ name: "anything", class: "string", optional: false, label: "anything", help: "anything" }]
  end

  describe "POST run" do
    before do
      authenticate!(user)
    end

    it "runs an app" do
      expect(Event::JobRun).to receive(:create_for)

      post :run, params: {
        id: app.uid,
        name: "test-job",
        inputs: { anything: "foo" },
        instance_type: "himem-32",
      }

      expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{app.dxid}/run").with(body: {
        name: "test-job",
        input: { anything: "foo" },
        project: "project-test",
        timeoutPolicyByExecutable: {
          app.dxid => { "*": { days: 2 }}
        },
        singleContext: true,
        systemRequirements: {
          main: { instanceType: "mem3_ssd1_x32_fedramp" },
        },
      })

      expect(response).to have_http_status(200)
      expect(Job.count).to eql(1)
      expect(parsed_response["id"]).to_not be_nil
    end
  end
end
