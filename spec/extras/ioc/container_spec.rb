require "dry/container/stub"

RSpec.describe IOC::Container do
  subject(:container) { described_class.new(token, user) }

  let(:token) { "some-token" }
  let(:user) { build(:user) }

  describe "#resolve" do
    let(:user_api) { "User API implementation" }
    let(:admin_api) { "Admin API implementation" }
    let(:auth_api) { "Auth API implementation" }

    before do
      container.enable_stubs!
    end

    describe "APIs" do
      before do
        allow(DNAnexusAPI).to receive(:new).and_call_original
      end

      describe "api.admin" do
        it "resolves admin API" do
          expect(container.resolve("api.admin")).to be_instance_of(DNAnexusAPI)
          expect(DNAnexusAPI).to have_received(:new).with(ADMIN_TOKEN)
        end
      end

      describe("api.auth") do
        it "resolves auth API" do
          expect(container.resolve("api.auth")).to be_instance_of(DNAnexusAPI)
          expect(DNAnexusAPI).to have_received(:new).with(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
        end
      end
    end

    describe "Organizations" do
      before do
        container.stub("api.admin", admin_api)
        container.stub("api.auth", auth_api)
      end

      it "resolves user removal policy" do
        expect(container.resolve("orgs.user_removal_policy")).to eq(UserRemovalPolicy)
      end

      it "resolves member removal policy" do
        expect(container.resolve("orgs.member_removal_policy")).to eq(MemberRemovalPolicy)
      end

      it "resolves organization dissolve policy" do
        expect(container.resolve("orgs.org_dissolve_policy")).to eq(OrgDissolvePolicy)
      end

      describe "leave organization request creator" do
        let(:user_removal_policy) { "User removal policy" }

        before do
          allow(OrgService::LeaveOrgRequest).to receive(:new).and_call_original

          container.stub("orgs.user_removal_policy", user_removal_policy)
        end

        it "resolves leave organization creator" do
          expect(container.resolve("orgs.leave_org_request_creator")).
            to(be_instance_of(OrgService::LeaveOrgRequest))

          expect(OrgService::LeaveOrgRequest).
            to(have_received(:new).with(user_removal_policy))
        end
      end

      describe "remove member request creator" do
        let(:member_removal_policy) { "Member removal policy" }

        before do
          allow(OrgService::RemoveMemberRequest).to receive(:new).and_call_original

          container.stub("orgs.member_removal_policy", member_removal_policy)
        end

        it "resolves remove member request creator" do
          expect(container.resolve("orgs.remove_member_request_creator")).
            to(be_instance_of(OrgService::RemoveMemberRequest))

          expect(OrgService::RemoveMemberRequest).
            to(have_received(:new).with(member_removal_policy))
        end
      end

      describe "dissolve organization request creator" do
        let(:org_dissolve_policy) { "Organization dissolve policy" }

        before do
          allow(OrgService::DissolveOrgRequest).to receive(:new).and_call_original

          container.stub("orgs.org_dissolve_policy", org_dissolve_policy)
        end

        it "resolves organization dissolve request creator" do
          expect(container.resolve("orgs.dissolve_org_request_creator")).
            to(be_instance_of(OrgService::DissolveOrgRequest))

          expect(OrgService::DissolveOrgRequest).
            to(have_received(:new).with(org_dissolve_policy))
        end
      end

      describe "on-platform provisioner" do
        before do
          allow(OrgService::ProvisionOnPlatform).to receive(:new).and_call_original
        end

        it "resolves on-platform provisioner" do
          expect(container.resolve("orgs.on_platform_provisioner")).
            to(be_instance_of(OrgService::ProvisionOnPlatform))

          expect(OrgService::ProvisionOnPlatform).
            to(have_received(:new).with(admin_api, auth_api))
        end
      end

      describe "provisioner" do
        let(:provision_on_platform) { "Provision on platform" }

        before do
          allow(OrgService::Provision).to receive(:new).and_call_original

          container.stub("orgs.on_platform_provisioner", provision_on_platform)
        end

        it "resolves provisioner" do
          expect(container.resolve("orgs.provisioner")).
            to(be_instance_of(OrgService::Provision))

          expect(OrgService::Provision).to have_received(:new).with(provision_on_platform)
        end
      end
    end
  end
end
