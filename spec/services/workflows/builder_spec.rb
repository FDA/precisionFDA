require 'rails_helper'
include Imports::WorkflowHelper

RSpec.describe Workflows::Builder, type: :service do
  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:raw) { params }
  let(:builder) { described_class.new(workflow_presenter) }
  let(:service_response) { builder.call }
  let(:workflow_presenter) { Workflow::Presenter.new(raw, context) }

  before do
    create(:app, dxid:  raw["slots"].second["uid"].split("-1").first, user_id: user.id)
    create(:app, dxid:  raw["slots"].first["uid"].split("-1").first, user_id: user.id)
    rack = PlatformRack.new
    stub_request(:any, /^#{rack.path}/).to_rack(rack)
    allow_any_instance_of(Context).to receive(:logged_in?).and_return(true)
  end

  describe "#call" do
    it "sends a request to platform" do
      service_response
      expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}workflow/new")
        .with(body: workflow_presenter.build)
    end

    it "create workflow" do
      expect{ service_response }.to change(Workflow, :count).by(1)
    end

    it "create workflow with params" do
      service_response
      WorkflowSeries.last.destroy
      attributes = builder.spec_presenter.build.
          merge(dxid: "workflow-1", edit_version: "0")
      expect(Workflow.last).to have_attributes(attributes)
    end
  end
end
