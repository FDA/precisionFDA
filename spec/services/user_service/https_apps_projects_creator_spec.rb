require "rails_helper"

describe UserService::HttpsAppsProjectsCreator do
  subject(:projects_creator) { described_class.new(api, user) }

  let(:api) { instance_double(DNAnexusAPI) }
  let(:billable) { "org-pfda..https" }
  let!(:user) { create(:user) }

  describe "#call" do
    before do
      allow(api).to receive(:system_find_orgs).
        with(id: [billable], level: DNAnexusAPI::ORG_MEMBERSHIP_MEMBER).
        and_return({ "results" => [{ "id" => billable }] })
    end

    around do |example|
      with_environment "HTTPS_APPS_BILL_TO" => billable do
        example.run
      end
    end

    shared_examples_for "project doesn't exist on the platform" do
      context "when project doesn't exist on the platform" do
        before do
          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            allow(api).to receive(:system_find_projects).and_return({ "results" => [] })
            allow(api).to receive(:project_new).with(project_name, billTo: billable).
              and_return({ "id" => "project-#{project_name}" })
          end
        end

        it "creates project in the platform and updates user in the database" do
          projects_creator.call

          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            expect(api).to have_received(:project_new).with(project_name, billTo: billable)
            expect(user[project_name]).to eq("project-#{project_name}")
          end
        end
      end
    end

    context "when user doesn't have https apps project in the database" do
      it_behaves_like "project doesn't exist on the platform"

      context "when project exists on the platform" do
        before do
          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            allow(api).to receive(:system_find_projects).with(name: project_name, limit: 1).
              and_return({ "results" => [{ "id" => "project-#{project_name}" }] })
            allow(api).to receive(:project_new)
          end
        end

        it "find project and updates user in the database" do
          projects_creator.call

          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            expect(api).not_to have_received(:project_new)
            expect(user[project_name]).to eq("project-#{project_name}")
          end
        end
      end
    end

    context "when user has https apps project in the database" do
      before do
        UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
          user.update!(project_name => "project-#{project_name}")
        end
      end

      context "when project doesn't exist on the platform" do
        it_behaves_like "project doesn't exist on the platform"
      end

      context "when project exists on the platform" do
        before do
          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            allow(api).to receive(:system_find_projects).
              with(id: ["project-#{project_name}"], limit: 1).
              and_return({ "results" => [{ "id" => "project-#{project_name}" }] })
            allow(api).to receive(:project_new)
          end
        end

        it "skips projects creation" do
          projects_creator.call

          expect(api).not_to have_received(:project_new)
        end
      end
    end

    context "when user is not a member of billable org" do
      before do
        allow(api).to receive(:system_find_orgs).
          with(id: [billable], level: DNAnexusAPI::ORG_MEMBERSHIP_MEMBER).
          and_return({ "results" => [] })

        allow(api).to receive(:system_find_projects)
        allow(api).to receive(:project_new)
      end

      it "skips projects creation" do
        projects_creator.call

        expect(api).not_to have_received(:system_find_projects)
        expect(api).not_to have_received(:project_new)
      end
    end

    it "throws if HTTPS_APPS_BILL_TO environment variable is not set" do
      with_environment "HTTPS_APPS_BILL_TO" => nil do
        expect { projects_creator.call }.to raise_error(RuntimeError)
      end
    end
  end
end
