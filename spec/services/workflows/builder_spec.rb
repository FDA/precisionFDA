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
    context "when a workflow is created through common way" do
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

    context "when a workflow is imported in CWL format" do
      before do
        allow_any_instance_of(AssetService).to receive(:upload)
        allow_any_instance_of(AssetService).to receive(:wait_for_asset_to_close)
        App.all.each do |app|
          stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{app.dxid}/describe")
              .to_return(body: "{\"details\":{\"ordered_assets\":[]}}")
          stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{app.dxid}/update")
              .to_return(body: "{}")
        end
      end

      let(:docker_images) do
        [
        ActionDispatch::Http::UploadedFile.new(
            {
                filename: "wtsicgp_dockstore-cgp-chksum_0.1.0.tar.gz",
                tempfile: Tempfile.new("wtsicgp_dockstore-cgp-chksum_0.1.0.tar.gz")
            }
        ),
        ActionDispatch::Http::UploadedFile.new(
            {
                filename: "wtsicgp_dockstore-cgp-chksum_0.2.0.tar.gz",
                tempfile: Tempfile.new("wtsicgp_dockstore-cgp-chksum_0.2.0.tar.gz")
            }
        )
        ]
      end
      let(:presenter_params) do
        {
          file: IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")),
          attached_images: docker_images
        }
      end
      let(:workflow_presenter) { Workflow::CwlPresenter.new(presenter_params, context) }

      it "create a workflow" do
        expect{ service_response }.to change(Workflow, :count).by(1)
      end

      it "create an asset" do
        expect{ service_response }.to change(Asset, :count).by(2)
      end
    end

    context "when a workflow is imported in CWL format" do
      before do
        allow_any_instance_of(AssetService).to receive(:upload)
        allow_any_instance_of(AssetService).to receive(:wait_for_asset_to_close)
        stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{App.second.dxid}/describe")
            .to_return(body: "{\"details\":{\"ordered_assets\":[]}}")
        stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{App.second.dxid}/update")
            .to_return(body: "{}")
      end

      let(:docker_image) do
        ActionDispatch::Http::UploadedFile.new(
            {
                filename: "wtsicgp_dockstore-cgp-chksum_0.1.0.tar.gz",
                tempfile: Tempfile.new("wtsicgp_dockstore-cgp-chksum_0.1.0.tar.gz")
            }
        )
      end
      let(:presenter_params) do
        {
          file: IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")),
          attached_images: [docker_image]
        }
      end
      let(:workflow_presenter) { Workflow::CwlPresenter.new(presenter_params, context) }

      it "create a workflow" do
        expect{ service_response }.to change(Workflow, :count).by(1)
      end

      it "create an asset" do
        expect{ service_response }.to change(Asset, :count).by(1)
      end
    end
  end
end