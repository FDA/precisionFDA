require "rails_helper"

RSpec.describe SpaceService::ProjectBuilders::VerificationSpace, type: :service do
  let(:service_response) do
    described_class.new(DNAnexusAPI.new(SecureRandom.uuid)).create(space, space.leads.host.first)
  end

  let(:host_lead) { create(:user) }
  let(:space) { create(:space, :verification, host_lead_id: host_lead.id) }
  let(:project) { "project-precisionfda-space-#{space.id}-HOST" }
  let(:response_path) { "#{DNANEXUS_APISERVER_URI}#{project}/invite" }

  before do
    rack = PlatformRack.new
    stub_request(:any, /^#{rack.path}/).to_rack(rack)
  end

  describe ".create" do
    it "sets host project" do
      expect { service_response }.to change(space, :host_project).to(project)
    end

    context "when guest org is not empty" do
      before { service_response }

      it "sends response to create guest org on the platform" do
        expect(WebMock).to have_requested(:post, response_path).with(body: {
          invitee: space.guest_dxorg,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true,
        })
      end
    end

    context "when guest org is empty" do
      before do
        space.update(guest_dxorg: nil)
        service_response
      end

      it "does not send response to create guest org on the platform" do
        expect(WebMock).not_to have_requested(:post, response_path).with(body: {
          invitee: space.guest_dxorg,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true,
        })
      end
    end

    context "when guest org is the same as host org" do
      before do
        space.update(guest_dxorg: space.host_dxorg)
        service_response
      end

      it "send response to create host org on the platform once" do
        expect(WebMock).to have_requested(:post, response_path).with(body: {
          invitee: space.guest_dxorg,
          level: "CONTRIBUTE",
          suppressEmailNotification: true,
          suppressAllNotifications: true,
        }).once
      end
    end
  end
end
