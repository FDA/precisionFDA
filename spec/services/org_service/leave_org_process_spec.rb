RSpec.describe OrgService::LeaveOrgProcess do
  subject(:service) do
    described_class.new(user_api, admin_api, auth_api, policy, orgname_generator)
  end

  let(:user_api) { instance_double("DNAnexusAPI") }
  let(:admin_api) { instance_double("DNAnexusAPI") }
  let(:auth_api) { instance_double("DNAnexusAPI") }
  let(:policy) { double }
  let(:orgname_generator) { double }

  let(:private_files_project) { "private-files-project-dxid" }
  let(:private_comparisons_project) { "private-comparisons-project-dxid" }
  let(:public_files_project) { "public-files-project-dxid" }
  let(:public_comparisons_project) { "public-comparisons-project-dxid" }

  let(:old_private_files_project_name) { "old-private-files" }
  let(:old_private_comparisons_project_name) { "old-private-comparisons" }
  let(:old_public_files_project_name) { "old-public-files-project" }
  let(:old_public_comparisons_project_name) { "old-public-comparisons" }

  let(:new_private_files_project_name) do
    "precisionfda-personal-files-#{new_org_handle_base}"
  end

  let(:new_private_comparisons_project_name) do
    "precisionfda-personal-comparisons-#{new_org_handle_base}"
  end

  let(:new_public_files_project_name) do
    "precisionfda-public-files-#{new_org_handle_base}"
  end

  let(:new_public_comparisons_project_name) do
    "precisionfda-public-comparisons-#{new_org_handle_base}"
  end

  let(:new_org_handle_base) { "#{admin.first_name}.#{admin.last_name}".downcase }
  let(:new_org_handle) { "pfda..#{new_org_handle_base}" }
  let(:new_org_dxid) { "org-#{new_org_handle}" }
  let(:new_org_name) { "#{admin.first_name} #{admin.last_name}" }

  let(:new_org) { create(:org, handle: new_org_handle_base, name: new_org_name) }
  let!(:org) { create(:org) }
  let!(:admin) do
    create(:user,
           org: org,
           private_files_project: private_files_project,
           private_comparisons_project: private_comparisons_project,
           public_files_project: public_files_project,
           public_comparisons_project: public_comparisons_project)
  end

  describe("#call") do
    before do
      org.update!(admin: admin)
    end

    context "when admin which is not last member tries to leave an org" do
      before do
        create(:user, org: org)
      end

      it "raises AdminIsNotLastInOrgError" do
        expect { service.call(org, org.admin) }.
          to(raise_error(OrgService::Errors::AdminIsNotLastInOrgError))
      end
    end

    context "when member or last admin tries to leave an organization" do
      context "when policy is not satisfied" do
        before do
          allow(policy).to receive(:satisfied?).and_return(false)
        end

        it "raises RuntimeError" do
          expect { service.call(org, org.admin) }.
            to(raise_error(RuntimeError))
        end
      end

      context "when policy is satisfied" do
        before do
          allow(policy).to receive(:satisfied?).and_return(true)
          allow(admin_api).to receive_messages(
            org_new: nil,
            org_invite: nil,
            org_remove_member: nil,
          )
          allow(auth_api).to receive(:org_update_billing_info)
          allow(user_api).to receive_messages(project_update: nil)

          allow(user_api).to receive(:project_describe).
            with(private_files_project).
            and_return("name" => old_private_files_project_name)

          allow(user_api).to receive(:project_describe).
            with(private_comparisons_project).
            and_return("name" => old_private_comparisons_project_name)

          allow(user_api).to receive(:project_describe).
            with(public_files_project).
            and_return("name" => old_public_files_project_name)

          allow(user_api).to receive(:project_describe).
            with(public_comparisons_project).
            and_return("name" => old_public_comparisons_project_name)

          allow(Org).to receive(:create!).and_return(new_org)
          allow(admin).to receive(:update!)
          allow(orgname_generator).to receive(:call).and_return(new_org_handle_base)
        end

        it "doesn't raise error" do
          expect { service.call(org, admin) }.not_to raise_error
          expect(policy).to have_received(:satisfied?).with(org, admin)
        end

        it "provides new org" do
          service.call(org, admin)

          expect(admin_api).to have_received(:org_new).with(new_org_handle, new_org_name)
          expect(auth_api).to have_received(:org_update_billing_info).with(
            new_org_dxid,
            BILLING_INFO,
            autoConfirm: BILLING_CONFIRMATION,
          )
        end

        it "invites user to new org as admin" do
          service.call(org, admin)

          expect(admin_api).to have_received(:org_invite).with(
            new_org_dxid,
            admin.dxid,
            level: DNAnexusAPI::ORG_MEMBERSHIP_ADMIN,
            suppressEmailNotification: true,
          )
        end

        context "when org_invite raises self-invite error" do
          before do
            allow(admin_api).to receive(:org_invite).
              and_raise(Net::HTTPClientException.
                new("Cannot invite yourself to an organization", nil))
          end

          it "doesn't raise error" do
            expect { service.call(org, admin) }.not_to raise_error
          end
        end

        context "when org_invite raises not self-invite error" do
          before do
            allow(admin_api).to receive(:org_invite).
              and_raise(Net::HTTPClientException.new("Some error", nil))
          end

          it "re-raises error" do
            expect { service.call(org, admin) }.to raise_error(Net::HTTPClientException)
          end
        end

        it "renames new private projects" do
          service.call(org, admin)

          expect(user_api).to have_received(:project_update).
            with(admin.private_files_project, name: new_private_files_project_name)

          expect(user_api).to have_received(:project_update).
            with(admin.private_comparisons_project, name: new_private_comparisons_project_name)
        end

        it "renames new public projects" do
          service.call(org, admin)

          expect(user_api).to have_received(:project_update).
            with(admin.public_files_project, name: new_public_files_project_name)

          expect(user_api).to have_received(:project_update).
            with(admin.public_comparisons_project, name: new_public_comparisons_project_name)
        end

        it "stores new organization" do
          service.call(org, admin)

          expect(Org).to have_received(:create!).with(
            admin: admin,
            name: new_org_name,
            handle: new_org_handle_base,
            singular: true,
            state: "complete",
          )
        end

        it "updates user" do
          service.call(org, admin)

          expect(admin).to have_received(:update!).with(org: new_org)
        end

        # rubocop:disable RSpec/ExampleLength
        it "returns projects and organization properties mapping" do
          expect(service.call(org, admin)).to eq(
            projects: {
              private_files_project: {
                old: old_private_files_project_name,
                new: new_private_files_project_name,
              },
              private_comparisons_project: {
                old: old_private_comparisons_project_name,
                new: new_private_comparisons_project_name,
              },
              public_files_project: {
                old: old_public_files_project_name,
                new: new_public_files_project_name,
              },
              public_comparisons_project: {
                old: old_public_comparisons_project_name,
                new: new_public_comparisons_project_name,
              },
            },
            organizations: {
              dxid: {
                old: org.dxid,
                new: new_org.dxid,
              },
              handle: {
                old: org.handle,
                new: new_org.handle,
              },
              name: {
                old: org.name,
                new: new_org.name,
              },
            },
          )
        end
        # rubocop:enable RSpec/ExampleLength
      end
    end
  end
end
