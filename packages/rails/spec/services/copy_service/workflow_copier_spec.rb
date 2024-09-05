require "rails_helper"

RSpec.describe CopyService::WorkflowCopier, type: :service do
  subject(:copier) { described_class.new(api: api, user: user) }

  let(:user) { create(:user) }
  let(:api) { instance_double(DNAnexusAPI) }
  let(:source_space) { create(:space, :review, :accepted, host_lead_id: user.id) }
  let(:target_space) { create(:space, :review, :accepted, host_lead_id: user.id) }
  let(:input_file) { create(:user_file, name: "input_file", scope: source_space.uid, user: user) }

  before do
    allow(api).to receive(:system_find_data_objects).
      and_return({ "results" => [{ "project" => "project-id", "id" => "workflow-id" }], "next" => nil })
    allow(api).to receive(:project_clone)
    allow(api).to receive(:applet_new).and_return({ "id" => "applet-id" })
    allow(api).to receive(:workflow_describe).and_return(
      {
        "stages" => [
          {
            "id" => "stage-id",
            "app_dxid" => "app-dxid",
          },
        ],
      },
    )
    allow(api).to receive(:app_describe).and_return(
      {
        "name" => "app-name",
        "version" => "app-version",
      },
    )
    allow(api).to receive(:workflow_update_executable)
  end

  describe "#copy" do
    let(:app_input) do
      [
        { class: "file", help: "anything", label: "file1", name: "file_input_name", optional: false, \
          choices: nil, requiredRunInput: false, default: nil },
      ]
    end
    let(:app) do
      create(:app,
             user_id: user.id,
             input_spec: app_input,
             internet_access: false,
             instance_type: "baseline-8",
             packages: [{ name: "package" }],
             code: "emit os1 'Test App Outpit:-->'$s1' and '$s2\nemit oi1 $i2")
    end
    let(:workflow_inputs) do
      [
        { class: "file", label: "file1", name: "file_input_name", optional: false, requiredRunInput: false, \
          defaultValues: nil, \
          default_workflow_value: input_file.uid },
      ]
    end
    let(:workflow_spec) do
      {
        input_spec:
          {
            stages:
              [
                {
                  name: app.title,
                  prev_slot: nil,
                  next_slot: nil,
                  app_dxid: app.dxid,
                  app_uid: app.uid,
                  inputs: workflow_inputs,
                  instanceType: "baseline-8",
                  stageIndex: 0,
                },
              ],
          },
      }
    end
    let(:workflow) { create(:workflow, user_id: user.id, spec: workflow_spec) }

    before do
      allow(api).to receive(:app_new).and_return({ "id" => "app-id" })
      allow(api).to receive(:project_remove_objects)
      allow(api).to receive(:app_add_authorized_users)
      allow(api).to receive(:app_add_developers)
    end

    it "copy workflow default input files to correct space" do
      loaded_from_db = Workflow.find_by!(uid: workflow.uid)

      copied_workflow = copier.copy(loaded_from_db, target_space.uid)

      copied_input_file_uid =  copied_workflow.spec["input_spec"]["stages"][0]["inputs"][0]["default_workflow_value"]
      copied_input_file = UserFile.find_by!(uid: copied_input_file_uid)

      expect(copied_input_file.dxid).to eq(input_file.dxid)
      expect(copied_input_file.id).not_to eq(input_file.id)
      expect(copied_input_file.scope).to eq(target_space.uid)
    end
  end
end
