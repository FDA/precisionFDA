require "rails_helper"

describe UserService::HttpsAppsProjectsCreator do
  subject(:projects_creator) { described_class.new(api, user) }

  let(:api) { instance_double(DNAnexusAPI) }
  let!(:user) { create(:user) }

  describe "#call" do
    context "when user doesn't have https apps project in the database" do
      context "when project doesn't exist on the platform" do
        before do
          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            allow(api).to receive(:system_find_projects).and_return({ "results" => [] })
            allow(api).to receive(:project_new).with(project_name, billTo: user.billto).
              and_return({ "id" => "project-#{project_name}" })
          end
        end

        it "creates project in the platform and updates user in the database" do
          projects_creator.call

          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            expect(api).to have_received(:project_new).with(project_name, billTo: user.billto)
            expect(user[project_name]).to eq("project-#{project_name}")
          end
        end
      end

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
        before do
          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            allow(api).to receive(:system_find_projects).and_return({ "results" => [] })
            allow(api).to receive(:project_new).with(project_name, billTo: user.billto).
              and_return({ "id" => "project-#{project_name}" })
          end
        end

        it "creates project in the platform and updates user in the database" do
          projects_creator.call

          UserService::HttpsAppsProjectsCreator::PROJECT_NAMES.each do |project_name|
            expect(api).to have_received(:project_new).with(project_name, billTo: user.billto)
            expect(user[project_name]).to eq("project-#{project_name}")
          end
        end
      end

      context "when project exist on the platform" do
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
  end
end
