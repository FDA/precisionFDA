require "rails_helper"

RSpec.describe Api::AppsController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }
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

  describe "POST create" do
    before do
      authenticate!(user)

      post :create, params: {
        name:   "test-name",
        title:  "test-title",
        readme: "test-readme",
        internet_access: false,
        instance_type: "baseline-8",
        ordered_assets: [asset.uid],
        packages: %w(ikiwiki),
        code: "test-code",
        is_new: true,
        input_spec: input,
        output_spec: output,
        release: UBUNTU_14,
      }, as: :json
    end

    it "creates an applet" do
      expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}applet/new").with(body: {
        project: "project-test",
        inputSpec: [{ name: "anything", class: "string", optional: false,
                      label: "anything", help: "anything" }],
        outputSpec: [{ name: "my_file", class: "file", optional: false,
                       label: "my_file", help: "my_file" }],
        runSpec: {
          code: "dx cat project-Bk0YZkj0YkbBg6bk38PzQkVV:/appkit.tgz | " \
                 "tar -z -x -C / --no-same-owner --no-same-permissions -f " \
                 "-\nsource /usr/lib/app-prologue\ntest-code\n{ set +x; } " \
                 "2\u003e/dev/null\nsource /usr/lib/app-epilogue\n",
          interpreter: "bash",
          systemRequirements: { "*": { instanceType: "mem1_ssd1_x8_fedramp" } },
          distribution: "Ubuntu", release: "14.04", execDepends: [{ name: "ikiwiki" }]
        },
        dxapi: "1.0.0",
        access: {},
      })
    end

    it "creates an app" do
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
        billTo: user.billto,
        access: {},
      })

      expect(response).to have_http_status(200)

      expect(last_app).to have_attributes(
        "instance_type" => "baseline-8",
        "internet_access" => false,
        "code" => "test-code",
        "scope" => "private",
      )
    end

    it "removes an applet" do
      expect(WebMock).to(
        have_requested(
          :post,
          "#{DNANEXUS_APISERVER_URI}project-test/removeObjects",
        ).with(
          body: { objects: [nil] },
        ),
      )
    end

    it "creates an event" do
      expect(Event::AppCreated.count).to eq(1)
      expect(Event::AppCreated.first.param1).to eq(last_app.dxid)
    end
  end
end
