require 'rails_helper'

RSpec.describe Api::AppsController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }
  let(:asset) { create(:asset, dxid: 'file-test', user_id: user.id) }

  let(:input) do
    [{ name: "anything", class: "string", optional: false, label: "anything", help: "anything" }]
  end

  let(:output) do
    [{ name:  "my_file", class:  "file", optional:  false, label:  "my_file", help:  "my_file" }]
  end

  describe "POST create" do
    before { authenticate!(user) }

    it "creates an app" do
      expect(Event::AppCreated).to receive(:create_for)

      post :create, {
        name: 'test-name',
        title: 'test-title',
        readme: 'test-readme',
        internet_access: false,
        instance_type: 'baseline-8',
        ordered_assets: [asset.uid],
        packages: ['ikiwiki'],
        code: 'test-code',
        is_new: true,
        input_spec: input,
        output_spec: output,
      }

      expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}applet/new").with(body: {
        project: "project-test",
        inputSpec: [
          { name: "anything", class: "string", optional: false, label: "anything", help: "anything" }
        ],
        outputSpec: [
          { name: "my_file", class: "file", optional: false, label: "my_file", help: "my_file" }
        ],
        runSpec: {
          code: "dx cat project-Bk0YZkj0YkbBg6bk38PzQkVV:/appkit.tgz | " \
                 "tar -z -x -C / --no-same-owner --no-same-permissions -f " \
                 "-\nsource /usr/lib/app-prologue\ntest-code\n{ set +x; } " \
                 "2\u003e/dev/null\nsource /usr/lib/app-epilogue\n",
          interpreter: "bash",
          systemRequirements: { "*": { instanceType: "mem1_ssd1_x8_fedramp" }},
          distribution: "Ubuntu",
          release: "14.04",
          execDepends: [{ name: "ikiwiki" }]
        },
        dxapi: "1.0.0",
        access: {}
      })

      expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}app/new").with(body: {
        applet: nil,
        name: "-user-test-name",
        title: "test-title ",
        summary: " ",
        description: "test-readme ",
        version: /r1-.*/,
        resources: ["file-test"],
        details: { ordered_assets: ["file-test"] },
        openSource: false,
        billTo: "org-pfda..org1",
        access: {},
      })

      expect(WebMock).to(
        have_requested(
          :post,
          "#{DNANEXUS_APISERVER_URI}project-test/removeObjects"
        ).with(
          body: { objects: [nil] }
        )
      )

      expect(App.where(title: 'test-title', readme: 'test-readme', scope: 'private',).first)
        .to be_present

      expect(last_app.instance_type).to eq('baseline-8')
      expect(last_app.internet_access).to eq(false)
      expect(last_app.code).to eq('test-code')
      expect(response).to have_http_status(200)
    end
  end
end
